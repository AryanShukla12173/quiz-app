import { protectedProcedure, adminProcedure } from "@/server/trpc";
import { user_admin_profile_schema, test_user_profile_schema } from "@/lib/schemas/data_schemas";

export const userProcedures = {
  // Creating a profile doesn't require having the profile yet, so we just use protectedProcedure
  createProfile: protectedProcedure
    .input(user_admin_profile_schema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.users.createAdminProfile(ctx.user.id, input);
      return { success: true };
    }),

  // Only admins can see admin lists
  getAdminTestUserData: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.users.getAdminUsers();
  }),

  // Only admins can see user data lists
  getTestUserData: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.users.getTestUsers();
  }),

  getMyAdminProfile: adminProcedure.query(async ({ ctx }) => {
    return ctx.admin;
  }),

  getMyTestUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.users.getTestUserProfile(ctx.user.id);

    if (!profile) {
      return null;
    }

    return profile;
  }),

  // Creating a student profile doesn't require having the profile yet
  createTestUserProfile: protectedProcedure
    .input(test_user_profile_schema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.users.createTestUserProfile(ctx.user.id, input);
      return { success: true };
    }),
};
