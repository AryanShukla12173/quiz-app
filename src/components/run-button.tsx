"use client";
import React from "react";
import { Play } from "lucide-react";

type RunButtonProps = {
  onRun: () => void;
  isRunning: boolean;
};

function RunButton({ onRun, isRunning }: RunButtonProps) {
  return (
    <button
      className="btn btn-sm btn-outline gap-2"
      onClick={onRun}
      disabled={isRunning}
    >
      <Play className="h-4 w-4" />
      {isRunning ? "Running..." : "Run"}
    </button>
  );
}

export default RunButton;