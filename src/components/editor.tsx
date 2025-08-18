import React from "react";
import { Play } from "lucide-react";
import { Languages } from "@/lib/constants";
import { testStore } from "@/store/testEditorStore";

import Editor from "@monaco-editor/react";


function TestCodeEditor() {
  const selectedLanguage = testStore((state) => state.selectedLanguage);
  const selectedProblemId = testStore((state) => state.selectedProblemId);
  const selectedLanguageBoilerPlate = testStore(
    (state) => state.selectedLanguageBoilerPlate
  );
  function handleEditorChange(value: string | undefined) {
    if(value != null){
      testStore.setState((state)=>{
        const existing = state.codeMap
        const updated = existing.filter(c => c.problemId !== selectedProblemId)
        return{
          codeMap : [...updated,{code : value,problemId : selectedProblemId}]
        }
      })
    }
  }

  return (
    <div className="border">
      <div className="p-2 w-[50vw] flex flex-row gap-3 bg-base-300 justify-end-safe items-center-safe">
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
        <button className="btn btn-primary">
          <Play />
          Run
        </button>
      </div>

      <Editor
        height="92.3vh"
        language={selectedLanguage}
        value={selectedLanguageBoilerPlate}
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
