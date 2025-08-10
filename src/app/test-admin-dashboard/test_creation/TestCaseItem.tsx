"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export default function TestCaseItem({
  problemIndex,
  testCaseIndex,
  control,
  removeTestCase,
}: {
  problemIndex: number;
  testCaseIndex: number;
  control: undefined;
  removeTestCase: () => void;
}) {
  return (
    <div className="mb-4 p-3 border rounded bg-base-200 relative">
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-medium">Test Case {testCaseIndex + 1}</h5>
        <Button variant="destructive" size="lg" onClick={removeTestCase}>
          <Trash size={14} /> Remove
        </Button>
      </div>

      <FormField
        control={control}
        name={`problem.${problemIndex}.testcases.${testCaseIndex}.input`}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Input</FormLabel>
            <FormControl>
              <textarea
                rows={3}
                className="textarea textarea-bordered w-full font-mono text-sm"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`problem.${problemIndex}.testcases.${testCaseIndex}.expectedOutput`}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Expected Output</FormLabel>
            <FormControl>
              <textarea
                rows={3}
                className="textarea textarea-bordered w-full font-mono text-sm"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`problem.${problemIndex}.testcases.${testCaseIndex}.description`}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Description (optional)</FormLabel>
            <FormControl>
              <textarea
                rows={2}
                className="textarea textarea-bordered w-full text-sm"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`problem.${problemIndex}.testcases.${testCaseIndex}.hidden`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hidden Test Case</FormLabel>
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="checkbox"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
