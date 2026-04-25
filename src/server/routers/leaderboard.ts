import { protectedProcedure } from "@/server/trpc";
import { LeaderboardEntry } from "../repositories/interfaces";
import z from "zod";

export const leaderboardProcedures = {
  // Both Admins and Test Users can view the leaderboard (if permitted by frontend)
  getTestLeaderboard: protectedProcedure
    .input(z.object({ testId: z.string().uuid("Invalid test ID format") }))
    .query(async ({ ctx, input }): Promise<LeaderboardEntry[]> => {
      return await ctx.db.results.getTestLeaderboard(input.testId);
    }),

  getLeaderboardByTestId: protectedProcedure
    .input(z.object({ codeTestId: z.string().uuid("Invalid Code Test ID") }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.results.getLeaderboardByTestId(input.codeTestId);
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    }),
};
