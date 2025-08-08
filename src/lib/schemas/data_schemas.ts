import {signUpSchema} from "./formschemas";
import z from "zod";
export const roleEnum = z.enum(["test_admin", "test_user", "admin"]);
export const user_admin_profile_schema = signUpSchema
  .omit({
    email: true,
    password: true,
  })
  .extend({
    role: roleEnum,
  });
