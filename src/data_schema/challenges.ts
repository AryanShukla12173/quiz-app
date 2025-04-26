import { z } from "zod";

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  hidden: z.boolean(),
  description: z.string(),
});

const challengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  testcases: z.array(testCaseSchema),
});

const timestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
});

const testSchema = z.object({
  testDescription: z.string(),
  testTitle: z.string(),
  challenges: z.array(challengeSchema),
  createdAt: timestampSchema,
  userId: z.string(),
});

export default testSchema