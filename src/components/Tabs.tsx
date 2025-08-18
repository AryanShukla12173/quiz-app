'use client';
import React, { useState } from "react";
import { testStore } from "@/store/testEditorStore";
import ProblemTab from "./problemTab";
function TestTabs() {
  // Subscribe to store values
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  
  const problems = testStore((state) => state.problems);

  // Find the selected problem
  const problem = problems?.find((p) => p.id === selectedProblemId);
  console.log(problem)

  const [activeTab, setActiveTab] = useState<"Problem" | "Test" | "Submit">("Problem");

  return (
    <div className="w-[33vw] bg-base-300 p-2 border rounded-lg">
      {/* Tabs */}
      <div className="tabs tabs-lift">
        {["Problem", "Test", "Submit"].map((tab) => (
          <input
            key={tab}
            type="radio"
            name="my_tabs_3"
            className="tab"
            aria-label={tab}
            checked={activeTab === tab}
            onChange={() => setActiveTab(tab as "Problem" | "Test" | "Submit")}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content bg-base-100 border-base-300 p-4 rounded-md min-h-[200px] flex flex-col gap-2">
        {activeTab === "Problem" && problem && (
          <ProblemTab/>
        )}  

        {activeTab === "Test" && <div>Test content for the selected problem</div>}

        {activeTab === "Submit" && <div>Testcases content for the selected problem</div>}
      </div>
    </div>
  );
}

export default TestTabs;
