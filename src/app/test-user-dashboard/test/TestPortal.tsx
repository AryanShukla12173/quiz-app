"use client";
import React, { useEffect } from "react";
import ProblemList from "@/components/problemlist";
import TestCodeEditor from "@/components/editor";
import TestTabs from "@/components/Tabs";
import { trpc } from "@/lib/utils/trpc";
import { testStore } from "@/store/testEditorStore";

function TestPortal() {
  const fetchTestData = trpc.fetchTestData.useQuery;
  const { data, isSuccess } = fetchTestData(
    "2ef3d709-93bf-48c0-ac53-798ae42dd6ad"
  );

  // Store values
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const problems = testStore((state) => state.problems);
  const setSelectedProblemId = testStore((state) => state.setSelectedProblemId);
  const setActiveTab = testStore((state) => state.setActiveTab);

  useEffect(() => {
    if (isSuccess && data?.problem) {
      // Load problems into store
      testStore.setState({ problems: data.problem });

      // If no problem selected, select the first one
      if (!selectedProblemId && data.problem.length > 0) {
        setSelectedProblemId(data.problem[0].id);
      }
    }
  }, [isSuccess, data?.problem, selectedProblemId, setSelectedProblemId]);

  // Get testcases for the selected problem
  const selectedProblem = problems.find((p) => p.id === selectedProblemId);
  const testcases = selectedProblem?.testcases ?? [];
  const testcaseInputs = testcases.map((tc) => tc.input);

  const codeMap = testStore((state) => state.codeMap);
  const savedProblem = codeMap.find((c) => c.problemId === selectedProblemId);
  const languageId = savedProblem?.languageId ?? "java";

  const ext = languageId ? languageId : "txt";

  const { mutate: executeCodeBatch } = trpc.executeCodeBatch.useMutation();

  const runCodeBatch = async () => {
    const codeContent = savedProblem?.code ?? "";

    executeCodeBatch(
      {
        problemId: selectedProblemId,
        input: {
          stdin: testcaseInputs,
          language: languageId,
          files: [
            {
              name: `Main.${ext}`,
              content: codeContent,
            },
          ],
        },
        testcases: testcases,
      },
      {
        onSuccess: (res) => {
          testStore.setState((state) => ({
            testCaseCodeExecutionMap: [
              ...state.testCaseCodeExecutionMap.filter(
                (r) => r.problem_id !== res.problem_id
              ),
              res,
            ],
          }));
        },
        onError: (err) => {
          console.error(err);
        },
      }
    );

    setActiveTab("Submit");
  };

  return (
    <div className="overflow-hidden">
      <nav className="navbar p-3">
        <div className="navbar-start">
          <span className="text-2xl text-blue-400 font-bold">QuizApp</span>
        </div>
        <div className="navbar-end">
          <button className="btn btn-primary" onClick={runCodeBatch}>
            Submit
          </button>
        </div>
      </nav>
      {isSuccess && (
        <div className="flex flex-row">
          <ProblemList />
          <TestCodeEditor />
          <TestTabs />
        </div>
      )}
    </div>
  );
}

export default TestPortal;
