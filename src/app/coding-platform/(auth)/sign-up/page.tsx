'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, Lock, AlertCircle, User, BookOpen, Calendar, FileDigit, Eye, EyeOff
} from 'lucide-react'

import { useAuth } from '@/context/AuthContext'
import coding_platform_register_form from '@/form_schemas/coding_plat_registerFormSchema'

type FormValues = z.infer<typeof coding_platform_register_form>

function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      role: 'quiz-app-user',
    },
  })

  const onSubmit = async (values: FormValues) => {
    clearError()
    setLoading(true)
    try {
      const { Password, ...formDataWithoutPassword } = values
      await signUp(values.email, Password, values.fullName, formDataWithoutPassword)
      setTimeout(() => router.push('/coding-platform/start'), 500)
    } catch (err) {
      console.error('Sign up error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10 font-sans">
      <div className="card w-full max-w-5xl bg-base-100 shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="md:w-1/2 bg-primary p-10 text-white flex items-center justify-center text-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
            <p className="text-lg">
              Join thousands of students accelerating their careers. Signing up takes less than a minute!
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-primary text-center">Sign Up</h2>

            {error && (
              <div className="alert alert-error bg-error/10 border-error text-error text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <User className="w-5 h-5 text-primary" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...form.register('fullName')}
                  className="input input-bordered join-item w-full"
                />
              </div>
              {form.formState.errors.fullName && (
                <p className="text-error text-sm mt-1">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <Mail className="w-5 h-5 text-primary" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                  className="input input-bordered join-item w-full"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-error text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Enrollment ID */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Enrollment ID</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <FileDigit className="w-5 h-5 text-primary" />
                </span>
                <input
                  type="text"
                  placeholder="123456"
                  {...form.register('Enrollment_ID')}
                  className="input input-bordered join-item w-full"
                />
              </div>
              {form.formState.errors.Enrollment_ID && (
                <p className="text-error text-sm mt-1">{form.formState.errors.Enrollment_ID.message}</p>
              )}
            </div>

            {/* Branch */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Branch</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </span>
                <input
                  type="text"
                  placeholder="Computer Science"
                  {...form.register('Branch')}
                  className="input input-bordered join-item w-full"
                />
              </div>
              {form.formState.errors.Branch && (
                <p className="text-error text-sm mt-1">{form.formState.errors.Branch.message}</p>
              )}
            </div>

            {/* Year */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Year</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </span>
                <select
                  {...form.register('Year')}
                  className="select select-bordered join-item w-full"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              {form.formState.errors.Year && (
                <p className="text-error text-sm mt-1">{form.formState.errors.Year.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <Lock className="w-5 h-5 text-primary" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...form.register('Password')}
                  className="input input-bordered join-item w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn join-item btn-square"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-base-content/60 mt-1">Use at least 6 characters.</p>
              {form.formState.errors.Password && (
                <p className="text-error text-sm mt-1">{form.formState.errors.Password.message}</p>
              )}
            </div>

            {/* Links */}
            <div className="text-sm text-center text-primary hover:underline">
              <Link href="/coding-platform/sign-in">Already registered? Sign in here</Link>
            </div>
            <div className="text-sm text-center text-primary hover:underline">
              <Link href="/">Go back</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full text-lg"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
