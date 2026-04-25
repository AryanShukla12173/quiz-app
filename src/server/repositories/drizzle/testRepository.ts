import { ITestRepository, CodeTestInput } from "../interfaces";
import { db } from "@/lib/drizzle/src";
import { codeTests, problems, testCases, userProblemResults } from "@/lib/drizzle/src/db/schema";
import { and, eq } from "drizzle-orm";
import { codeTestResult } from "@/lib/schemas/data_schemas";

type TestCaseResult = {
  correctOutput: boolean;
};

export class DrizzleTestRepository implements ITestRepository {
  async createCodeTest(userId: string, input: CodeTestInput): Promise<{ success: boolean; testId: string }> {
    const { problem, ...testData } = input;
    const result = await db.transaction(async (tx) => {
      // insert code test
      const [insertedTest] = await tx
        .insert(codeTests)
        .values({
          testTitle: testData.testTitle,
          testDescription: testData.testDescription ?? null,
          testDuration: testData.testDuration,
          userId: userId,
        })
        .returning({ id: codeTests.id });

      if (!insertedTest) {
        throw new Error("Failed to create test");
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
          throw new Error("Failed to create problem");
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

  async getTestsCreatedByUser(userId: string): Promise<Record<string, unknown>[]> {
    const res = await db
      .select({
        testId: codeTests.id,
        testTitle: codeTests.testTitle,
        testDescr: codeTests.testDescription,
        createdAt: codeTests.createdAt,
        testDuration: codeTests.testDuration,
      })
      .from(codeTests)
      .where(eq(codeTests.userId, userId));
    return res;
  }

  async deleteCodeTest(testId: string): Promise<void> {
    await db.delete(codeTests).where(eq(codeTests.id, testId));
  }

  async fetchTestData(testId: string): Promise<codeTestResult | null> {
    const res = await db
      .select()
      .from(codeTests)
      .where(eq(codeTests.id, testId))
      .innerJoin(problems, eq(problems.codeTestId, codeTests.id))
      .innerJoin(testCases, eq(testCases.challengeId, problems.id));

    const testMap = new Map<string, codeTestResult>();

    res.forEach((row) => {
      const testRow = row.code_tests;
      const problemRow = row.problems;
      const testCaseRow = row.test_cases;

      if (!testMap.has(testRow.id)) {
        testMap.set(testRow.id, {
          testTitle: testRow.testTitle,
          testDescription: testRow.testDescription ?? "", 
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

      problemObj.testcases.push({
        input: testCaseRow.input,
        expectedOutput: testCaseRow.expectedOutput,
        hidden: testCaseRow.hidden,
      });
    });

    const finalResult = Array.from(testMap.values())[0] ?? null;
    return finalResult;
  }

  async codeTestExists(testId: string): Promise<boolean> {
    const result = await db
      .select({ id: codeTests.id })
      .from(codeTests)
      .where(eq(codeTests.id, testId))
      .limit(1);

    return result.length > 0;
  }

  async hasUserAttemptedTest(userId: string, testId: string): Promise<boolean> {
    const result = await db
      .select({ id: userProblemResults.id })
      .from(userProblemResults)
      .innerJoin(problems, eq(userProblemResults.problemId, problems.id))
      .where(
        and(
          eq(userProblemResults.userId, userId),
          eq(problems.codeTestId, testId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  async getAllTestsAttemptedByUser(userId: string): Promise<Record<string, unknown>[]> {
    const results = await db
      .select({
        testId: codeTests.id,
        testTitle: codeTests.testTitle,
        testDescription: codeTests.testDescription,
        testDuration: codeTests.testDuration,
        problemId: problems.id,
        problemScore: problems.score,
        executionResults: userProblemResults.executionResults,
        lastSubmittedAt: userProblemResults.lastSubmittedAt,
      })
      .from(userProblemResults)
      .innerJoin(problems, eq(userProblemResults.problemId, problems.id))
      .innerJoin(codeTests, eq(problems.codeTestId, codeTests.id))
      .where(eq(userProblemResults.userId, userId));

    const testsById = new Map<
      string,
      {
        testId: string;
        testTitle: string;
        testDescription: string | null;
        testDuration: number;
        totalScore: number;
        lastSubmittedAt: Date;
      }
    >();

    for (const result of results) {
      const testCaseResults = result.executionResults as TestCaseResult[];
      const correctTestCases = testCaseResults.filter(
        (testCase) => testCase.correctOutput
      ).length;
      const totalTestCases = testCaseResults.length;
      const earnedScore =
        totalTestCases > 0
          ? Math.round((correctTestCases / totalTestCases) * result.problemScore)
          : 0;

      const existing = testsById.get(result.testId);

      if (existing) {
        existing.totalScore += earnedScore;
        if (result.lastSubmittedAt > existing.lastSubmittedAt) {
          existing.lastSubmittedAt = result.lastSubmittedAt;
        }
        continue;
      }

      testsById.set(result.testId, {
        testId: result.testId,
        testTitle: result.testTitle,
        testDescription: result.testDescription,
        testDuration: result.testDuration,
        totalScore: earnedScore,
        lastSubmittedAt: result.lastSubmittedAt,
      });
    }

    return Array.from(testsById.values());
  }
}
