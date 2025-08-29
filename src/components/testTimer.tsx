import React, { useEffect } from "react";
import { useTestTimer } from "@/hooks/use-test-timer";
import { testStore } from "@/store/testEditorStore";

type TestTimerProps = {
  durationSeconds: number;
  onTimeUp: () => void;
};

export function TestTimer({ durationSeconds, onTimeUp }: TestTimerProps) {
  const timeLeft = useTestTimer(onTimeUp);
  const startTimer = testStore((state) => state.startTimer);
  const restoreTimer = testStore((state) => state.restoreTimer);
  
  useEffect(() => {
    // try to restore if already running
    restoreTimer();

    // if no timer exists, start a new one
    if (!localStorage.getItem("testEndTime")) {
      startTimer(durationSeconds);
    }
  }, [durationSeconds, startTimer, restoreTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const timerColor =
    timeLeft <= 5 * 60
      ? "bg-error text-error-content"
      : "bg-warning text-warning-content";

  return (
    <div
      className={`px-4 py-2 rounded-lg font-bold shadow-md flex items-center justify-center w-24 text-center ${timerColor} transition-colors duration-300`}
    >
      <span className="text-lg">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
