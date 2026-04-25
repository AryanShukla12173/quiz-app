"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { testUserSignUpSchema } from "@/lib/schemas/formschemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  IdCardIcon,
  Lock,
  MailIcon,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/navigation";
import { setAuthSession } from "@/lib/auth/session";

function TestUserSignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const router = useRouter();
  const registerAuth = trpc.register.useMutation();
  const addTestUserProfile = trpc.createTestUserProfile.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof testUserSignUpSchema>>({
    resolver: zodResolver(testUserSignUpSchema),
  });

  const onSubmit = async (formData: z.infer<typeof testUserSignUpSchema>) => {
    setFormError(null);
    setFormSuccess(null);

    try {
      const { email, password } = formData;
      const data = await registerAuth.mutateAsync({
        email,
        password,
        role: "test_user",
      });

      setAuthSession(data.token);
      await addTestUserProfile.mutateAsync({
        branch: formData.branch,
        enrollmentId: formData.enrollmentId,
        fullName: formData.fullName,
        year: formData.year,
        role: "test_user",
      });

      setFormSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        router.replace("/test-user-dashboard");
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unexpected error during sign up.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 font-sans">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl md:flex-row">
        {/* Left Panel */}
        <div className="flex items-center justify-center bg-slate-950 p-10 text-center text-white md:w-1/2">
          <div>
            <h1 className="text-3xl font-bold mb-4">Test User Sign Up</h1>
            <p className="text-lg">
              Create your test account and get instant access to the platform.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-center text-2xl font-semibold text-slate-950">
              Register
            </h2>

            {/* Error / Success */}
            {formError && (
              <div className="alert alert-error bg-error/10 border-error text-error text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="alert alert-success bg-success/10 border-success text-success text-sm">
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <User className="w-5 h-5 text-slate-500" />
                </span>
                <input
                  {...register("fullName")}
                  placeholder="John Doe"
                  className="input input-bordered join-item w-full"
                />
              </div>
              {errors.fullName && (
                <p className="text-error text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <MailIcon className="w-5 h-5 text-slate-500" />
                </span>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered join-item w-full"
                />
              </div>
              {errors.email && (
                <p className="text-error text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Enrollment ID */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Enrollment ID</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <IdCardIcon className="w-5 h-5 text-slate-500" />
                </span>
                <input
                  {...register("enrollmentId")}
                  placeholder="123456"
                  className="input input-bordered join-item w-full"
                />
              </div>
              {errors.enrollmentId && (
                <p className="text-error text-sm mt-1">
                  {errors.enrollmentId.message}
                </p>
              )}
            </div>

            {/* Branch */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Branch</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                </span>
                <input
                  {...register("branch")}
                  placeholder="Computer Science"
                  className="input input-bordered join-item w-full"
                />
              </div>
              {errors.branch && (
                <p className="text-error text-sm mt-1">
                  {errors.branch.message}
                </p>
              )}
            </div>

            {/* Year */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Year</span>
              </label>
              <select
                {...register("year")}
                className="select select-bordered w-full"
                defaultValue=""
              >
                <option disabled value="">
                  Pick Current Year
                </option>
                {yearOptions.map((option, idx) => (
                  <option key={idx}>{option}</option>
                ))}
              </select>
              {errors.year && (
                <p className="text-error text-sm mt-1">{errors.year.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="join w-full">
                <span className="join-item px-3 bg-base-200 flex items-center">
                  <Lock className="w-5 h-5 text-slate-500" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="input input-bordered join-item w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="btn join-item btn-square"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              className="btn w-full bg-slate-950 text-lg text-white hover:bg-slate-800"
              type="submit"
              disabled={registerAuth.isPending || addTestUserProfile.isPending}
            >
              {registerAuth.isPending || addTestUserProfile.isPending
                ? "Creating..."
                : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TestUserSignUpPage;
