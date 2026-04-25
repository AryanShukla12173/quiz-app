"use client";
import React from "react";
import { testStore } from "@/store/testEditorStore";
import TestTab from "./testTab";
import TestCaseTab from "./testCasesTab";
function Tabs() {
  const activeTab = testStore((state)=>state.activeTab)
  const setActiveTab = testStore((state)=>state.setActiveTab)
  const tabs = ["Test", "Submit"] as const;

  React.useEffect(() => {
    if (activeTab === "Problem") {
      setActiveTab("Test");
    }
  }, [activeTab, setActiveTab]);

  return (
    <aside className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg bg-base-100 shadow-sm">
      <div className="flex min-h-11 items-center border-b border-slate-200 bg-base-50 px-3">
        <div className="tabs tabs-boxed bg-base-200">
        {tabs.map((tab) => (
          <input
            key={tab}
            type="radio"
            name="my_tabs_3"
            className="tab text-white"
            aria-label={tab}
            checked={activeTab === tab}
            onChange={() => setActiveTab(tab)}
          />
        ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-base-100 ">
        {activeTab === "Test" && <TestTab />}

        {activeTab === "Submit" && <TestCaseTab />}
      </div>
    </aside>
  );
}

export default Tabs;
