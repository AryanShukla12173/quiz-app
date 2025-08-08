import { pgTable, uuid, text, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "test_admin",
  "test_user",
  "admin",
]);
export const yearEnum = pgEnum("year", [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
]);
export const testAdminUserProfileTable = pgTable("test_admin_profile", {
  user_id: uuid("id").primaryKey(),
  fullName: text("full Name"),
  designation: text("Designation"),
  department: text("Department"),
  role: userRoleEnum("Role"),
});

export const testUserProfileTable = pgTable("test_user_profile", {
  user_id: uuid("id").primaryKey(),
  fullName: text("Full Name"),
  enrollment_id: text("Enrollment ID"),
  branch: text("Branch"),
  year: yearEnum("Year"),
});
