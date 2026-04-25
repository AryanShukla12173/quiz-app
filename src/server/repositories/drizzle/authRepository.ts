import { AuthUser, IAuthRepository } from "../interfaces";
import { db } from "@/lib/drizzle/src";
import { authUsersTable } from "@/lib/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export class DrizzleAuthRepository implements IAuthRepository {
  async getUserAuthByEmail(email: string): Promise<AuthUser | null> {
    const result = await db
      .select()
      .from(authUsersTable)
      .where(eq(authUsersTable.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async createUserAuth(
    id: string,
    email: string,
    passwordHash: string,
    role: string
  ): Promise<AuthUser> {
    const [user] = await db
      .insert(authUsersTable)
      .values({
        id,
        email,
        passwordHash,
        role: role as "admin" | "test_admin" | "test_user",
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create auth user");
    }

    return user;
  }
}
