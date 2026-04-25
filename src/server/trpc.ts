import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { DrizzleUserRepository } from "./repositories/drizzle/userRepository";
import { DrizzleTestRepository } from "./repositories/drizzle/testRepository";
import { DrizzleResultRepository } from "./repositories/drizzle/resultRepository";
import { DrizzleAuthRepository } from "./repositories/drizzle/authRepository";
import { IDatabaseLayer, IAuthProvider } from "./repositories/interfaces";
import { JwtAuthProvider } from "./auth/JwtAuthProvider";
import { AUTH_TOKEN_COOKIE } from "@/lib/auth/constants";

// Database Layer Injection
const repositories: IDatabaseLayer = {
  authDetails: new DrizzleAuthRepository(),
  users: new DrizzleUserRepository(),
  tests: new DrizzleTestRepository(),
  results: new DrizzleResultRepository(),
};

// Auth Provider Injection
const authProvider: IAuthProvider = new JwtAuthProvider();

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const { req } = opts;

  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");
  const cookieHeader = req.headers.get("cookie");
  const cookieToken = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${AUTH_TOKEN_COOKIE}=`))
    ?.split("=")[1];
  const token = bearerToken ?? (cookieToken ? decodeURIComponent(cookieToken) : undefined);

  let user = null;
  if (token) {
    user = await authProvider.getUserFromToken(token);
  }

  // Passing everything down seamlessly
  return { user, db: repositories, auth: authProvider };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createContext>>>()
  .create();

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

// MIDDLEWARES

// 1. Ensure user is authenticated
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({ ctx: { user: ctx.user } });
});
export const protectedProcedure = t.procedure.use(isAuthed);

// 2. Ensure user is an Admin
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  const adminProfile = await ctx.db.users.getAdminProfile(ctx.user.id);
  if (!adminProfile) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx: { user: ctx.user, admin: adminProfile } });
});
export const adminProcedure = t.procedure.use(isAdmin);

// 3. Ensure user is a Test User (Student)
const isTestUser = middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  const studentProfile = await ctx.db.users.getTestUserProfile(ctx.user.id);
  if (!studentProfile) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Student access required" });
  }
  return next({ ctx: { user: ctx.user, student: studentProfile } });
});
export const studentProcedure = t.procedure.use(isTestUser);
