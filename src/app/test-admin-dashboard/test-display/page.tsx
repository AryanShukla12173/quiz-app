"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/utils/trpc";
import { Copy, Loader, Trash2 } from "lucide-react";

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
    return (
      <div className="flex justify-center p-8">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error max-w-md mx-auto">
        <span>Error loading tests: {error?.message}</span>
      </div>
    );
  }

  if (isSuccess && (!data || data.length === 0)) {
    return (
      <div className="text-center text-lg py-8">
        No Tests Created Yet
      </div>
    );
  }

  return (
    
    <div className="flex flex-col gap-3 p-3">
      <h1 className="text-2xl font-bold">Tests Dashboard</h1>
      {data?.map((item, index) => (
        <div key={item.testId ?? index} className="card bg-base-100 shadow-lg border">
          <div className="card-body">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="card-title">{item.testTitle}</h2>
                <p className="text-sm opacity-70">{item.testDescr}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(item.testId.toString())}
                  aria-label="Copy Test ID"
                  title={
                    copiedId === item.testId.toString() ? "Copied!" : "Copy Test ID"
                  }
                  className={`btn btn-ghost btn-sm ${
                    copiedId === item.testId.toString() ? "bg-success text-success-content" : ""
                  }`}
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => deleteTestMutation.mutate(item.testId)}
                  className="btn btn-error btn-sm"
                  disabled={isLoading}
                  aria-label="Delete Test"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <p className="mt-2 text-sm">
              <span className="font-semibold">Test ID:</span> {item.testId}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Duration:</span> {item.testDuration} minutes
            </p>

            {/* Footer */}
            <div className="mt-4 text-xs opacity-70">
              Created at: {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TestDisplay;
