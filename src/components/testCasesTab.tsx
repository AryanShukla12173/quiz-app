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
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 p-6">
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
                  <td>{idx + 1}</td>
                  <td className={execResult?.correctOutput ? "text-success" : "text-error"}>
                    {execResult?.correctOutput ? "Passed" : "Failed"}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => {
                        const modal = document.getElementById(
                          `modal_${idx}`
                        ) as HTMLDialogElement | null;
                        modal?.showModal();
                      }}
                    >
                      <Eye />
                    </button>
                    <dialog id={`modal_${idx}`} className="modal">
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
  );
}

export default TestCaseTab;
