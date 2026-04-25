"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInSchema } from "@/lib/schemas/formschemas";
import { trpc } from "@/lib/utils/trpc";
import { setAuthSession } from "@/lib/auth/session";

export default function AdminSignInForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = trpc.login.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const data = await login.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      if (data.user.role !== "test_admin" && data.user.role !== "admin") {
        setErrorMsg("This account is not an admin account.");
        return;
      }

      setAuthSession(data.token);
      router.replace("/test-admin-dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Section */}
          <div className="flex flex-col items-center justify-center bg-slate-950 p-6 text-white md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-center">
              Welcome!
            </h1>
            <p className="text-base md:text-lg text-center">
              Login to access the test admin platform.
            </p>
          </div>

          {/* Right Section */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 md:space-y-6 "
            >
            <h2 className="text-center text-xl font-semibold text-slate-950 md:text-2xl">
                Admin Login
              </h2>

              {/* Error Message */}
              {errorMsg && (
                <div className="alert alert-error shadow-sm">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <h3 className="font-bold">Login Error</h3>
                    <div className="text-sm">{errorMsg}</div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="form-control w-[90%] mx-6">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <div className="flex items-center gap-2 input input-bordered h-10 md:h-12">
                  <Mail className="w-5 h-5 shrink-0 text-slate-500" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="grow bg-transparent outline-none h-full py-2 text-white"
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-control w-[90%] mx-6">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <div className="flex items-center gap-2 input input-bordered h-10 md:h-12">
                  <Lock className="w-5 h-5 shrink-0 text-slate-500" />
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="grow bg-transparent outline-none h-full py-2 text-white"
                  />
                </div>
                {errors.password && (
                  <p className="text-error text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-col sm:flex-row justify-between text-sm gap-2 sm:gap-0">
                <Link
                  href="/forgot-password"
                  className="text-center text-slate-600 hover:text-slate-950 hover:underline sm:text-left"
                >
                  Forgot Password?
                </Link>
                <Link
                  href="/sign-up"
                  className="text-center text-slate-600 hover:text-slate-950 hover:underline sm:text-right"
                >
                  New user? Register here
                </Link>
              </div>
              <div className="text-center text-sm">
                <Link href="/" className="text-slate-600 hover:text-slate-950 hover:underline">
                  Home
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn w-full bg-slate-950 text-white hover:bg-slate-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
