import { IUserRepository, UserAdminProfileInput, TestUserProfileInput } from "../interfaces";
import { db } from "@/lib/drizzle/src";
import { testAdminUserProfileTable, testUserProfileTable } from "@/lib/drizzle/src/db/schema";
import { eq } from "drizzle-orm";

export class DrizzleUserRepository implements IUserRepository {
  async getAdminProfile(userId: string): Promise<Record<string, unknown> | null> {
    const res = await db.select().from(testAdminUserProfileTable).where(eq(testAdminUserProfileTable.user_id, userId)).limit(1);
    return res[0] || null;
  }

  async getTestUserProfile(userId: string): Promise<Record<string, unknown> | null> {
    const res = await db.select().from(testUserProfileTable).where(eq(testUserProfileTable.user_id, userId)).limit(1);
    return res[0] || null;
  }

  async createAdminProfile(userId: string, input: UserAdminProfileInput): Promise<void> {
    await db.insert(testAdminUserProfileTable).values({
      user_id: userId,
      department: input.department as string,
      designation: input.designation as string,
      fullName: input.full_name,
      role: input.role,
    });
  }

  async getAdminUsers(): Promise<{ userData: Record<string, unknown>[]; userCount: number }> {
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

  async createTestUserProfile(userId: string, input: TestUserProfileInput): Promise<void> {
    await db.insert(testUserProfileTable).values({
      user_id: userId,
      branch: input.branch,
      enrollment_id: input.enrollmentId,
      fullName: input.fullName,
      year: input.year,
      role: input.role,
    });
  }

  async getTestUsers(): Promise<{ userData: Record<string, unknown>[]; userCount: number }> {
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
}
