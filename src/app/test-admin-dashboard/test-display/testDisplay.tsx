"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/utils/trpc";
import { CalendarDays, ClipboardList, Clock, Copy, Loader, Trash2 } from "lucide-react";

function TestDisplay() {
  const utils = trpc.useUtils();
  const { data, error, isError, isLoading, isSuccess } =
    trpc.getTestsCreatedByUser.useQuery();

  const deleteTestMutation = trpc.deleteCodeTest.useMutation({
    onSuccess: () => {
      utils.getTestsCreatedByUser.invalidate();
    },
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return <Loader className="m-auto animate-spin" size={40} />;
  }

  if (isError) {
    return (
      <div className="alert alert-error mx-auto max-w-md">
        <span>Error loading tests: {error?.message}</span>
      </div>
    );
  }

  if (isSuccess && (!data || data.length === 0)) {
    return (
      <main className="min-h-screen w-full bg-slate-100 p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="text-lg font-semibold text-slate-950">No tests created yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Created tests will appear here with their shareable IDs.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-100 p-6">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-slate-900" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Created Tests</h1>
            <p className="text-sm text-slate-500">
              Copy a test ID to share it with students.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-2">
        {data?.map((item, index) => (
          <article
            key={(item.testId as string) ?? index}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{item.testTitle as string}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {(item.testDescr as string) || "No description"}
                </p>
              </div>
              <button
                onClick={() => deleteTestMutation.mutate(item.testId as string)}
                className="btn btn-error btn-sm"
                disabled={deleteTestMutation.isPending}
                aria-label="Delete Test"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">
                Test ID
              </p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                  {item.testId as string}
                </code>
                <button
                  onClick={() => copyToClipboard(item.testId as string)}
                  aria-label="Copy Test ID"
                  title={
                    copiedId === (item.testId as string)
                      ? "Copied"
                      : "Copy Test ID"
                  }
                  className={`btn btn-sm ${
                    copiedId === (item.testId as string)
                      ? "btn-success"
                      : "btn-outline"
                  }`}
                >
                  <Copy size={16} />
                  {copiedId === (item.testId as string) ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {item.testDuration as string} minutes
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {new Date(item.createdAt as string).toLocaleString()}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default TestDisplay;
