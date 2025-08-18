import { create } from "zustand";
import { codeTestSchema, problemOutput } from "@/lib/schemas/data_schemas";
import z from "zod";
type codeExecutionResult = {
  problem_id: string;
  status: string;
  exception: null;
  stdout: string;
  executionTime: number;
  stdin: string;
}[];
type testStore = {
  testObject: z.infer<typeof codeTestSchema> | null;
  codeExecutionResult: codeExecutionResult;
  problems: z.infer<typeof problemOutput>[];
  selectedProblemId: string;
  selectedLanguage: string;
  selectedLanguageBoilerPlate: string;
  codeMap : {
    problemId : string,
    code : string
  }[],
  setSelectedProblemId : (problem_id : string ) => void
};

export const testStore = create<testStore>((set) => ({
  codeExecutionResult: [],
  testObject: null,
  problems: [],
  selectedProblemId:'',
  selectedLanguage: "java",
  selectedLanguageBoilerPlate: `public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  codeMap : [],
  setSelectedProblemId: (problem_id: string) => 
  set(() => ({ selectedProblemId: problem_id }))
}));
