import { z } from "zod";

// Enum and schemas from your existing setup
export enum Language {
  Java = 'java',
  Python = 'python3',
  Cpp = 'cpp',
  C = 'c',
  JavaScript = 'javascript',
  Go = 'go',
}

const testCaseSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  description: z.string().optional(),
  hidden: z.boolean().optional(),
});

const challengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  language: z.nativeEnum(Language),
  testcases: z.array(testCaseSchema)
});

export const codeTestSchema = z.object({
  testTitle: z.string().max(100),
  testDescription: z.string().max(500),
  challenges: z.array(challengeSchema).min(1, "At least one challenge is required")
});

export type TestCase = z.infer<typeof testCaseSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type CodeTest = z.infer<typeof codeTestSchema>;
