"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signInSchema } from "@/lib/schemas/formschemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { trpc } from "@/lib/utils/trpc";
import { setAuthSession } from "@/lib/auth/session";

function TestUserSignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = trpc.login.useMutation();
  const router = useRouter();

  const onSubmit = async (formData: z.infer<typeof signInSchema>) => {
    setLoading(true);
    setError("");
    try {
      const data = await login.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      if (data.user.role !== "test_user") {
        setError("This account is not a test user account.");
        return;
      }

      setAuthSession(data.token);
      router.replace("/test-user-dashboard");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error during Sign In.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="card w-full max-w-md border border-slate-200 bg-white shadow-2xl">
        <div className="card-body space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="mb-2 rounded-full bg-slate-100 p-3">
              <Lock className="h-6 w-6 text-slate-700" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-950">
              Test User Sign In
            </h2>
            <p className="text-sm text-base-content/70 text-center">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error bg-error/10 text-error border-error text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col justify-center-safe items-center-safe p-6">
            {/* Email */}
            <div className="form-control w-[90%] ">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="grow text-white"
                  disabled={loading}
                />
              </label>
              {errors.email && (
                <p className="text-error text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="form-control w-[90%]  relative ">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="grow text-white"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="btn btn-ghost btn-xs"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </label>
              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn w-full bg-slate-950 text-white hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TestUserSignInPage;
