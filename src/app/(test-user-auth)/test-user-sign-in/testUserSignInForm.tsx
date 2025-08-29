"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signInSchema } from "@/lib/schemas/formschemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/utils/supabase/client";

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
  const supabase = createClient();
  const router = useRouter();

  const onSubmit = async (formData: z.infer<typeof signInSchema>) => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.replace("/test-user-dashboard");
      } else {
        setError("No user found. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error during Sign In.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4 font-sans">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary-content">
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
                <Mail className="w-5 h-5 text-primary" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="grow"
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
                <Lock className="w-5 h-5 text-primary" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="grow"
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
              className="btn btn-primary w-full"
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
