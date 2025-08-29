// create a instance of the router defined in trpc.ts
import "dotenv/config";
import { db } from "@/lib/drizzle/src";
import { eq, inArray, sql } from "drizzle-orm";
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
type LeaderboardEntry = {
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
};
type TestCaseResult = {
  hidden: boolean;
  actualInput: string;
  actualOutput: string;
  correctOutput: boolean;
  testCaseInput: string;
  testCaseOutput: string;
};
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
      // console.log("Input to Fetch Call:", input.input);
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
      // console.log("OneCompiler Result:", data);
      const testcases = input.testcases;
      // console.log("testcases:", testcases);
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
      // console.log("Result:", result);
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
  getTestLeaderboard: publicProcedure
    .input(
      z.object({
        testId: z.string().uuid("Invalid test ID format"),
      })
    )
    .query(async ({ input }): Promise<LeaderboardEntry[]> => {
      const { testId } = input;

      // First, verify the test exists and get all problems for this test
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

      // Get all user results for this test's problems
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

      // Group results by user and calculate scores
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

      // Process each user's results
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

        // Update last submission time
        if (result.lastSubmittedAt > userEntry.lastSubmissionTime) {
          userEntry.lastSubmissionTime = result.lastSubmittedAt;
        }

        // Calculate score for this problem based on test case results
        const testCaseResults = result.executionResults as TestCaseResult[];
        const correctTestCases = testCaseResults.filter(
          (tc) => tc.correctOutput
        ).length;
        const totalTestCases = testCaseResults.length;

        // Score calculation: (correct test cases / total test cases) * max problem score
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

      // Convert to leaderboard entries and calculate totals
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
          scorePercentage: Math.round(scorePercentage * 100) / 100, // Round to 2 decimal places
          problemsAttempted: userData.problemResults.size,
          totalProblems: testProblems.length,
          correctTestCases: totalCorrectTestCases,
          totalTestCases: totalTestCases,
          lastSubmissionTime: userData.lastSubmissionTime,
        };
      });

      // Sort leaderboard by total score (descending), then by score percentage, then by submission time
      leaderboardEntries.sort((a, b) => {
        if (a.totalScore !== b.totalScore) {
          return b.totalScore - a.totalScore; // Higher score first
        }
        if (a.scorePercentage !== b.scorePercentage) {
          return b.scorePercentage - a.scorePercentage; // Higher percentage first
        }
        // Earlier submission time first (faster completion)
        return a.lastSubmissionTime.getTime() - b.lastSubmissionTime.getTime();
      });

      return leaderboardEntries;
    }),
  getAllTestsAttemptedByUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    const results = await db
      .select({
        testId: codeTests.id,
        testTitle: codeTests.testTitle,
        testDescription: codeTests.testDescription,
        testDuration: codeTests.testDuration,
        // Calculate the total score for the test by summing up scores of submitted problems.
        totalScore: sql<number>`sum(${problems.score})`.mapWith(Number),
        // Find the most recent submission time for the test.
        lastSubmittedAt: sql<string>`max(${userProblemResults.lastSubmittedAt})`,
      })
      .from(userProblemResults)
      .innerJoin(problems, eq(userProblemResults.problemId, problems.id))
      .innerJoin(codeTests, eq(problems.codeTestId, codeTests.id))
      .where(eq(userProblemResults.userId, ctx.user.id))
      // Group by test details to ensure each test appears only once.
      .groupBy(
        codeTests.id,
        codeTests.testTitle,
        codeTests.testDescription,
        codeTests.testDuration
      );
    if (results.length === 0) {
      return [];
    }
    return results;
  }),
  getLeaderboardByTestId: publicProcedure
    .input(
      z.object({
        // Input validation using Zod. Expects a UUID for the code test.
        codeTestId: z.string().uuid("Invalid Code Test ID"),
      })
    )
    .query(async ({ input }) => {
      // This is the main resolver function for the tRPC query.
      // It takes the validated input and context (db connection) to perform the logic.

      try {
        // Step 1: Find all problems associated with the given codeTestId.
        // This is necessary to know which problem results to fetch.
        const associatedProblems = await db
          .select({
            id: problems.id,
          })
          .from(problems)
          .where(eq(problems.codeTestId, input.codeTestId));

        // If no problems are found for the test, return an empty leaderboard.
        if (associatedProblems.length === 0) {
          return [];
        }

        // Extract the problem IDs into an array for the next query.
        const problemIds = associatedProblems.map((p) => p.id);

        // Step 2: Fetch all user problem results for the identified problems.
        // This query joins the results with the problems table (to get scores)
        // and the user profile table (to get user details).
        const results = await db
          .select({
            userId: userProblemResults.userId,
            fullName: testUserProfileTable.fullName,
            enrollmentId: testUserProfileTable.enrollment_id,
            score: problems.score,
          })
          .from(userProblemResults)
          .innerJoin(problems, eq(userProblemResults.problemId, problems.id))
          .innerJoin(
            testUserProfileTable,
            eq(userProblemResults.userId, testUserProfileTable.user_id)
          )
          .where(inArray(userProblemResults.problemId, problemIds));

        // Step 3: Process the raw results to compute total scores for each user.
        // We use a Map to efficiently group scores by userId.
        const userScores = new Map<
          string,
          {
            fullName: string | null;
            enrollmentId: string | null;
            totalScore: number;
          }
        >();

        for (const result of results) {
          // If the user is already in our map, add the score to their total.
          if (userScores.has(result.userId)) {
            const currentUser = userScores.get(result.userId)!;
            currentUser.totalScore += result.score;
          } else {
            // If it's a new user, add them to the map with their first score.
            userScores.set(result.userId, {
              fullName: result.fullName,
              enrollmentId: result.enrollmentId,
              totalScore: result.score,
            });
          }
        }

        // Step 4: Convert the Map into an array and sort it to create the leaderboard.
        // The array is sorted by totalScore in descending order.
        const leaderboard = Array.from(userScores.entries())
          .map(([userId, data]) => ({
            userId,
            ...data,
          }))
          .sort((a, b) => b.totalScore - a.totalScore);

        // Step 5: Add a 'rank' to each entry in the sorted leaderboard.
        return leaderboard.map((entry, index) => ({
          rank: index + 1,
          ...entry,
        }));
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    }),
});

export type AppRouter = typeof appRouter;
