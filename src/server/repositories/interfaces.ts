import { z } from "zod";
import {
  user_admin_profile_schema,
  test_user_profile_schema,
  codeTestSchema,
  codeTestResult,
} from "@/lib/schemas/data_schemas";

export type UserAdminProfileInput = z.infer<typeof user_admin_profile_schema>;
export type TestUserProfileInput = z.infer<typeof test_user_profile_schema>;
export type CodeTestInput = z.infer<typeof codeTestSchema>;

export interface LeaderboardEntry {
  userId: string;
  fullName: string | null;
  enrollmentId: string | null;
  branch: string | null;
  year: string | null;
  totalScore: number;
  totalPossibleScore: number;
  scorePercentage: number;
  problemsAttempted: number;
  totalProblems: number;
  correctTestCases: number;
  totalTestCases: number;
  lastSubmissionTime: Date;
}

export interface IAuthRepository {
  getUserAuthByEmail(email: string): Promise<AuthUser | null>;
  createUserAuth(id: string, email: string, passwordHash: string, role: string): Promise<AuthUser>;
}

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "test_admin" | "test_user";
  createdAt: Date;
}

export interface IUserRepository {
  createAdminProfile(userId: string, input: UserAdminProfileInput): Promise<void>;
  getAdminUsers(): Promise<{ userData: Record<string, unknown>[]; userCount: number }>;
  createTestUserProfile(userId: string, input: TestUserProfileInput): Promise<void>;
  getTestUsers(): Promise<{ userData: Record<string, unknown>[]; userCount: number }>;
  getAdminProfile(userId: string): Promise<Record<string, unknown> | null>;
  getTestUserProfile(userId: string): Promise<Record<string, unknown> | null>;
}

export interface ITestRepository {
  createCodeTest(userId: string, input: CodeTestInput): Promise<{ success: boolean; testId: string }>;
  getTestsCreatedByUser(userId: string): Promise<Record<string, unknown>[]>;
  deleteCodeTest(testId: string): Promise<void>;
  fetchTestData(testId: string): Promise<codeTestResult | null>;
  codeTestExists(testId: string): Promise<boolean>;
  hasUserAttemptedTest(userId: string, testId: string): Promise<boolean>;
  getAllTestsAttemptedByUser(userId: string): Promise<Record<string, unknown>[]>;
}

export interface IResultRepository {
  upsertUserProblemResult(userId: string, problemId: string, executionResults: Record<string, unknown>[]): Promise<void>;
  submitZeroScoreForTest(userId: string, testId: string): Promise<void>;
  getTestLeaderboard(testId: string): Promise<LeaderboardEntry[]>;
  getLeaderboardByTestId(testId: string): Promise<Record<string, unknown>[]>;
}

export interface IDatabaseLayer {
  authDetails: IAuthRepository;
  users: IUserRepository;
  tests: ITestRepository;
  results: IResultRepository;
}

export interface IAuthProvider {
  getUserFromToken(token: string): Promise<{ id: string; email: string; role: string; [key: string]: unknown } | null>;
  generateToken(payload: Record<string, unknown>): string;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
