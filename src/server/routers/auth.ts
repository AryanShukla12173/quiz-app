import { publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const authProcedures = {
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.authDetails.getUserAuthByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const isValid = await ctx.auth.verifyPassword(
        input.password,
        user.passwordHash as string
      );

      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      }

      const token = ctx.auth.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }),

  register: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "test_admin", "test_user"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.authDetails.getUserAuthByEmail(
        input.email
      );

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const passwordHash = await ctx.auth.hashPassword(input.password);
      
      const newUserId = input.id || crypto.randomUUID();

      const user = await ctx.db.authDetails.createUserAuth(
        newUserId,
        input.email,
        passwordHash,
        input.role
      );

      const token = ctx.auth.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }),
};
