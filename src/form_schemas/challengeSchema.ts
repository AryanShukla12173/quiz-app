import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// TestCase schema with required fields
const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string(), // Required, not optional
  hidden: z.boolean(), // Required, not optional
});

// Challenge schema
const challengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  score: z.number(),
  testcases: z.array(testCaseSchema),
});

// CodeTest schema
export const codeTestSchema = z.object({
  testTitle: z.string().max(100),
  testDescription: z.string().max(500),
  testDuration: z.number().min(1, "Test duration must be at least 1 minute"),
  challenges: z.array(challengeSchema).min(1, "At least one challenge is required"),
});

// Type definitions
export type TestCase = z.infer<typeof testCaseSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type CodeTest = z.infer<typeof codeTestSchema>;

// Firebase data structure
export type AdminChallengeCreationData = CodeTest & {
  userId: string;
  createdAt: Timestamp;
};