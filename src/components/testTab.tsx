'use client'
import React from "react";
import { testStore } from "@/store/testEditorStore";
function TestTab() {
  const output =  testStore((state)=>state.output)
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full border-b ">
        <span className="font-bold text-xs ml-3">STDIN</span>
        <textarea
          className="h-[20vh] w-full font-light p-3 resize-none"
          placeholder={"Input for the program(optional)"}
        onChange={(e)=>testStore.setState({stdin : e.target.value})}
        />
      </div>
      <div className="flex flex-col p-3 gap-2">
        <span>Output</span>
        <div>{output}</div>
      </div>
    </div>
  );
}

export default TestTab;
