CREATE TYPE "public"."user_role" AS ENUM('test_admin', 'test_user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."year" AS ENUM('1st Year', '2nd Year', '3rd Year', '4th Year');--> statement-breakpoint
CREATE TABLE "test_admin_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full Name" text,
	"Designation" text,
	"Department" text,
	"Role" "user_role"
);
--> statement-breakpoint
CREATE TABLE "test_user_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"Full Name" text,
	"Enrollment ID" text,
	"Branch" text,
	"Year" "year"
);
