'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import loginSchema from '@/form_schemas/LoginFormSchema'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Mail,
  Lock,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext' // Remove UserRole from import

function SignIn() {
  const router = useRouter()
  const { signIn, error, loading, clearError } = useAuth() // Use the auth context
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    setIsSubmitting(true)
    clearError() // Clear any previous errors
    
    try {
      // Sign in without specifying a role - let the auth context handle role validation
      await signIn(formData.email, formData.password)
      
      // After successful authentication, the auth context will set the user's role
      // Let the router handle the redirect based on actual role
      router.push('/dashboard')
    } catch (err) {
      console.error("Error during sign in:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-geist">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left - Welcome Section */}
          <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-700 p-8 flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome!</h1>
            <p className="text-white text-lg">
              Login to access the quiz management platform.
            </p>
          </div>

          {/* Right - Form Section */}
          <div className="md:w-1/2 p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Admin Login</h2>

                {/* Error alert with improved styling */}
                {error && (
                  <Alert variant="destructive" className="border-red-500 bg-red-50 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Login Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="flex items-center rounded-lg border border-gray-200 px-3 py-2">
                          <Mail className="w-4 h-4 text-purple-500 mr-2" />
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            {...field}
                            className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="flex items-center rounded-lg border border-gray-200 px-3 py-2">
                          <Lock className="w-4 h-4 text-purple-500 mr-2" />
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center text-sm pt-2">
                  <div className="text-purple-600 hover:text-purple-800 cursor-pointer">
                    <Link href="/forgot-password">Forgot Password?</Link>
                  </div>
                  <div className="text-purple-600 hover:text-purple-800 cursor-pointer">
                    <Link href="/sign-up">New user? Register Here</Link>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 text-white font-semibold hover:bg-purple-700"
                  disabled={loading || isSubmitting}
                >
                  {loading || isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn