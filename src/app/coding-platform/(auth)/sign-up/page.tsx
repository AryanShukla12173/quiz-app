'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Mail,
  Lock,
  AlertCircle,
  User,
  BookOpen,
  Calendar,
  FileDigit
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/context/AuthContext'
import coding_platform_register_form from '@/form_schemas/coding_plat_registerFormSchema'
type FormValues = z.infer<typeof coding_platform_register_form>

function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { signUp, error, clearError } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(coding_platform_register_form),
    defaultValues: {
      fullName: '',
      email: '',
      Enrollment_ID: '',
      Branch: '',
      Year: '1',
      Password: '',
      role: "quiz-app-user"
    },
  })

  const onSubmit = async (values: FormValues) => {
    clearError()
    setLoading(true)
    try {
      const { Password, ...formDataWithoutPassword } = values;  // Exclude Password
      await signUp(values.email, values.Password, values.fullName, formDataWithoutPassword)
      setTimeout(() => {
        router.push('/coding-platform/start')
      }, 500)
    } catch (error) {
      console.error("Sign up error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row h-full md:h-auto">
        {/* Left Panel */}
        <div className="md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-700 p-8 flex items-center justify-center text-center text-white">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
            <p className="text-lg">
              Join thousands of students accelerating their careers.
              Signing up takes less than a minute!
            </p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[90vh] w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-700 text-center">Sign Up</h2>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Registration Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <div className="flex items-center px-4 py-3 border rounded-lg">
                        <User className="w-5 h-5 text-purple-500 mr-3" />
                        <FormControl>
                          <Input {...field} placeholder="John Doe" className="border-none outline-none focus-visible:ring-0 bg-transparent p-0 text-base" />
                        </FormControl>
                      </div>
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
                      <FormLabel>Email</FormLabel>
                      <div className="flex items-center px-4 py-3 border rounded-lg">
                        <Mail className="w-5 h-5 text-purple-500 mr-3" />
                        <FormControl>
                          <Input {...field} type="email" placeholder="you@example.com" className="border-none outline-none focus-visible:ring-0 bg-transparent p-0 text-base" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Enrollment ID */}
                <FormField
                  control={form.control}
                  name="Enrollment_ID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment ID</FormLabel>
                      <div className="flex items-center px-4 py-3 border rounded-lg">
                        <FileDigit className="w-5 h-5 text-purple-500 mr-3" />
                        <FormControl>
                          <Input {...field} placeholder="123456" className="border-none outline-none focus-visible:ring-0 bg-transparent p-0 text-base" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Branch */}
                <FormField
                  control={form.control}
                  name="Branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <div className="flex items-center px-4 py-3 border rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-500 mr-3" />
                        <FormControl>
                          <Input {...field} placeholder="Computer Science" className="border-none outline-none focus-visible:ring-0 bg-transparent p-0 text-base" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year */}
                <FormField
                  control={form.control}
                  name="Year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <div className="flex items-center px-4 py-1 border rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-500 mr-3 ml-1" />
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="border-none outline-none bg-transparent text-base h-11">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1st Year</SelectItem>
                              <SelectItem value="2">2nd Year</SelectItem>
                              <SelectItem value="3">3rd Year</SelectItem>
                              <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="Password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="flex items-center px-4 py-3 border rounded-lg">
                        <Lock className="w-5 h-5 text-purple-500 mr-3" />
                        <FormControl>
                          <Input {...field} type="password" placeholder="••••••••" className="border-none outline-none focus-visible:ring-0 bg-transparent p-0 text-base" />
                        </FormControl>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Use at least 6 characters.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-sm text-center text-purple-600 hover:text-purple-800">
                <Link href="/coding-platform/sign-in">Already registered? Sign in here</Link>
              </div>

              <Button type="submit" className="w-full bg-purple-600 text-white font-semibold hover:bg-purple-700 py-6 text-lg" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
