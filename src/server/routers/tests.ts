import { protectedProcedure, adminProcedure, studentProcedure } from "@/server/trpc";
import { codeTestSchema } from "@/lib/schemas/data_schemas";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const testProcedures = {
  // Only admins can create tests
  createCodeTest: adminProcedure
    .input(codeTestSchema)
    .mutation(async ({ input, ctx }) => {
      // ctx.user is guaranteed to be an admin by adminProcedure middleware
      return await ctx.db.tests.createCodeTest(ctx.user.id, input);
    }),

  // Only admins can get list of tests they created
  getTestsCreatedByUser: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.tests.getTestsCreatedByUser(ctx.user.id);
  }),

  // Only admins can delete a code test
  deleteCodeTest: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tests.deleteCodeTest(input);
      return { success: true };
    }),

  // Fetching a test by ID (can be students taking the test, or admins previewing)
  // protectedProcedure ensures at least a valid basic auth user
  fetchTestData: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role === "test_user") {
        const attempted = await ctx.db.tests.hasUserAttemptedTest(
          ctx.user.id,
          input
        );

        if (attempted) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You have already submitted this test and cannot attempt it again.",
          });
        }
      }

      return await ctx.db.tests.fetchTestData(input);
    }),

  validateTestCode: studentProcedure
    .input(z.string().uuid("Invalid test ID format"))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.tests.codeTestExists(input);
      const attempted = exists
        ? await ctx.db.tests.hasUserAttemptedTest(ctx.user.id, input)
        : false;

      return { exists, attempted };
    }),

  // Only students can fetch tests they have attempted
  getAllTestsAttemptedByUser: studentProcedure.query(async ({ ctx }) => {
    return await ctx.db.tests.getAllTestsAttemptedByUser(ctx.user.id);
  }),
};
