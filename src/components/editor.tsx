"use client";
import React from "react";
import { Play } from "lucide-react";
import { Languages } from "@/lib/constants";
import { testStore } from "@/store/testEditorStore";
import Editor from "@monaco-editor/react";
import { trpc } from "@/lib/utils/trpc";
import { languageExtensions } from "@/lib/constants";
function TestCodeEditor() {
  const selectedLanguage = testStore((state) => state.selectedLanguage);
  const ext = languageExtensions[selectedLanguage] || "txt";
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const selectedLanguageBoilerPlate = testStore(
    (state) => state.selectedLanguageBoilerPlate
  );
  const stdin = testStore((state) => state.stdin);
  const codeMap = testStore((state) => state.codeMap);
  const savedCode = codeMap.find(
    (c) => c.problemId === selectedProblemId
  )?.code;
  const {
    mutate: executeCode,
    isPending,
  } = trpc.executeCode.useMutation();
  // console.log(data)
  const setActiveTab = testStore((state)=>state.setActiveTab)
  function handleEditorChange(value: string | undefined) {
    if (value != null) {
      testStore.setState((state) => {
        const updated = state.codeMap.map((c) =>
          c.problemId === selectedProblemId
            ? { ...c, code: value, fileName: `Main.${ext}` }
            : c
        );
        const exists = state.codeMap.some(
          (c) => c.problemId === selectedProblemId
        );
        return {
          codeMap: exists
            ? updated
            : [
                ...updated,
                {
                  problemId: selectedProblemId,
                  code: value,
                  fileName: `Main.${ext}`,
                },
              ],
        };
      });
    }
  }

  const runCode = () => {
    executeCode(
      {
        problem_id: selectedProblemId,
        language: selectedLanguage,
        stdin,
        files: [
          {
            name: `Main.${ext}`,
            content: savedCode ?? selectedLanguageBoilerPlate,
          },
        ],
      },
      {
        onSuccess: (res) => {
          if (res.status === "success") {
            if (res.stderr && res.stderr.trim() !== "") {
              testStore.setState({ output: res.stderr });
            } else if (res.stdout && res.stdout.trim() !== "") {
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
    setActiveTab('Test')
  };

  return (
    <div className="border">
      <div className="p-2 w-[50vw] flex flex-row gap-3 bg-base-300 justify-end items-center">
        <select
          className="select w-1/6"
          value={selectedLanguage}
          onChange={(e) => {
            const langId = e.target.value;
            const lang = Languages.find((l) => l.id === langId);
            if (lang) {
              testStore.setState({
                selectedLanguage: lang.id,
                selectedLanguageBoilerPlate: lang.boilerplate,
              });
            }
          }}
        >
          {Languages.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-secondary"
          onClick={runCode}
          disabled={isPending}
        >
          <Play />
          {isPending ? "Running..." : "Run"}
        </button>
      </div>

      <Editor
        height="92.3vh"
        language={selectedLanguage}
        value={savedCode ?? selectedLanguageBoilerPlate}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          wordWrap: "on",
          fontSize: 16,
        }}
      />
    </div>
  );
}

export default TestCodeEditor;
