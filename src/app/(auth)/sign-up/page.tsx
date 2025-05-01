'use client'
import React, { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import registerFormSchema from '@/form_schemas/registerFormSchema'
import { UserRole, useAuth } from '@/context/AuthContext'
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
  User,
  Briefcase,
  Building2,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SignUp() {
  const router = useRouter()
  const { signUp, error, clearError, user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signUpComplete, setSignUpComplete] = useState(false)
  
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      designation: "",
      department: "",
      role: UserRole.quiz_app_admin
    },
  })

  async function onSubmit(formData: z.infer<typeof registerFormSchema>) {
    console.log('Form submitted with data:', formData)
    
    if (isSubmitting) return
    
    try {
      clearError()
      setIsSubmitting(true)
      
      const { password, ...rest } = formData
      await signUp(formData.email, password, formData.fullName, rest)
      
      console.log('signUp function completed successfully')
      // Mark sign-up as complete to trigger the redirect logic
      setSignUpComplete(true)
    } catch (error) {
      console.error('SignUp error:', error)
      setIsSubmitting(false)
    }
  }

  // Handle successful sign-up and redirection
  useEffect(() => {
    // Only attempt to redirect if:
    // 1. Sign-up has been completed successfully
    // 2. We're not in a loading state
    // 3. A user exists
    if (signUpComplete && !authLoading && user) {
      console.log('Sign-up complete, redirecting to dashboard')
      
      // Short timeout to ensure Firebase auth state has fully propagated
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      
      return () => clearTimeout(redirectTimer)
    }
  }, [signUpComplete, authLoading, user, router])

  // Reset submission state when auth loading changes
  useEffect(() => {
    if (!authLoading && isSubmitting) {
      setIsSubmitting(false)
    }
  }, [authLoading, isSubmitting])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-geist">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left - Welcome Section */}
          <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-700 p-8 flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome!</h1>
            <p className="text-white text-lg">
              Join thousands of students accelerating their careers.
              Signing up takes less than a minute!
            </p>
          </div>
          
          {/* Right - Form Section */}
          <div className="md:w-1/2 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Sign Up</h2>
                
                {error && (
                  <Alert variant="destructive" className="border-red-500 bg-red-50 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Registration Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {signUpComplete && !error && (
                  <Alert className="border-green-500 bg-green-50 mb-4">
                    <AlertTitle className="font-semibold">Registration Successful</AlertTitle>
                    <AlertDescription>Account created! Redirecting to dashboard...</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-5">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Full Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-200 px-4 py-3 rounded-lg">
                            <User className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="John Doe"
                              {...field}
                              className="flex-1 bg-transparent border-none outline-none p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Email</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-200 px-4 py-3 rounded-lg">
                            <Mail className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="you@example.com"
                              type="email"
                              {...field}
                              className="flex-1 bg-transparent border-none outline-none p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Designation */}
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Designation</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-200 px-4 py-3 rounded-lg">
                            <Briefcase className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="Professor, Student, etc."
                              {...field}
                              className="flex-1 bg-transparent border-none outline-none p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Department */}
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Department</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-200 px-4 py-3 rounded-lg">
                            <Building2 className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="Computer Science, etc."
                              {...field}
                              className="flex-1 bg-transparent border-none outline-none p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Password</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-200 px-4 py-3 rounded-lg">
                            <Lock className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="••••••••"
                              type="password"
                              {...field}
                              className="flex-1 bg-transparent border-none outline-none p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="text-purple-600 hover:text-purple-800 cursor-pointer text-sm pt-2">
                  <Link href="/sign-in">Already registered? Sign in here</Link>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-purple-600 text-white font-semibold hover:bg-purple-700 py-6 text-lg"
                  disabled={isSubmitting || authLoading || signUpComplete}
                >
                  {isSubmitting ? "Creating Account..." : signUpComplete ? "Account Created!" : "Sign Up"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp