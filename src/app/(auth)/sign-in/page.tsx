'use client'

import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import loginSchema from '@/form_schemas/LoginFormSchema'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Mail,
  Lock,
  MapPin,
  Landmark,
  School
} from "lucide-react"

function SignUp() {
  type FormSchema = z.infer<typeof loginSchema>;

  const formFields: {
    name: keyof FormSchema;
    label: string;
    placeholder: string;
    description?: string;
    type?: string;
    icon: React.ReactNode;
  }[] = [
    {
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
      description: "",
      type: "email",
      icon: <Mail className="w-4 h-4 text-gray-500" />,
    },
    {
      name: "password",
      label: "Password",
      placeholder: "••••••••",
      description: "Use at least 6 characters.",
      type: "password",
      icon: <Lock className="w-4 h-4 text-gray-500" />,
    }
  ];

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
     
    },
  });

  function onSubmit(formData: z.infer<typeof loginSchema>) {
    console.log(formData);
  }

  return (
    <div className="flex flex-col md:flex-row h-screen font-geist">
      {/* Left - Form Section */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-10 w-full md:w-[35vw] h-full flex flex-col justify-center gap-6 bg-gradient-to-br from-purple-500 to-purple-700"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-2">Login</h2>

          {formFields.map((fieldConfig) => (
            <FormField
              key={fieldConfig.name}
              control={form.control}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">{fieldConfig.label}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-300">
                      {fieldConfig.icon}
                      <Input
                        placeholder={fieldConfig.placeholder}
                        type={fieldConfig.type || "text"}
                        {...field}
                        className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-black"
                      />
                    </div>
                  </FormControl>
                  {fieldConfig.description && (
                    <FormDescription className="text-white">
                      {fieldConfig.description}
                    </FormDescription>
                  )}
                  <FormMessage className="text-sm text-red-500 mt-1" />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="w-1/2 self-center bg-white text-purple-700 font-semibold hover:bg-purple-100">
            Submit
          </Button>
        </form>
      </Form>

      {/* Right - Welcome Section */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-white px-10 font-geist text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">Welcome!</h1>
        <p className="text-gray-600 text-lg max-w-md">
          Login to create quizzes and coding rounds.
        </p>
      </div>
    </div>
  )
}

export default SignUp
