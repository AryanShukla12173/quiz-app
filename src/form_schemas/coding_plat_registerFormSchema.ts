import { z } from 'zod';
import { UserRole } from '@/context/AuthContext';

// Define the schema
const coding_platform_register_form = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  Enrollment_ID: z.string().min(1, "Enrollment ID is required"),
  Branch: z.string().min(1, "Branch is required"),
  Year: z.enum(["1", "2", "3", "4"], { required_error: "Year is required" }),
  Password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("quiz-app-user"),
})
export default coding_platform_register_form