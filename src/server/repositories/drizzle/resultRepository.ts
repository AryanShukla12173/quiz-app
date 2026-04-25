import { IResultRepository, LeaderboardEntry } from "../interfaces";
import { db } from "@/lib/drizzle/src";
import {
  userProblemResults,
  problems,
  testCases,
  testUserProfileTable,
} from "@/lib/drizzle/src/db/schema";
import { and, eq, inArray } from "drizzle-orm";

type TestCaseResult = {
  hidden: boolean;
  actualInput: string;
  actualOutput: string;
  correctOutput: boolean;
  testCaseInput: string;
  testCaseOutput: string;
};

export class DrizzleResultRepository implements IResultRepository {
  async upsertUserProblemResult(userId: string, problemId: string, executionResults: Record<string, unknown>[]): Promise<void> {
    const submittedAt = new Date();
    const updatedRows = await db
      .update(userProblemResults)
      .set({
        executionResults,
        lastSubmittedAt: submittedAt,
      })
      .where(
        and(
          eq(userProblemResults.userId, userId),
          eq(userProblemResults.problemId, problemId)
        )
      )
      .returning({ id: userProblemResults.id });

    if (updatedRows.length > 0) {
      return;
    }

    await db.insert(userProblemResults).values({
      userId,
      problemId,
      executionResults,
      lastSubmittedAt: submittedAt,
    });
  }

  async submitZeroScoreForTest(userId: string, testId: string): Promise<void> {
    const rows = await db
      .select({
        problemId: problems.id,
        input: testCases.input,
        expectedOutput: testCases.expectedOutput,
        hidden: testCases.hidden,
      })
      .from(problems)
      .innerJoin(testCases, eq(testCases.challengeId, problems.id))
      .where(eq(problems.codeTestId, testId));

    const resultsByProblem = new Map<string, Record<string, unknown>[]>();

    for (const row of rows) {
      const existing = resultsByProblem.get(row.problemId) ?? [];

      existing.push({
        testCaseInput: row.input,
        testCaseOutput: row.expectedOutput,
        correctOutput: false,
        actualInput: row.input,
        actualOutput: "",
        hidden: row.hidden,
        violation: "copy",
      });

      resultsByProblem.set(row.problemId, existing);
    }

    const submittedAt = new Date();

    await db.transaction(async (tx) => {
      for (const [problemId, executionResults] of resultsByProblem) {
        const updatedRows = await tx
          .update(userProblemResults)
          .set({
            executionResults,
            lastSubmittedAt: submittedAt,
          })
          .where(
            and(
              eq(userProblemResults.userId, userId),
              eq(userProblemResults.problemId, problemId)
            )
          )
          .returning({ id: userProblemResults.id });

        if (updatedRows.length > 0) {
          continue;
        }

        await tx.insert(userProblemResults).values({
          userId,
          problemId,
          executionResults,
          lastSubmittedAt: submittedAt,
        });
      }
    });
  }

  async getTestLeaderboard(testId: string): Promise<LeaderboardEntry[]> {
    const testProblems = await db
      .select({
        problemId: problems.id,
        problemScore: problems.score,
      })
      .from(problems)
      .where(eq(problems.codeTestId, testId));

    if (testProblems.length === 0) {
      throw new Error("Test not found or has no problems");
    }

    const totalPossibleScore = testProblems.reduce(
      (sum, problem) => sum + problem.problemScore,
      0
    );

    const userResults = await db
      .select({
        userId: userProblemResults.userId,
        problemId: userProblemResults.problemId,
        executionResults: userProblemResults.executionResults,
        lastSubmittedAt: userProblemResults.lastSubmittedAt,
        problemScore: problems.score,
        userFullName: testUserProfileTable.fullName,
        userEnrollmentId: testUserProfileTable.enrollment_id,
        userBranch: testUserProfileTable.branch,
        userYear: testUserProfileTable.year,
      })
      .from(userProblemResults)
      .innerJoin(problems, eq(userProblemResults.problemId, problems.id))
      .innerJoin(
        testUserProfileTable,
        eq(userProblemResults.userId, testUserProfileTable.user_id)
      )
      .where(eq(problems.codeTestId, testId));

    const userScoreMap = new Map<
      string,
      {
        user: {
          userId: string;
          fullName: string | null;
          enrollmentId: string | null;
          branch: string | null;
          year: string | null;
        };
        problemResults: Map<
          string,
          {
            score: number;
            maxScore: number;
            correctTestCases: number;
            totalTestCases: number;
            lastSubmitted: Date;
          }
        >;
        lastSubmissionTime: Date;
      }
    >();

    for (const result of userResults) {
      const userId = result.userId;

      if (!userScoreMap.has(userId)) {
        userScoreMap.set(userId, {
          user: {
            userId: result.userId,
            fullName: result.userFullName,
            enrollmentId: result.userEnrollmentId,
            branch: result.userBranch,
            year: result.userYear,
          },
          problemResults: new Map(),
          lastSubmissionTime: result.lastSubmittedAt,
        });
      }

      const userEntry = userScoreMap.get(userId)!;

      if (result.lastSubmittedAt > userEntry.lastSubmissionTime) {
        userEntry.lastSubmissionTime = result.lastSubmittedAt;
      }

      const testCaseResults = result.executionResults as TestCaseResult[];
      const correctTestCases = testCaseResults.filter(
        (tc) => tc.correctOutput
      ).length;
      const totalTestCases = testCaseResults.length;

      const scorePercentage =
        totalTestCases > 0 ? correctTestCases / totalTestCases : 0;
      const earnedScore = Math.round(scorePercentage * result.problemScore);

      userEntry.problemResults.set(result.problemId, {
        score: earnedScore,
        maxScore: result.problemScore,
        correctTestCases,
        totalTestCases,
        lastSubmitted: result.lastSubmittedAt,
      });
    }

    const leaderboardEntries: LeaderboardEntry[] = Array.from(
      userScoreMap.entries()
    ).map(([, userData]) => {
      const problemResultsArray = Array.from(
        userData.problemResults.values()
      );

      const totalScore = problemResultsArray.reduce(
        (sum, problemResult) => sum + problemResult.score,
        0
      );

      const totalCorrectTestCases = problemResultsArray.reduce(
        (sum, problemResult) => sum + problemResult.correctTestCases,
        0
      );

      const totalTestCases = problemResultsArray.reduce(
        (sum, problemResult) => sum + problemResult.totalTestCases,
        0
      );

      const scorePercentage =
        totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;

      return {
        userId: userData.user.userId,
        fullName: userData.user.fullName,
        enrollmentId: userData.user.enrollmentId,
        branch: userData.user.branch,
        year: userData.user.year,
        totalScore,
        totalPossibleScore,
        scorePercentage: Math.round(scorePercentage * 100) / 100, 
        problemsAttempted: userData.problemResults.size,
        totalProblems: testProblems.length,
        correctTestCases: totalCorrectTestCases,
        totalTestCases: totalTestCases,
        lastSubmissionTime: userData.lastSubmissionTime,
      };
    });

    leaderboardEntries.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return b.totalScore - a.totalScore; 
      }
      if (a.scorePercentage !== b.scorePercentage) {
        return b.scorePercentage - a.scorePercentage; 
      }
      return a.lastSubmissionTime.getTime() - b.lastSubmissionTime.getTime();
    });

    return leaderboardEntries;
  }

  async getLeaderboardByTestId(testId: string): Promise<Record<string, unknown>[]> {
    const associatedProblems = await db
      .select({
        id: problems.id,
      })
      .from(problems)
      .where(eq(problems.codeTestId, testId));

    if (associatedProblems.length === 0) {
      return [];
    }

    const problemIds = associatedProblems.map((p) => p.id);

    const results = await db
      .select({
        userId: userProblemResults.userId,
        fullName: testUserProfileTable.fullName,
        enrollmentId: testUserProfileTable.enrollment_id,
        score: problems.score,
        executionResults: userProblemResults.executionResults,
      })
      .from(userProblemResults)
      .innerJoin(problems, eq(userProblemResults.problemId, problems.id))
      .innerJoin(
        testUserProfileTable,
        eq(userProblemResults.userId, testUserProfileTable.user_id)
      )
      .where(inArray(userProblemResults.problemId, problemIds));

    const userScores = new Map<
      string,
      {
        fullName: string | null;
        enrollmentId: string | null;
        totalScore: number;
      }
    >();

    for (const result of results) {
      const testCaseResults = result.executionResults as TestCaseResult[];
      const correctTestCases = testCaseResults.filter(
        (tc) => tc.correctOutput
      ).length;
      const totalTestCases = testCaseResults.length;
      const earnedScore =
        totalTestCases > 0
          ? Math.round((correctTestCases / totalTestCases) * result.score)
          : 0;

      if (userScores.has(result.userId)) {
        const currentUser = userScores.get(result.userId)!;
        currentUser.totalScore += earnedScore;
      } else {
        userScores.set(result.userId, {
          fullName: result.fullName,
          enrollmentId: result.enrollmentId,
          totalScore: earnedScore,
        });
      }
    }

    const leaderboard = Array.from(userScores.entries())
      .map(([userId, data]) => ({
        userId,
        ...data,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  }
}
