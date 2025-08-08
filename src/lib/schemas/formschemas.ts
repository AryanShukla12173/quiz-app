import z from "zod";
const signUpSchema = z.object({
   full_name : z.string(),
   email : z.email(),
   designation : z.string(),
   department : z.string(),
   password : z.string().min(6,'Password needs to be atleast 6 characters')
})

const signInSchema = z.object({
   email : z.email(),
   password : z.string().min(6,'Password needs to be atleast 6 characters')
})
export {signUpSchema , signInSchema}
