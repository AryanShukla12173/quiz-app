// create a instance of the router defined in trpc.ts
import "dotenv/config";
import { db } from "@/lib/drizzle/src";
import { eq } from "drizzle-orm";
import {
  user_admin_profile_schema,
  codeTestSchema,
} from "@/lib/schemas/data_schemas";
import {
  testAdminUserProfileTable,
  testUserProfileTable,
  codeTests,
  problems,
  testCases,
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
              createdAt: new Date(),
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
                description: tc.description ?? null,
                hidden: !!tc.hidden,
              }));

              await tx.insert(testCases).values(rows);
            }
            return { success: true, testId: insertedTest.id };
          }
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
  deleteCodeTest: publicProcedure.input(
   z.number()
  ).mutation(async ({ctx,input})=>{
    if(ctx.user?.id){
      await db.delete(codeTests).where(eq(codeTests.id,input))
      return {success : true}
    }

  }),
});

export type AppRouter = typeof appRouter;
