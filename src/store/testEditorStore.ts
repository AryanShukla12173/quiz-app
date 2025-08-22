import { create } from "zustand";
import { codeTestSchema, problemOutput } from "@/lib/schemas/data_schemas";
import z from "zod";

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

type testStore = {
  testObject: z.infer<typeof codeTestSchema> | null;
  problems: z.infer<typeof problemOutput>[];
  selectedProblemId: string;
  selectedLanguage: string;
  selectedLanguageBoilerPlate: string;
  codeMap: {
    problemId: string;
    code: string;
  }[];
  testCaseCodeExecutionMap: codeExecutionResult;
  setSelectedProblemId: (problem_id: string) => void;
  stdin: string;
  output: string;
  activeTab: "Problem" | "Test" | "Submit";
  setActiveTab: (value: "Problem" | "Test" | "Submit") => void;
};

export const testStore = create<testStore>((set) => ({
  testObject: null,
  problems: [],
  selectedProblemId: "",
  selectedLanguage: "java",
  selectedLanguageBoilerPlate: `public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello World");
    }
}
`,
  codeMap: [],
  setSelectedProblemId: (problem_id: string) =>
    set(() => ({ selectedProblemId: problem_id })),
  stdin: "null",
  output: "",
  activeTab: "Problem",
  setActiveTab: (value) => set({ activeTab: value }),
  testCaseCodeExecutionMap: []
}));
