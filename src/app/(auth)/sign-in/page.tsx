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
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth'
import {app} from "@/lib/connectDatabase"
function SignIn() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const auth = getAuth(app)
  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    try {
      setError(null)
      setLoading(true)
      const res = await signInWithEmailAndPassword(auth,formData.email,formData.password)
      if(res.user){
        router.push('/dashboard')
      }
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      console.error(error)
      setError(error.message || "Failed to login. Please check your credentials.")
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
              Login to create quizzes and coding rounds.
            </p>
          </div>

          {/* Right - Form Section */}
          <div className="md:w-1/2 p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Login</h2>

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
                    <Link href = "#">Forgot Password? </Link>
                  </div>
                  <div className="text-purple-600 hover:text-purple-800 cursor-pointer">
                    <Link href = "/sign-up" >New user? Register Here</Link>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 text-white font-semibold hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
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