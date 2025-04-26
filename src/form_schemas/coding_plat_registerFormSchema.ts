import {z} from 'zod'
import { UserRole } from './registerFormSchema'
const ccoding_plat_registerFormSchema = z.object(
    {
       email: z
           .string()
           .min(1, { message: "Email is required" })
           .email({ message: "Please enter a valid email address" })
           .max(254, { message: "Email cannot exceed 254 characters" })
           .refine(email => !email.endsWith('.con'), {
             message: "Did you mean .com instead of .con?"
           }),
         password: z
           .string()
           .min(1, { message: "Password is required" })
           .min(6, { message: "Password must be at least 6 characters" })
           .max(128, { message: "Password cannot exceed 128 characters" }),
        
        role : z.nativeEnum(UserRole)
       
    }
)
export default ccoding_plat_registerFormSchema