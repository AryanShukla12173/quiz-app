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
  languageId: string; // store language per problem
};

type testStore = {
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
};

export const testStore = create<testStore>((set) => ({
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

  // Update code for a problem
  updateProblemCode: (problemId, code) =>
    set((state) => {
      const updated = state.codeMap.map((c) =>
        c.problemId === problemId ? { ...c, code } : c
      );

      const exists = state.codeMap.some((c) => c.problemId === problemId);

      return {
        ...state,
        codeMap: exists
          ? updated
          : [
              ...state.codeMap,
              {
                problemId,
                code,
                languageId: Languages[0].id, // default to first language if missing
              },
            ],
      };
    }),

  // Reset problem code and language when switching language
  resetProblemLanguage: (problemId, languageId) =>
    set((state) => {
      const lang = Languages.find((l) => l.id === languageId);
      if (!lang) return state;

      const updated = state.codeMap.map((c) =>
        c.problemId === problemId
          ? { ...c, code: lang.boilerplate, languageId }
          : c
      );

      const exists = state.codeMap.some((c) => c.problemId === problemId);

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
}));
