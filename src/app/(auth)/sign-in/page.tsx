'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import loginSchema from '@/form_schemas/LoginFormSchema'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function SignIn() {
  const router = useRouter()
  const { signIn, error, loading, clearError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    setIsSubmitting(true)
    clearError()
    try {
      await signIn(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-4xl shadow-xl bg-base-100">
        <div className="grid md:grid-cols-2">
          {/* Left Section */}
          <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 flex flex-col justify-center items-center rounded-tl-xl rounded-bl-xl">
            <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
            <p className="text-lg text-center">Login to access the quiz management platform.</p>
          </div>

          {/* Right Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-primary">Admin Login</h2>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error shadow-sm">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-bold">Login Error</h3>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="flex items-center gap-2 input input-bordered">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="grow bg-transparent outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-sm mt-1">{errors.email.message}</p>
                )}
              </div>


              {/* Password Field */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <div className="flex items-center gap-2 input input-bordered">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="grow bg-transparent outline-none"
                  />
                </div>
                {errors.password && (
                  <p className="text-error text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Links */}
              <div className="flex justify-between text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Forgot Password?
                </Link>
                <Link href="/sign-up" className="text-primary hover:underline">
                  New user? Register here
                </Link>
              </div>
              <div className="text-center text-sm">
                <Link href="/" className="text-primary hover:underline">
                  Home
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
