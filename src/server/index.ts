// create a instance of the router defined in trpc.ts
import "dotenv/config";
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createClient } from "@/lib/utils/supabase/server"; // Works with fetch
import { type NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/drizzle/src";
import { user_admin_profile_schema } from "@/lib/schemas/data_schemas";
import { testAdminUserProfileTable } from "@/lib/drizzle/src/db/schema";
import {router,publicProcedure,createContext} from "@/server/trpc"

export const appRouter = router({
  createProfile: publicProcedure
    .input(user_admin_profile_schema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      await db.insert(testAdminUserProfileTable).values({
        user_id: ctx.user.id,
        department : input.department,
        designation : input.designation,
        fullName : input.full_name,
        role:input.role
      });
      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
