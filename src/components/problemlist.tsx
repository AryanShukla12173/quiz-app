"use client";
import React from "react";
import { testStore } from "@/store/testEditorStore";

function ProblemList() {
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const setSelectedProblemId = testStore((state) => state.setSelectedProblemId);
  const problems = testStore((state) => state.problems);
  return (
    <section className="border-b border-slate-200 bg-base-200 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-semibold text-white">Problems</h1>
          <p className="text-xs text-slate-500">
          {problems.length} problem{problems.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <ol className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2">
        {problems.map((item, idx) => (
          <li key={item.id} className="shrink-0">
            <button
              className={`flex min-w-40 items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                selectedProblemId === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => setSelectedProblemId(item.id)}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  selectedProblemId === item.id ? "bg-white/15" : "bg-white"
                }`}
              >
                {idx + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.title}</span>
                <span
                  className={`text-xs ${
                    selectedProblemId === item.id
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {item.score} points
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ProblemList;
