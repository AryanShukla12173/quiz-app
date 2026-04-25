import "dotenv/config";
import { router } from "@/server/trpc";
// Import separated procedure modules
import { userProcedures } from "./routers/users";
import { testProcedures } from "./routers/tests";
import { executionProcedures } from "./routers/execution";
import { leaderboardProcedures } from "./routers/leaderboard";
import { authProcedures } from "./routers/auth";

// Combine procedures into a single flat router to maintain backward compatibility
export const appRouter = router({
  ...userProcedures,
  ...testProcedures,
  ...executionProcedures,
  ...leaderboardProcedures,
  ...authProcedures,
});

export type AppRouter = typeof appRouter;
