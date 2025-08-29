"use client";
import React from "react";
import { testStore } from "@/store/testEditorStore";

function ProblemTab() {
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const problems = testStore((state) => state.problems);
  const problem = problems?.find((p) => p.id === selectedProblemId);

  if (!problem) return <div>No problem selected</div>;

  // Pick the first testcase for reference
  const testcase = problem.testcases?.[0];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Title */}
      <h2 className="text-xl font-bold">{problem.title}</h2>

      {/* Description */}
      <p>{problem.description ?? "No description provided."}</p>

      {/* Example Testcase */}
      {testcase && (
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Example Input</div>
          <span className="bg-accent-content text-white p-2 rounded-md">
            {testcase.input}
          </span>
          <div className="font-semibold">Example Output</div>
          <span className="bg-accent-content  text-white p-2 rounded-md">
            {testcase.expectedOutput}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProblemTab;
