import { signUpSchema, testUserSignUpSchema } from "./formschemas";
import z from "zod";
export const roleEnum = z.enum(["test_admin", "test_user", "admin"]);
export const user_admin_profile_schema = signUpSchema
  .omit({
    email: true,
    password: true,
  })
  .extend({
    role: roleEnum,
  });
export const test_user_profile_schema = testUserSignUpSchema
  .omit({
    email: true,
    password: true,
  })
  .extend({
    role: roleEnum,
  });
export const testCaseSchema = z.object({
  input: z.string("input is required"),
  expectedOutput: z.string("output is required"),
  hidden: z.boolean(),
});

export const problemSchema = z.object({
  title: z.string("Problem Title is Required"),
  description: z.string().optional(),
  score: z.number().int().nonnegative(),
  testcases: z
    .array(testCaseSchema)
    .min(1, "At least one test case is required"),
});

export const codeTestSchema = z.object({
  testTitle: z.string().min(1, "Test title is required"),
  testDescription: z.string().optional(),
  testDuration: z.number().int().min(1, "Duration must be at least 1 minute"),
  problem: z.array(problemSchema).min(1, "At least one problem is required"),
});

export type codeTestResult = {
  testTitle: string;
  testDescription: string;
  testDuration: number;
  problem: {
    id: string;
    title: string;
    description: string;
    score: number;
    testcases: {
      input: string;
      expectedOutput: string;
      hidden: boolean;
    }[];
  }[];
};
export const problemOutput = problemSchema.extend({
  id: z.uuid(),
});
export type CodeTestInput = z.infer<typeof codeTestSchema>;

export const codeExecutionInputSchema = z.object({
  problem_id: z.uuid(),
  language: z.string(),
  stdin: z.string(),
  files: z.array(
    z.object({
      name: z.string().default("main"),
      content: z.string(),
    })
  ),
});
export type codeExecutionResult = {
  stdout: string;
  stderr: string | null;
  executionTime: number;
  limitPerMonthRemaining: number;
  status: string;
  exception?: string;
};
export const batchcodeExecutionInputSchema = z.object({
  problemId: z.uuid(),
  input: z.object({
    language: z.string(),
    stdin: z.array(z.string()),
    files: z.array(
      z.object({
        name: z.string().default("main"),
        content: z.string(),
      })
    ),
  }),
  testcases: z.array(testCaseSchema),
});

export type batchCodeExecutionResult = {
  stdout: string;
  stderr: string | null;
  executionTime: number;
  limitPerMonthRemaining: number;
  status: string;
  exception?: string;
  stdin: string;
}[];

export type testCaseExecutionResult = {
  problem_id: string;
  problem_result: {
    testCaseInput: string;
    testCaseOutput: string;
    actualInput: string;
    actualOutput: string;
    correctOutput: boolean;
    hidden: boolean;
  }[];
};
