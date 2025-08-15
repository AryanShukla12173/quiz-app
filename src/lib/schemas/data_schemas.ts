import { signUpSchema } from "./formschemas";
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

export const testCaseSchema = z.object({
  input: z.string('input is required'),
  expectedOutput: z.string('output is required'),
  description: z.string().optional(),
  hidden: z.boolean(),
});

export const problemSchema = z.object({
  title: z.string('Problem Title is Required'),
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
  problem: z
    .array(problemSchema)
    .min(1, "At least one problem is required"),
});

export type CodeTestInput = z.infer<typeof codeTestSchema>;
