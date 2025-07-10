'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Code2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/context/AuthContext'

const formSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { signIn, error: authError, loading: isLoading, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (data: FormValues) => {
    clearError()
    await signIn(data.email, data.password, UserRole.quiz_app_user)
    router.push('/coding-platform/start')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4 font-sans">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary-content">CodeTest</h2>
            <p className="text-sm text-base-content/70 text-center">
              Enter your credentials to sign in
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="alert alert-error bg-error/10 text-error border-error text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className="input input-bordered w-full"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div className="form-control w-full">
              <label className="label flex justify-between items-center">
                <span className="label-text font-semibold">Password</span>
                <Link
                  href="/coding-platform/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </label>
              <div className="join w-full">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered join-item w-full"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn join-item btn-square"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-sm text-center text-base-content">
            Don&apos;t have an account?{' '}
            <Link href="/coding-platform/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
