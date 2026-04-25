"use client";
import React from "react";
import { testStore } from "@/store/testEditorStore";

function  ProblemTab() {
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const problems = testStore((state) => state.problems);
  const problem = problems?.find((p) => p.id === selectedProblemId);

  if (!problem) return <div>No problem selected</div>;

  // Pick the first testcase for reference
  const testcase = problem.testcases?.[0];

  return (
    <div className="flex flex-col gap-5 p-6 bg-base-200 border border h-full">
      {/* Title */}
      <div>
        <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-base-100 px-3 py-1 text-xs font-medium text-emerald-700">
          {problem.score} points
        </div>
        <h2 className="text-2xl font-semibold text-white">
          {problem.title}
        </h2>
      </div>

      {/* Description */}
      <p className="whitespace-pre-wrap leading-7 text-white">
        {problem.description ?? "No description provided."}
      </p>

      {/* Example Testcase */}
      {testcase && (
        <div className="flex flex-col gap-3 rounded-lg border border-base-100 bg-base-50 p-4">
          <div className="font-semibold text-white">Example Input</div>
          <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-sm text-slate-100">
            {testcase.input}
          </pre>
          <div className="font-semibold text-white">Example Output</div>
          <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-sm text-slate-100">
            {testcase.expectedOutput}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProblemTab;
