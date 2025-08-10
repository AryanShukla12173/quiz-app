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
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import TestCaseList from "./TestCaseList";

export default function ProblemItem({
  problemIndex,
  control,
  removeProblem,
}: {
  problemIndex: number;
  control: undefined;
  removeProblem: () => void;
}) {
  const {
    fields: testcases,
    append: appendTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control,
    name: `problem.${problemIndex}.testcases`,
  });

  return (
    <div className="mb-8 p-4 border rounded-lg shadow-sm bg-base-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Problem {problemIndex + 1}</h3>
        <Button variant="destructive" size="sm" onClick={removeProblem}>
          <Trash size={16} /> Remove Problem
        </Button>
      </div>

      <FormField
        control={control}
        name={`problem.${problemIndex}.title`}
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Problem Title</FormLabel>
            <FormControl>
              <Input placeholder="Problem title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`problem.${problemIndex}.description`}
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Problem Description</FormLabel>
            <FormControl>
              <Input placeholder="Problem description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`problem.${problemIndex}.score`}
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel>Score</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                {...field}
                value={
                  field.value === undefined || field.value === null
                    ? ""
                    : field.value
                }
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? undefined : Number(val));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Test Cases Section */}
      <TestCaseList
        problemIndex={problemIndex}
        testcases={testcases}
        appendTestCase={() =>
          appendTestCase({
            input: "",
            expectedOutput: "",
            description: "",
            hidden: false,
          })
        }
        removeTestCase={removeTestCase}
        control={control}
      />
    </div>
  );
}
