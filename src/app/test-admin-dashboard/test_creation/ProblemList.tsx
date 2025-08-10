"use client";

import React from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProblemItem from "./ProblemItem";

export default function ProblemList({ control }: { control: any }) {
  const {
    fields: problems,
    append: appendProblem,
    remove: removeProblem,
  } = useFieldArray({
    control,
    name: "problem",
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Problems</h2>
        <Button
          onClick={() =>
            appendProblem({
              title: "",
              description: "",
              score: 0,
              testcases: [],
            })
          }
          className="flex items-center gap-1"
        >
          <Plus size={16} /> Add Problem
        </Button>
      </div>

      {problems.length === 0 ? (
        <p className="text-gray-500 text-center py-8 border border-dashed rounded-md">
          No problems added yet. Click &quot;Add Problem&quot; to get started.
        </p>
      ) : (
        problems.map((problem, index) => (
          <ProblemItem
            key={problem.id}
            problemIndex={index}
            control={control}
            removeProblem={() => removeProblem(index)}
          />
        ))
      )}
    </div>
  );
}
