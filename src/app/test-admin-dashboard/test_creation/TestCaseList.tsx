"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TestCaseItem from "./TestCaseItem";

export default function TestCaseList({
  problemIndex,
  testcases,
  appendTestCase,
  removeTestCase,
  control,
}: {
  problemIndex: number;
  testcases: { id: string }[];
  appendTestCase: () => void;
  removeTestCase: (index: number) => void;
  control: any;
}) {
  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold mb-2">Test Cases</h4>

      {testcases.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">No test cases added yet.</p>
      )}

      {testcases.map((testcase, index) => (
        <TestCaseItem
          key={testcase.id}
          problemIndex={problemIndex}
          testCaseIndex={index}
          control={control}
          removeTestCase={() => removeTestCase(index)}
        />
      ))}

      <Button size="sm" variant="outline" onClick={appendTestCase} className="mt-2">
        <Plus size={16} /> Add Test Case
      </Button>
    </div>
  );
}
