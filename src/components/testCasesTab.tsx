"use client";
import React from "react";
import { testStore } from "@/store/testEditorStore";
import { Eye } from "lucide-react";

function TestCaseTab() {
  const selectedProblemId = testStore((state) => state.selectedProblemId);

  const testcases = testStore((state) => state.problems).find(
    (item) => item.id === selectedProblemId
  )?.testcases;

  const testcasesExecutionResult = testStore(
    (state) => state.testCaseCodeExecutionMap
  ).filter((item) => item.problem_id === selectedProblemId);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="font-semibold text-white">Submission Results</h2>
        <p className="text-sm text-slate-500">
          Results appear after submitting the current problem.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Test Case Id</th>
            <th>Status</th>
            <th>Test case Info</th>
          </tr>
        </thead>
        <tbody>
          {testcases &&
            testcases.map((item, idx) => {
              const execResult = testcasesExecutionResult[0]?.problem_result[idx];

              return (
                <tr key={idx}>
                  <td className="text-white">{idx + 1}</td>
                  <td className={execResult?.correctOutput ? "text-success" : "text-error"}>
                    {execResult
                      ? execResult.correctOutput
                        ? "Passed"
                        : "Failed"
                      : "Not submitted"}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-xs"
                      onClick={() => {
                        const modal = document.getElementById(
                          `modal_${idx}`
                        ) as HTMLDialogElement | null;
                        modal?.showModal();
                      }}
                    >
                      <Eye />
                    </button>
                    <dialog id={`modal_${idx}`} className="modal text-white">
                      <div className="modal-box">
                        <h3 className="font-bold">Test Case Info</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Input:</strong> {item.input}
                          </p>
                          <p>
                            <strong>Expected Output:</strong> {item.expectedOutput}
                          </p>
                          <p>
                            <strong>Execution Output:</strong>{" "}
                            {execResult?.actualOutput ?? "Not executed"}
                          </p>
                        </div>
                        <div className="modal-action">
                          <form method="dialog">
                            <button className="btn">Close</button>
                          </form>
                        </div>
                      </div>
                    </dialog>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default TestCaseTab;
