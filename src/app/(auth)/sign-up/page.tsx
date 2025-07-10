'use client'

import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import registerFormSchema from '@/form_schemas/registerFormSchema'
import { UserRole, useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Lock,
  User,
  Briefcase,
  Building2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react'

function SignUp() {
  const router = useRouter()
  const { signUp, error, clearError, user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signUpComplete, setSignUpComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      designation: '',
      department: '',
      role: UserRole.quiz_app_admin,
    },
  })

  async function onSubmit(formData: z.infer<typeof registerFormSchema>) {
    if (isSubmitting) return
    try {
      clearError()
      setIsSubmitting(true)
      const { password, ...rest } = formData
      await signUp(formData.email, password, formData.fullName, rest)
      setSignUpComplete(true)
    } catch (err) {
      console.error('SignUp error:', err)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (signUpComplete && !authLoading && user) {
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      return () => clearTimeout(redirectTimer)
    }
  }, [signUpComplete, authLoading, user, router])

  useEffect(() => {
    if (!authLoading && isSubmitting) {
      setIsSubmitting(false)
    }
  }, [authLoading, isSubmitting])

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 font-geist">
      <div className="card lg:card-side bg-base-100 shadow-xl max-w-4xl w-full">
        {/* Left Panel */}
        <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 flex flex-col justify-center items-center rounded-tl-xl rounded-bl-xl">
          <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
          <p className="text-lg text-center">
            Join thousands accelerating their careers. Signing up takes less than a minute!
          </p>
        </div>

        {/* Form Panel */}
        <div className="lg:w-1/2 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-primary mb-4">Sign Up</h2>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error text-sm">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {signUpComplete && !error && (
              <div className="alert alert-success text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Success</h3>
                  <p>Account created! Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            {[
              { name: 'fullName', label: 'Full Name', icon: User, placeholder: 'John Doe' },
              { name: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com', type: 'email' },
              { name: 'designation', label: 'Designation', icon: Briefcase, placeholder: 'Professor, Student, etc.' },
              { name: 'department', label: 'Department', icon: Building2, placeholder: 'Computer Science, etc.' },
            ].map(({ name, label, icon: Icon, placeholder, type = 'text' }, index) => (
              <div key={index} className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">{label}</span>
                </label>
                <div className="flex items-center gap-2 input input-bordered">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <input
                    {...register(name as keyof z.infer<typeof registerFormSchema>)}
                    placeholder={placeholder}
                    type={type}
                    className="grow bg-transparent outline-none"
                  />
                </div>
                {errors[name as keyof typeof errors] && (
                  <p className="text-error text-sm mt-1">
                    {errors[name as keyof typeof errors]?.message?.toString()}
                  </p>
                )}
              </div>
            ))}

            {/* Password Field with Toggle */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="flex items-center gap-2 input input-bordered">
                <Lock className="w-4 h-4 text-primary shrink-0" />
                <input
                  {...register('password')}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  className="grow bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="text-primary"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Link to Sign In */}
            <div className="text-sm text-primary text-center">
              <Link href="/sign-in" className="hover:underline">
                Already registered? Sign in here
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting || authLoading || signUpComplete}
            >
              {isSubmitting
                ? 'Creating Account...'
                : signUpComplete
                ? 'Account Created!'
                : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
