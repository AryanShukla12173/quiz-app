import { z } from 'zod'

const registerFormSchema = z.object({

    email: z
        .string()
        .email({ message: "Invalid email address" }),

    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(30, { message: "Password must be at most 30 characters" }),

    state: z
        .string()
        .min(4, { message: "State must be at least 4 characters" })
        .max(15, { message: "State must be at most 15 characters" }),

    pincode: z
        .string()
        .regex(/^[1-9][0-9]{5}$/, {
            message: "PIN code must be a 6-digit number starting from 1–9",
        }),

    collegename: z
        .string()
        .min(2, { message: "College name must be at least 2 characters" }),
});
export default registerFormSchema