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
        router.replace("/test-user-dashboard"); // ✅ successful login
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-1/2 m-auto gap-5 justify-between items-center my-18 p-6 max-w-[25vw]"
    >
      <span className="text-2xl font-bold">Test User Sign In</span>

      <div className="flex flex-col justify-between items-center w-[25vw]">
        <label className="input">
          <Mail /> Email
          <input {...register("email")} />
        </label>
        {errors.email && <p className="text-error">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col justify-between items-center w-[25vw] relative">
        <label className="input w-full">
          <Lock /> Password
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
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
          <p className="text-error">{errors.password.message}</p>
        )}
      </div>

      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} /> Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      {error && <span className="text-error">{error}</span>}
    </form>
  );
}

export default TestUserSignInPage;
