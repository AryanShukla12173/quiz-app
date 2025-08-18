"use client";
import React, { useEffect } from "react";
import ProblemList from "@/components/problemlist";
import TestCodeEditor from "@/components/editor";
import TestTabs from "@/components/Tabs";
import { trpc } from "@/lib/utils/trpc";
import { testStore } from "@/store/testEditorStore";
function TestPortal() {
  const fetch = trpc.fetchTestData.useQuery;
  const { data, isSuccess } = fetch("66ce1101-b400-44f2-a250-8c5f8423641c");
  // Subscribe to store values
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const problems = testStore((state) => state.problems);
  const setSelectedProblemId = testStore((state) => state.setSelectedProblemId);

  // Initialize selectedProblemId if none
  useEffect(() => {
    if (isSuccess) {
      testStore.setState({ problems: data.problem });
    }

    if (!selectedProblemId && problems && problems.length > 0) {
      setSelectedProblemId(problems[0].id);
    }
  }, [selectedProblemId, problems, setSelectedProblemId,isSuccess,data?.problem]);

  return (
    <div className="flex flex-row">
      {isSuccess && <ProblemList />}
      <TestCodeEditor />
      <TestTabs />
    </div>
  );
}

export default TestPortal;
