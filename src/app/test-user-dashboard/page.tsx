"use client";
import React, { useMemo, useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/utils/trpc";
import { StudentNav } from "@/components/student-nav";
import { AlertCircle, CheckCircle2, ClipboardCheck, KeyRound, Loader2 } from "lucide-react";

function UserPage() {
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null
  );
  const router = useRouter();
  const { data: profile } = trpc.getMyTestUserProfile.useQuery();
  const validateTestCode = trpc.validateTestCode.useMutation();
  const name = (profile?.fullName as string | undefined) ?? "";
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .filter(Boolean)
        .map((el) => el[0].toUpperCase())
        .join(""),
    [name]
  );
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
      const { exists, attempted } = await validateTestCode.mutateAsync(test_id);

      if (!exists) {
        setSubmissionMessage("Test does not exist.");
        return;
      }

      if (attempted) {
        setSubmissionMessage("You have already submitted this test.");
        return;
      }

      router.replace(`/test-user-dashboard/test/${test_id}`);
      setSubmissionMessage("Test exists! You can start the test.");
    } catch (err) {
      setSubmissionMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNav name={name} initials={initials} />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-10">
        <section className="grid w-full gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <ClipboardCheck className="h-4 w-4" />
              Student Workspace
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Enter your test code to begin
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Once you submit a test, it is locked for your account. Copying
              during a test will automatically submit a zero-score attempt.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">One attempt</p>
                <p className="text-sm text-slate-500">
                  Submitted tests cannot be opened again.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Timed session</p>
                <p className="text-sm text-slate-500">
                  Finish before the timer reaches zero.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-950">Start Test</h2>
              <p className="text-sm text-slate-500">
                Paste the test UUID shared by your test admin.
              </p>
            </div>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Test Code</span>
              </div>
              <div className="input input-bordered flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="grow font-mono text-sm text-white"
                  {...register("test_id")}
                />
              </div>
            </label>

            {errors.test_id && (
              <div className="mt-3 flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                {errors.test_id.message}
              </div>
            )}

            {submissionMessage && (
              <div
                className={`alert mt-4 text-sm ${
                  submissionMessage.includes("does not exist") ||
                  submissionMessage.includes("already") ||
                  submissionMessage.startsWith("Error")
                    ? "alert-error"
                    : "alert-success"
                }`}
              >
                {submissionMessage.includes("does not exist") ||
                submissionMessage.includes("already") ||
                submissionMessage.startsWith("Error") ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>{submissionMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn mt-5 w-full bg-slate-950 text-white hover:bg-slate-800"
              disabled={validateTestCode.isPending}
            >
              {validateTestCode.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {validateTestCode.isPending ? "Checking..." : "Start Test"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default UserPage;
