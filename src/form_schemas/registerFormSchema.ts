import { z } from 'zod'
import { UserRole } from '@/context/AuthContext';
const registerFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),

  email: z
    .string()
    .email({ message: "Invalid email address" }),

  designation: z
    .string()
    .min(2, { message: "Designation must be at least 2 characters" }),

  department: z
    .string()
    .min(2, { message: "Department must be at least 2 characters" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(30, { message: "Password must be at most 30 characters" }),

  role: z.nativeEnum(UserRole)
});

export default registerFormSchema
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
