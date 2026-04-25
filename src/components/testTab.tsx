'use client'
import React from "react";
import { testStore } from "@/store/testEditorStore";
function TestTab() {
  const output =  testStore((state)=>state.output)
  return (
    <div className="grid h-full gap-4 p-4 md:grid-cols-2">
      <div className="w-full">
        <span className="text-sm font-semibold text-white">Custom Input</span>
        <textarea
          className="textarea textarea-bordered mt-2 h-[190px] w-full resize-none border-slate-200 bg-base-100 font-mono text-sm text-white"
          placeholder={"Input for the program"}
        onChange={(e)=>testStore.setState({stdin : e.target.value})}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-white">Output</span>
        <pre className="h-[190px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-3 font-mono text-sm text-slate-100">
          {output || "Run your code to see output here."}
        </pre>
      </div>
    </div>
  );
} 

export default TestTab;
