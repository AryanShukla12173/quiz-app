import {
  pgTable,
  uuid,
  text,
  pgEnum,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { sql } from "drizzle-orm";

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
  user_id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  fullName: text("fullName"),
  designation: text("Designation"),
  department: text("Department"),
  role: userRoleEnum("Role"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const testUserProfileTable = pgTable("test_user_profile", {
  user_id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  fullName: text("FullName"),
  enrollment_id: text("Enrollment ID"),
  branch: text("Branch"),
  year: yearEnum("Year"),
  role: userRoleEnum("Role"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const codeTests = pgTable("code_tests", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  testTitle: text("test_title").notNull(),
  testDescription: text("test_description"),
  testDuration: integer("test_duration").notNull(), // minutes
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  userId: uuid("user_id").notNull(),
});

export const problems = pgTable("problems", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  codeTestId: uuid("code_test_id")
    .references(() => codeTests.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  score: integer("score").default(0).notNull(),
});

export const testCases = pgTable("test_cases", {
  id: uuid("id") .default(sql`gen_random_uuid()`) .primaryKey(),
  challengeId: uuid("problem_id")
    .references(() => problems.id, { onDelete: "cascade" })
    .notNull(),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  description: text("description"),
  hidden: boolean("hidden").default(false).notNull(),
});

// Relations between Tables

export const codeTestsRelations = relations(codeTests, ({ many }) => ({
  challenges: many(problems),
}));

export const ProblemsRelations = relations(problems, ({ one, many }) => ({
  codeTest: one(codeTests, {
    fields: [problems.codeTestId],
    references: [codeTests.id],
  }),
  testCases: many(testCases),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  challenge: one(problems, {
    fields: [testCases.challengeId],
    references: [problems.id],
  }),
}));
