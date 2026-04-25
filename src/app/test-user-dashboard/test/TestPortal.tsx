"use client";
import React, { useEffect, useRef } from "react";
import ProblemList from "@/components/problemlist";
import TestCodeEditor from "@/components/editor";
import TestTabs from "@/components/Tabs";
import ProblemTab from "@/components/problemTab";
import { trpc } from "@/lib/utils/trpc";
import { testStore } from "@/store/testEditorStore";
import { TestTimer } from "@/components/testTimer";
import { useRouter } from "next/navigation";
import { languageExtensions, Languages } from "@/lib/constants";
import { AlertTriangle, CheckCircle2, Loader2, Play, Send, XCircle } from "lucide-react";
type TestPortalProps = {
  testId : string
}
function TestPortal({testId}: TestPortalProps) {
  const fetchTestData = trpc.fetchTestData.useQuery;
  const { data, error, isError, isLoading, isSuccess } = fetchTestData(
    testId
  );
  const router = useRouter();
  const violationSubmittedRef = useRef(false);
  // Store values
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const problems = testStore((state) => state.problems);
  const setSelectedProblemId = testStore((state) => state.setSelectedProblemId);
  const setActiveTab = testStore((state) => state.setActiveTab);
  const stopTimer = testStore((state)=>state.stopTimer)
  
  const stdin = testStore((state) => state.stdin);

  useEffect(() => {
    if (isSuccess && data?.problem) {
      // Load problems into store
      testStore.setState({ problems: data.problem });

      // If no problem selected, select the first one
      if (!selectedProblemId && data.problem.length > 0) {
        setSelectedProblemId(data.problem[0].id);
      }
      if (data.testDuration && !testStore.getState().isTimerRunning) {
        testStore.getState().startTimer(data.testDuration * 60);
      }
    }
  }, [isSuccess, data?.problem, selectedProblemId, setSelectedProblemId,data?.testDuration]);
  
  // Get testcases for the selected problem
  const selectedProblem = problems.find((p) => p.id === selectedProblemId);
  const testcases = selectedProblem?.testcases ?? [];
  const testcaseInputs = testcases.map((tc) => tc.input);
  
  const codeMap = testStore((state) => state.codeMap);
  const savedProblem = codeMap.find((c) => c.problemId === selectedProblemId);
  const languageId = savedProblem?.languageId ?? "java";
  const savedCode =
  savedProblem?.code ??
  Languages.find((l) => l.id === languageId)?.boilerplate ??
  "";
  
  const ext = languageExtensions[languageId] ?? "txt";
  const resetProblemLanguage = testStore((state) => state.resetProblemLanguage);
  
  const {
    mutate: executeCodeBatch,
    isPending: isSubmitting,
  } = trpc.executeCodeBatch.useMutation();
  const { mutate: submitCopyViolation } = trpc.submitCopyViolation.useMutation();

  const finishTest = () => {
    stopTimer()
    router.replace("/test-user-dashboard/analytics");
  };

  useEffect(() => {
    const submitViolation = (event: ClipboardEvent) => {
      event.preventDefault();

      if (violationSubmittedRef.current) {
        return;
      }

      violationSubmittedRef.current = true;
      stopTimer();

      submitCopyViolation(
        { testId },
        {
          onSettled: () => {
            window.alert(
              "Copying is not allowed during the test. Your test has been submitted with 0 score."
            );
            router.replace("/test-user-dashboard/analytics");
          },
        }
      );
    };

    document.addEventListener("copy", submitViolation);
    document.addEventListener("cut", submitViolation);

    return () => {
      document.removeEventListener("copy", submitViolation);
      document.removeEventListener("cut", submitViolation);
    };
  }, [router, stopTimer, submitCopyViolation, testId]);

  const runCodeBatch = async () => {
    if (violationSubmittedRef.current) {
      return;
    }

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
          testStore.setState({ output: err.message });
        },
      }
    );

    setActiveTab("Submit");
  };
  const { mutate: executeCode, isPending } = trpc.executeCode.useMutation();

const runCode = () => {
  executeCode(
    {
      problem_id: selectedProblemId,
      language: languageId,
      stdin,
      files: [
        {
          name: `Main.${ext}`,
          content: savedCode,
        },
      ],
    },
    {
      onSuccess: (res) => {
        if (res.status === "success") {
          if (res.stderr?.trim()) {
            testStore.setState({ output: res.stderr });
          } else if (res.stdout?.trim()) {
            testStore.setState({ output: res.stdout });
          } else {
            testStore.setState({ output: "" });
          }
        }
      },
      onError: (err) => {
        testStore.setState({ output: err.message });
      },
    }
  );
};

  return (
    <div className="h-screen overflow-hidden bg-base-300 text-slate-900">
      <nav className="navbar min-h-14 border-b border-slate-800 bg-[#111827] px-4 text-slate-100">
        <div className="navbar-start">
          <div>
            <span className="text-xl font-semibold text-white">QuizApp</span>
            {data?.testTitle && (
              <p className="text-xs text-slate-400">{data.testTitle}</p>
            )}
          </div>
        </div>
        <div className="navbar-center">
          {data?.testDuration && (
            <TestTimer
              durationSeconds={data.testDuration * 60}
              onTimeUp={finishTest}
            />
          )}
        </div>
        <div className="navbar-end gap-3">
          <div className="flex min-h-12 items-center justify-between gap-3 border border-slate-800 bg-base-100 px-3 text-slate-100"> 
                  <div className="flex items-center gap-2">
                    <select
                      className="select select-sm w-36 border-slate-700 bg-slate-900 text-slate-100"
                      value={languageId}
                      onChange={(e) => {
                        const langId = e.target.value;
                        resetProblemLanguage(selectedProblemId, langId);
                      }}
                    >
                      {Languages.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
          
                    <button
                      className="btn btn-sm border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
                      onClick={runCode}
                      disabled={isPending}
                    >
                      <Play />
                      {isPending ? "Running..." : "Run"}
                    </button>
                  </div>
                </div>
          <button
            className="btn btn-sm border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
            onClick={runCodeBatch}
            disabled={isSubmitting || !selectedProblemId}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </button>
          <button className="btn btn-success btn-sm" onClick={finishTest}>
            <CheckCircle2 className="h-4 w-4" />
            Finish
          </button>
        </div>
      </nav>
      {isLoading && (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-5 py-4 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
            <span className="font-medium">Loading test...</span>
          </div>
        </div>
      )}
      {isSuccess && (
        <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[minmax(360px,42%)_minmax(520px,1fr)] gap-2 overflow-hidden p-2">
          <section className="flex min-w-0 flex-col overflow-hidden rounded-lg  bg-base-300 shadow-sm">
            <ProblemList />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProblemTab />
            </div>
          </section>

          <section className="grid min-w-0 grid-rows-[minmax(0,1fr)_280px] gap-2 overflow-hidden">
            <TestCodeEditor />
            <TestTabs />
          </section>
        </div>
      )}
      {isError && (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full bg-error/10 p-4 text-error">
            <XCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xl font-semibold text-error">Cannot open test</p>
            <p className="mt-1 max-w-xl text-sm text-base-content/70">
              {error.message}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.replace("/test-user-dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default TestPortal;
