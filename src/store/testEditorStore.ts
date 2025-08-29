import { create } from "zustand";
import { codeTestSchema, problemOutput } from "@/lib/schemas/data_schemas";
import z from "zod";
import { Languages } from "@/lib/constants";

type codeExecutionResult = {
  problem_id: string;
  problem_result: {
    testCaseInput: string;
    testCaseOutput: string;
    actualInput: string;
    actualOutput: string;
    correctOutput: boolean;
    hidden: boolean;
  }[];
}[];

type CodeMapItem = {
  problemId: string;
  code: string;
  languageId: string;
};

type TestStore = {
  testObject: z.infer<typeof codeTestSchema> | null;
  problems: z.infer<typeof problemOutput>[];
  selectedProblemId: string;
  codeMap: CodeMapItem[];
  testCaseCodeExecutionMap: codeExecutionResult;
  stdin: string;
  output: string;
  activeTab: "Problem" | "Test" | "Submit";

  setSelectedProblemId: (problem_id: string) => void;
  setActiveTab: (value: "Problem" | "Test" | "Submit") => void;
  updateProblemCode: (problemId: string, code: string) => void;
  resetProblemLanguage: (problemId: string, languageId: string) => void;

  // Timer
  timeLeft: number;
  isTimerRunning: boolean;
  timerInterval: ReturnType<typeof setInterval> | null;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  restoreTimer: () => void;
};

export const testStore = create<TestStore>((set, get) => ({
  testObject: null,
  problems: [],
  selectedProblemId: "",
  codeMap: [],
  stdin: "",
  output: "",
  activeTab: "Problem",
  testCaseCodeExecutionMap: [],

  setSelectedProblemId: (problem_id) => set({ selectedProblemId: problem_id }),
  setActiveTab: (value) => set({ activeTab: value }),

  updateProblemCode: (problemId, code) =>
    set((state) => {
      const exists = state.codeMap.some((c) => c.problemId === problemId);
      const updated = state.codeMap.map((c) =>
        c.problemId === problemId ? { ...c, code } : c
      );

      return {
        ...state,
        codeMap: exists
          ? updated
          : [
              ...state.codeMap,
              {
                problemId,
                code,
                languageId: Languages[0]?.id ?? "java",
              },
            ],
      };
    }),

  resetProblemLanguage: (problemId, languageId) =>
    set((state) => {
      const lang = Languages.find((l) => l.id === languageId);
      if (!lang) return state;

      const exists = state.codeMap.some((c) => c.problemId === problemId);
      const updated = state.codeMap.map((c) =>
        c.problemId === problemId
          ? { ...c, code: lang.boilerplate, languageId }
          : c
      );

      return {
        ...state,
        codeMap: exists
          ? updated
          : [
              ...state.codeMap,
              {
                problemId,
                code: lang.boilerplate,
                languageId,
              },
            ],
      };
    }),

  // Timer
  timeLeft: 0,
  isTimerRunning: false,
  timerInterval: null,

  startTimer: (duration: number) => {
    if (get().isTimerRunning) return;

    const endTime = Date.now() + duration * 1000;
    localStorage.setItem("testEndTime", endTime.toString());

    set({ timeLeft: duration, isTimerRunning: true });

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem("testEndTime");
        set({ isTimerRunning: false, timeLeft: 0, timerInterval: null });
      } else {
        set({ timeLeft: remaining });
      }
    }, 1000);

    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const current = get().timerInterval;
    if (current) clearInterval(current);
    localStorage.removeItem("testEndTime");
    set({ isTimerRunning: false, timerInterval: null });
  },

  restoreTimer: () => {
    const endTimeStr = localStorage.getItem("testEndTime");
    if (!endTimeStr) return;

    const endTime = parseInt(endTimeStr, 10);
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

    if (remaining > 0) {
      get().startTimer(remaining);
    } else {
      localStorage.removeItem("testEndTime");
    }
  },
}));
