import { studentProcedure } from "@/server/trpc";
import {
  codeExecutionInputSchema,
  batchcodeExecutionInputSchema,
  batchCodeExecutionResult,
  codeExecutionResult,
  testCaseExecutionResult,
} from "@/lib/schemas/data_schemas";
import { TRPCError } from "@trpc/server";
import z from "zod";

type OneCompilerInput = {
  language: string;
  stdin: string | string[];
  files: {
    name: string;
    content: string;
  }[];
};

const ONECOMPILER_DEFAULT_API_URL = "https://api.onecompiler.com/v1/run";

function getEnvValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    return undefined;
  }

  return value.replace(/^['"]|['"]$/g, "");
}

function getRunUrl(baseUrl: string) {
  const cleanUrl = baseUrl.replace(/\/+$/g, "");

  if (cleanUrl.endsWith("/run")) {
    return cleanUrl;
  }

  if (cleanUrl.endsWith("/v1") || cleanUrl.endsWith("/api/v1")) {
    return `${cleanUrl}/run`;
  }

  return `${cleanUrl}/api/v1/run`;
}

function getOneCompilerConfig(): { url: string; headers: Record<string, string> } {
  const oneCompilerApiKey = getEnvValue("ONECOMPILER_API_KEY");
  const oneCompilerApiUrl = getEnvValue("ONECOMPILER_API_URL");
  const oneCompilerAccessToken = getEnvValue("ONECOMPILER_ACCESS_TOKEN");
  const rapidApiKey = getEnvValue("RAPID_API_KEY");
  const rapidApiHost = getEnvValue("RAPID_API_HOST");

  if (oneCompilerApiKey) {
    return {
      url: oneCompilerApiUrl ?? ONECOMPILER_DEFAULT_API_URL,
      headers: {
        "X-API-Key": oneCompilerApiKey,
      },
    };
  }

  if (oneCompilerAccessToken) {
    const url = new URL(
      oneCompilerApiUrl ?? "https://onecompiler.com/api/v1/run"
    );
    url.searchParams.set("access_token", oneCompilerAccessToken);

    return {
      url: url.toString(),
      headers: {},
    };
  }

  if (rapidApiKey) {
    if (rapidApiHost?.startsWith("http")) {
      const url = getRunUrl(rapidApiHost);
      const host = new URL(url).host;

      if (host === "api.onecompiler.com" || host === "onecompiler.com") {
        return {
          url,
          headers: {
            "X-API-Key": rapidApiKey,
          },
        };
      }

      return {
        url,
        headers: {
          "x-rapidapi-host": host,
          "x-rapidapi-key": rapidApiKey,
        },
      };
    }

    const host = rapidApiHost ?? "onecompiler-apis.p.rapidapi.com";

    return {
      url: oneCompilerApiUrl ?? `https://${host}/api/v1/run`,
      headers: {
        "x-rapidapi-host": host,
        "x-rapidapi-key": rapidApiKey,
      },
    };
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      "OneCompiler API credentials are not configured. Set ONECOMPILER_API_KEY, ONECOMPILER_ACCESS_TOKEN, or RAPID_API_KEY.",
  });
}

async function runOneCompiler(input: OneCompilerInput) {
  const config = getOneCompilerConfig();
  let res: Response;

  try {
    res = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Unable to reach OneCompiler at ${config.url}. Check ONECOMPILER_API_URL/RAPID_API_HOST and your network connection. ${
        error instanceof Error ? error.message : "Fetch failed"
      }`,
    });
  }

  const responseText = await res.text();
  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!res.ok) {
    const upstreamMessage =
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : typeof data === "string"
        ? data
        : res.statusText;

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `OneCompiler API error: ${res.status} ${upstreamMessage}`,
    });
  }

  return data;
}

export const executionProcedures = {
  // Only Test Users can execute code against challenges
  executeCode: studentProcedure
    .input(codeExecutionInputSchema)
    .mutation(async ({ input }) => {
      return (await runOneCompiler(input)) as codeExecutionResult;
    }),

  // Only Test Users can submit and validate their code batches
  executeCodeBatch: studentProcedure
    .input(batchcodeExecutionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const data = (await runOneCompiler(input.input)) as batchCodeExecutionResult;
      const executions = Array.isArray(data) ? data : [data];

      const result: testCaseExecutionResult = {
        problem_id: input.problemId,
        problem_result: [],
      };

      executions.forEach((execution, index) => {
        const testCase = input.testcases[index];

        if (!testCase) {
          return;
        }

        const actualOutput = execution.stdout ?? "";
        const isCorrect = testCase.expectedOutput.trim() === actualOutput.trim();

        result.problem_result.push({
          testCaseInput: testCase.input,
          testCaseOutput: testCase.expectedOutput,
          correctOutput: isCorrect,
          actualInput: execution.stdin ?? testCase.input,
          actualOutput,
          hidden: testCase.hidden,
        });
      });

      await ctx.db.results.upsertUserProblemResult(
        ctx.user.id,
        input.problemId,
        result.problem_result
      );

      return result;
    }),

  submitCopyViolation: studentProcedure
    .input(
      z.object({
        testId: z.string().uuid("Invalid test ID format"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.tests.codeTestExists(input.testId);

      if (!exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Test not found",
        });
      }

      await ctx.db.results.submitZeroScoreForTest(ctx.user.id, input.testId);
      return { success: true };
    }),
};
