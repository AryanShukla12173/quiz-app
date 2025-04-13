import {z} from 'zod'
const loginSchema = z.object(
    {
        
    email: z
    .string()
    .email({ message: "Invalid email address" }),

password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(30, { message: "Password must be at most 30 characters" }),

    }
)

export default loginSchema