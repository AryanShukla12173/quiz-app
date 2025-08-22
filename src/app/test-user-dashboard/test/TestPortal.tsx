"use client";
import React, { useEffect } from "react";
import ProblemList from "@/components/problemlist";
import TestCodeEditor from "@/components/editor";
import TestTabs from "@/components/Tabs";
import { trpc } from "@/lib/utils/trpc";
import { testStore } from "@/store/testEditorStore";
import { languageExtensions } from "@/lib/constants";
function TestPortal() {
  const fetch = trpc.fetchTestData.useQuery;
  const { data, isSuccess } = fetch("4e3adc69-501a-49e9-838a-755b23f3354f");
  // Subscribe to store values
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const problems = testStore((state) => state.problems);
  const setSelectedProblemId = testStore((state) => state.setSelectedProblemId);
  const setSelectedTab = testStore((state) => state.setActiveTab);
  useEffect(() => {
    if (isSuccess) {
      testStore.setState({ problems: data.problem });
    }

    if (!selectedProblemId && problems && problems.length > 0) {
      setSelectedProblemId(problems[0].id);
    }
  }, [
    selectedProblemId,
    problems,
    setSelectedProblemId,
    isSuccess,
    data?.problem,
  ]);
  const testcases = testStore((state) => state.problems).find(
    (item) => item.id === selectedProblemId
  )?.testcases;
  const testcaseArr: string[] = [];
  testcases?.forEach((item) => {
    testcaseArr.push(item.input);
  });
  const selectedLanguage = testStore((state) => state.selectedLanguage);
  const ext = languageExtensions[selectedLanguage] || "txt"; // default
  const codeMap = testStore((state) => state.codeMap);
  const selectedLanguageBoilerPlate = testStore(
    (state) => state.selectedLanguageBoilerPlate
  );
  const savedCode = codeMap.find(
    (c) => c.problemId === selectedProblemId
  )?.code;
  const { mutate: executeCodeBatch } = trpc.executeCodeBatch.useMutation();
  const runCodeBatch = async () => {
    executeCodeBatch(
      {
        problemId: selectedProblemId,
        input: {
          stdin: testcaseArr,
          language: selectedLanguage,
          files: [
            {
              name: `Main.${ext}`,
              content: savedCode ?? selectedLanguageBoilerPlate,
            },
          ],
        },
        testcases: testcases!,
      },
      {
        onSuccess: (res) => {
          console.log("data:", res);
          testStore.setState((state) => ({
            testCaseCodeExecutionMap: [
              // keep results for other problems
              ...state.testCaseCodeExecutionMap.filter(
                (r) => r.problem_id !== res.problem_id
              ),
              // add new result for this problem
              res,
            ],
          }));
        },
        onError: (res) => {
          console.log(res.data);
        },
      }
    );
  };
  return (
    <div className="overflow-hidden">
      <nav className="navbar p-3 ">
        <div className="navbar-start">
          <span className="text-2xl text-blue-400 font-bold">QuizApp</span>
        </div>
        <div className="navbar-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              runCodeBatch();
              setSelectedTab("Submit");
            }}
          >
            Submit
          </button>
        </div>
      </nav>
      <div className="flex flex-row">
        {isSuccess && <ProblemList />}
        <TestCodeEditor />
        <TestTabs />
      </div>
    </div>
  );
}

export default TestPortal;
