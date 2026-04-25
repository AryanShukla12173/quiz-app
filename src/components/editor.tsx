"use client";
import React from "react";
import { Play } from "lucide-react";
import { Languages, languageExtensions } from "@/lib/constants";
import { testStore } from "@/store/testEditorStore";
import Editor from "@monaco-editor/react";
import { trpc } from "@/lib/utils/trpc";

function TestCodeEditor() {
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const codeMap = testStore((state) => state.codeMap);
  const savedProblem = codeMap.find((c) => c.problemId === selectedProblemId);

  const languageId = savedProblem?.languageId ?? Languages[0].id;
  const savedCode =
    savedProblem?.code ??
    Languages.find((l) => l.id === languageId)?.boilerplate ??
    "";
  const ext = languageExtensions[languageId] || "txt";

  const updateProblemCode = testStore((state) => state.updateProblemCode);
  const resetProblemLanguage = testStore((state) => state.resetProblemLanguage);
  const setActiveTab = testStore((state) => state.setActiveTab);
  const stdin = testStore((state) => state.stdin);

  const { mutate: executeCode, isPending } = trpc.executeCode.useMutation();

  const handleEditorChange = (value: string | undefined) => {
    if (value != null) {
      updateProblemCode(selectedProblemId, value);
    }
  };

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
    setActiveTab("Test");
  };

  return (
    <section className="flex h-full min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-base-100 shadow-sm p-5">

      <Editor
        height="100%"
        language={languageId}
        value={savedCode}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          wordWrap: "on",
          fontSize: 16,
          minimap: { enabled: false },
        }}
      />
    </section>
  );
}

export default TestCodeEditor;
