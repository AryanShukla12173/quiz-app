// create a instance of the router defined in trpc.ts
import "dotenv/config";
import { db } from "@/lib/drizzle/src";
import { eq } from "drizzle-orm";
import {
  user_admin_profile_schema,
  codeTestSchema,
  test_user_profile_schema,
  codeTestResult,
  codeExecutionInputSchema,
  codeExecutionResult,
  batchcodeExecutionInputSchema,
  batchCodeExecutionResult,
  testCaseExecutionResult,
} from "@/lib/schemas/data_schemas";
import {
  testAdminUserProfileTable,
  testUserProfileTable,
  codeTests,
  problems,
  testCases,
  userProblemResults,
} from "@/lib/drizzle/src/db/schema";
import { router, publicProcedure } from "@/server/trpc";

import { TRPCError } from "@trpc/server";
import z from "zod";
export const appRouter = router({
  createProfile: publicProcedure
    .input(user_admin_profile_schema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      await db.insert(testAdminUserProfileTable).values({
        user_id: ctx.user.id,
        department: input.department,
        designation: input.designation,
        fullName: input.full_name,
        role: input.role,
      });
      return { success: true };
    }),
  getAdminTestUserData: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    if (ctx.user?.id) {
      const res = await db
        .select({
          department: testAdminUserProfileTable.department,
          fullName: testAdminUserProfileTable.fullName,
          designation: testAdminUserProfileTable.designation,
          createdAt: testAdminUserProfileTable.createdAt,
        })
        .from(testAdminUserProfileTable)
        .execute();
      const countRes = await db.$count(testAdminUserProfileTable);
      return {
        userData: res,
        userCount: countRes,
      };
    }
  }),
  getTestUserData: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    if (ctx.user?.id) {
      const res = await db
        .select({
          EnrollmentId: testUserProfileTable.enrollment_id,
          fullName: testUserProfileTable.fullName,
          branch: testUserProfileTable.branch,
          year: testUserProfileTable.year,
          createdAt: testUserProfileTable.createdAt,
        })
        .from(testUserProfileTable)
        .execute();
      const countRes = await db.$count(testUserProfileTable);
      return {
        userData: res,
        userCount: countRes,
      };
    }
  }),

  createCodeTest: publicProcedure
    .input(codeTestSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      if (ctx.user?.id) {
        const { problem, ...testData } = input;
        const id = ctx.user.id;
        const result = await db.transaction(async (tx) => {
          // insert code test
          const [insertedTest] = await tx
            .insert(codeTests)
            .values({
              testTitle: testData.testTitle,
              testDescription: testData.testDescription ?? null,
              testDuration: testData.testDuration,
              userId: id,
            })
            .returning({ id: codeTests.id });

          if (!insertedTest) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create test",
            });
          }
          // insertedTest.id is now available
          for (const ch of problem) {
            const [insertedChallenge] = await tx
              .insert(problems)
              .values({
                codeTestId: insertedTest.id,
                title: ch.title,
                description: ch.description ?? null,
                score: ch.score ?? 0,
              })
              .returning({ id: problems.id });
            if (!insertedChallenge) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create problem",
              });
            }
            // batch insert test cases (if any)
            if (ch.testcases && ch.testcases.length > 0) {
              const rows = ch.testcases.map((tc) => ({
                challengeId: insertedChallenge.id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                hidden: !!tc.hidden,
              }));

              await tx.insert(testCases).values(rows);
            }
          }
          return { success: true, testId: insertedTest.id };
        });
        return result;
      }
    }),
  getTestsCreatedByUser: publicProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    console.log(user?.id);
    if (!user)
      throw new TRPCError({
        message: "User not found in context",
        code: "INTERNAL_SERVER_ERROR",
      });
    if (user.id) {
      const res = await db
        .select({
          testId: codeTests.id,
          testTitle: codeTests.testTitle,
          testDescr: codeTests.testDescription,
          createdAt: codeTests.createdAt,
          testDuration: codeTests.testDuration,
        })
        .from(codeTests)
        .where(eq(codeTests.userId, user.id));
      return res;
    }
  }),
  deleteCodeTest: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.id) {
        await db.delete(codeTests).where(eq(codeTests.id, input));
        return { success: true };
      }
    }),
  createTestUserProfile: publicProcedure
    .input(test_user_profile_schema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      await db.insert(testUserProfileTable).values({
        user_id: ctx.user.id,
        branch: input.branch,
        enrollment_id: input.enrollmentId,
        fullName: input.fullName,
        year: input.year,
        role: input.role,
      });
      return { success: true };
    }),
  fetchTestData: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not signed in",
        });
      }
      const res = await db
        .select()
        .from(codeTests)
        .where(eq(codeTests.id, input))
        .innerJoin(problems, eq(problems.codeTestId, codeTests.id))
        .innerJoin(testCases, eq(testCases.challengeId, problems.id));

      // console.log(res);
      const testMap = new Map<string, codeTestResult>();

      res.forEach((row) => {
        const testRow = row.code_tests;
        const problemRow = row.problems;
        const testCaseRow = row.test_cases;

        // if test not in map → add it
        if (!testMap.has(testRow.id)) {
          testMap.set(testRow.id, {
            testTitle: testRow.testTitle,
            testDescription: testRow.testDescription ?? "", // handle optional
            testDuration: testRow.testDuration,
            problem: [],
          });
        }

        const testObj = testMap.get(testRow.id)!;
        let problemObj = testObj.problem.find((p) => p.id === problemRow.id);
        if (!problemObj) {
          problemObj = {
            id: problemRow.id,
            title: problemRow.title,
            description: problemRow.description ?? "",
            score: problemRow.score,
            testcases: [],
          };
          testObj.problem.push(problemObj);
        }

        // push testcase into problem
        problemObj.testcases.push({
          input: testCaseRow.input,
          expectedOutput: testCaseRow.expectedOutput,
          hidden: testCaseRow.hidden,
        });
      });

      // Return single test result (or null if none)
      const finalResult: codeTestResult =
        Array.from(testMap.values())[0] ?? null;

      return finalResult;
    }),
  executeCode: publicProcedure
    .input(codeExecutionInputSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const res = await fetch(
        "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": process.env.RAPID_API_HOST!,
            "x-rapidapi-key": process.env.RAPID_API_KEY!,
          },
          body: JSON.stringify(input),
        }
      );
      if (!res.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `OneCompiler API error: ${res.status}`,
        });
      }
      const data: codeExecutionResult = await res.json();
      return data;
    }),
  executeCodeBatch: publicProcedure
    .input(batchcodeExecutionInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      console.log("Input to Fetch Call:", input.input);
      const res = await fetch(
        "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": process.env.RAPID_API_HOST!,
            "x-rapidapi-key": process.env.RAPID_API_KEY!,
          },
          body: JSON.stringify(input.input),
        }
      );
      if (!res.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `OneCompiler API error: ${res.json}`,
        });
      }
      const data: batchCodeExecutionResult = await res.json();
      console.log("OneCompiler Result:", data);
      const testcases = input.testcases;
      console.log("testcases:", testcases);
      const result: testCaseExecutionResult = {
        problem_id: input.problemId,
        problem_result: [],
      };
      data.forEach((execution) => {
        testcases.forEach((element) => {
          if (element.expectedOutput.trim() === execution.stdout.trim()) {
            result.problem_result.push({
              testCaseInput: element.input,
              testCaseOutput: element.expectedOutput,
              correctOutput: true,
              actualInput: execution.stdin,
              actualOutput: execution.stdout,
              hidden: element.hidden,
            });
          } else {
            result.problem_result.push({
              testCaseInput: element.input,
              testCaseOutput: element.expectedOutput,
              correctOutput: false,
              actualInput: execution.stdin,
              actualOutput: execution.stdout,
              hidden: element.hidden,
            });
          }
        });
      });
      console.log("Result:", result);
      await db
        .insert(userProblemResults)
        .values({
          userId: ctx.user.id,
          problemId: input.problemId,
          executionResults: result.problem_result, // store array of test case results
          lastSubmittedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userProblemResults.userId, userProblemResults.problemId], // unique constraint
          set: {
            executionResults: result.problem_result,
            lastSubmittedAt: new Date(),
          },
        });
      return result;
    }),
});

export type AppRouter = typeof appRouter;
