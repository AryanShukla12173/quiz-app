"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import Link from "next/link";
import { ChartBar } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
const navItems = [
  {
    id: 1,
    name: "Analytics",
    icon: <ChartBar />,
    href: "/test-user-dashboard",
  },
];

function UserPage() {
  const supabase = createClient();
  const [name, setName] = useState<string>("");
  const [initials, setInitials] = useState<string>("");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null
  );
  const router = useRouter()
  const formSchema = z.object({
    test_id: z.string().uuid({ message: "Invalid test ID format" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    setSubmissionMessage(null); // Reset message
    try {
      const { test_id } = formData;
      const { error, count } = await supabase
        .from("code_tests")
        .select("id", { count: "exact" })
        .eq("id", test_id)
        .single();

      if (error) {
        setSubmissionMessage(`Error: ${error.message}`);
        return;
      }

      if (count === 0) {
        setSubmissionMessage("Test does not exist.");
        return;
      }

      setSubmissionMessage("Test exists! You can start the test.");
    } catch (err) {
      setSubmissionMessage("An unexpected error occurred.");
      console.error(err);
    }
  };

  const fetchUserInitials = async () => {
    const { data, error } = await supabase
      .from("test_user_profile")
      .select("FullName")
      .single();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    if (data?.FullName) {
      setName(data.FullName);
      const arr = data.FullName.split(" ");
      const computedInitials = arr
        .map((el: string) => el[0].toUpperCase())
        .join("");
      setInitials(computedInitials);
    }
  };

  useEffect(() => {
    fetchUserInitials();
  });

  return (
    <>
      <nav className="navbar px-15 bg-base-300">
        <span className="navbar-start text-2xl font-bold text-primary">
          QuizApp
        </span>
        <div className="navbar-end gap-3 items-center">
          {navItems.map((item) => (
            <Link
              href={item.href}
              className="flex flex-row gap-2 font-bold text-md"
              key={item.id}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content w-10 rounded-full flex items-center justify-center">
              <span className="text-md">{initials}</span>
            </div>
          </div>

          <span className="font-bold">{name}</span>
          <button
            className="btn btn-primary rounded-2xl"
            onClick={() => {
              supabase.auth.signOut()
              router.replace('/')
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center gap-3 m-auto h-[80vh]"
      >
        <span className="text-3xl mb-5 font-bold">
          Enter Test Code for Starting Test
        </span>

        <label className="input">
          Test Code
          <input type="text" minLength={32} {...register("test_id")} />
        </label>

        {/* Zod / validation errors */}
        {errors.test_id && (
          <p className="text-red-500 text-sm">{errors.test_id.message}</p>
        )}

        {/* Submission result */}
        {submissionMessage && (
          <p
            className={`text-sm ${
              submissionMessage.includes("does not exist") ||
              submissionMessage.startsWith("Error")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {submissionMessage}
          </p>
        )}

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </>
  );
}

export default UserPage;
