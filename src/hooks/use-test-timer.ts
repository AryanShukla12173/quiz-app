import { useEffect } from "react";
import { testStore } from "@/store/testEditorStore";

export function useTestTimer(autoSubmit: () => void) {
  const timeLeft = testStore((state) => state.timeLeft);
  const isRunning = testStore((state) => state.isTimerRunning);
  const stopTimer = testStore((state) => state.stopTimer);
  
  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft === 0) {
      stopTimer();
      autoSubmit();
    }
  }, [timeLeft, isRunning, stopTimer, autoSubmit]);

  return timeLeft;
}
