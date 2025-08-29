"use client";
import React from "react";
import { testStore } from "@/store/testEditorStore";

function ProblemList() {
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const setSelectedProblemId = testStore((state) => state.setSelectedProblemId);
  const problems = testStore((state) => state.problems);
  return (
    <ol className="w-1/6 border min-h-screen">
      <h1 className="bg-base-300 p-4 font-bold rounded-lg">Problems</h1>
      {problems.map((item, idx) => (
        <li
          key={item.id}
          className={`list-row p-2 cursor-pointer ${
            selectedProblemId === item.id
              ? "bg-primary text-primary-content"
              : "hover:bg-base-300"
          }`}
          onClick={() => setSelectedProblemId(item.id)}
        >
          {idx + 1}. {item.title}
        </li>
      ))}
    </ol>
  );
}

export default ProblemList;
