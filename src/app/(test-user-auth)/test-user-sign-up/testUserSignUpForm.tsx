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
} from "lucide-react";
const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
import { trpc } from "@/lib/utils/trpc";
import { createClient } from "@/lib/utils/supabase/client";
import { useRouter } from "next/navigation";

function TestUserSignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const router = useRouter();
  const addTestUserProfile = trpc.createTestUserProfile.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof testUserSignUpSchema>>({
    resolver: zodResolver(testUserSignUpSchema),
  });

  const supabaseClient = createClient();

  const onSubmit = async (formData: z.infer<typeof testUserSignUpSchema>) => {
    setFormError(null);
    setFormSuccess(null);

    try {
      const { email, password } = formData;
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.user?.id) {
        addTestUserProfile.mutate(
          {
            branch: formData.branch,
            enrollmentId: formData.enrollmentId,
            fullName: formData.fullName,
            year: formData.year,
            role: 'test_user',
          },
          {
            onSuccess: () => {
              setFormSuccess("Account created successfully! Redirecting...");
              setTimeout(() => {
                router.replace("/test-user-dashboard");
              }, 1500);
            },
            onError: (err) => {
              setFormError("Error saving profile: " + err.message);
            },
          }
        );
      }
    } catch (err) {
      setFormError("Unexpected error: " + err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-[28vw] m-auto gap-3 justify-between items-center my-18 p-6 shadow-2xl"
    >
      <h1 className="text-2xl font-bold mb-3">Test User Sign Up</h1>

      {/* Show form errors or success */}
      {formError && (
        <div className="alert alert-error w-full">
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="alert alert-success w-full">
          <span>{formSuccess}</span>
        </div>
      )}

      <label className="input">
        <User /> Full Name
        <input {...register("fullName")} />
      </label>
      {errors.fullName && (
        <p className="text-red-500 text-sm">{errors.fullName.message}</p>
      )}

      <label className="input">
        <MailIcon /> Email
        <input {...register("email")} />
      </label>
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <label className="input">
        <IdCardIcon /> Enrollment ID
        <input {...register("enrollmentId")} />
      </label>
      {errors.enrollmentId && (
        <p className="text-red-500 text-sm">{errors.enrollmentId.message}</p>
      )}

      <label className="input">
        <BookOpen /> Branch
        <input {...register("branch")} />
      </label>
      {errors.branch && (
        <p className="text-red-500 text-sm">{errors.branch.message}</p>
      )}

      <select defaultValue="Year" className="select" {...register("year")}>
        <option disabled>Pick Current Year</option>
        {yearOptions.map((option, ind) => (
          <option key={ind}>{option}</option>
        ))}
      </select>
      {errors.year && (
        <p className="text-red-500 text-sm">{errors.year.message}</p>
      )}

      <label className="input relative">
        <Lock /> Password
        <input
          type={showPassword ? "text" : "password"}
          {...register("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </label>
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password.message}</p>
      )}

      <button
        className="btn btn-primary w-1/2"
        type="submit"
        disabled={addTestUserProfile.isPending}
      >
        {addTestUserProfile.isPending ? "Creating..." : "Sign Up"}
      </button>
    </form>
  );
}

export default TestUserSignUpPage;
