'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from 'zod'
import registerFormSchema from '@/form_schemas/registerFormSchema'
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
  MapPin,
  Landmark,
  School,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { app, db } from '@/lib/connectDatabase'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
function SignUp() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  type FormSchema = z.infer<typeof registerFormSchema>;

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      pincode: "",
      collegename: "",
      state: ""
    },
  });
  const auth = getAuth(app)
  async function onSubmit(formData: z.infer<typeof registerFormSchema>) {
    try {
      setError(null);
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const { collegename, state, pincode } = formData
      const { uid } = res.user
      await setDoc(doc(db, 'user-profiles', uid), {
        collegename,
        state,
        pincode
      });
      if (res.user) {
        // Delay the redirect slightly to allow for data fetching on the dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 500); // Half a second delay
      }
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/email-already-in-use':
          setError('Email is already in use.');
          break;
        default:
          setError('Something went wrong during registration.');
      }
    } finally {
      setLoading(false); // Ensure loading is always set to false after the operation
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
              Join thousands of students accelerating their careers.
              Signing up takes less than a minute!
            </p>
          </div>

          {/* Right - Form Section */}
          <div className="md:w-1/2 p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">Sign Up</h2>

                {/* Error alert with improved styling */}
                {error && (
                  <Alert variant="destructive" className="border-red-500 bg-red-50 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Registration Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Reorganized form fields */}
                <div className="space-y-5">
                  {/* Email field - full width */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Email</FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-lg border border-gray-200 px-4 py-3">
                            <Mail className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="you@example.com"
                              type="email"
                              {...field}
                              className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password field - full width */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">Password</FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-lg border border-gray-200 px-4 py-3">
                            <Lock className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="••••••••"
                              type="password"
                              {...field}
                              className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-base"
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500 mt-1">Use at least 6 characters.</p>
                      </FormItem>
                    )}
                  />

                  {/* Two columns for state and pincode */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* State field */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-base">State</FormLabel>
                          <FormControl>
                            <div className="flex items-center rounded-lg border border-gray-200 px-4 py-3">
                              <MapPin className="w-5 h-5 text-purple-500 mr-3" />
                              <Input
                                placeholder="Karnataka"
                                {...field}
                                className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-base"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* PIN Code field */}
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-base">PIN Code</FormLabel>
                          <FormControl>
                            <div className="flex items-center rounded-lg border border-gray-200 px-4 py-3">
                              <Landmark className="w-5 h-5 text-purple-500 mr-3" />
                              <Input
                                placeholder="560001"
                                {...field}
                                className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-base"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* College Name field - full width */}
                  <FormField
                    control={form.control}
                    name="collegename"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-base">College</FormLabel>
                        <FormControl>
                          <div className="flex items-center rounded-lg border border-gray-200 px-4 py-3">
                            <School className="w-5 h-5 text-purple-500 mr-3" />
                            <Input
                              placeholder="Your College"
                              {...field}
                              className="flex-1 border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 text-base"
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
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
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
