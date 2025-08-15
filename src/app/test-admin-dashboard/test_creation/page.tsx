"use client";
import React from "react";
import { useForm, useFieldArray, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { CodeTestInput } from "@/lib/schemas/data_schemas";
import { trpc } from "@/lib/utils/trpc";
function TestCreationPage() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CodeTestInput>({
    defaultValues: {
      testTitle: "",
      testDescription: "",
      testDuration: 10,
      problem: []
    }
  });

  const {
    fields: problemFields,
    append: addProblem,
    remove: removeProblem,
  } = useFieldArray({
    control,
    name: "problem",
  });
  const {data,error,failureReason,mutate,isSuccess,isError,isPending} = trpc.createCodeTest.useMutation()
  const onSubmit = (data: CodeTestInput) => {
    console.log("Form Data:", JSON.stringify(data, null, 2));
    mutate(data)
    reset()
  };

  const addNewProblem = () => {
    addProblem({
      title: '',
      description: '',
      score: 10,
      testcases: [{
        input: '',
        expectedOutput: '',
        description: '',
        hidden: false
      }]
    });
  };

  return (
     <div className="min-h-screen w-screen bg-base-200">
      <div className="max-w-screen mx-auto card bg-base-100 shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Coding Test</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Success/Error Messages --- */}
          {isSuccess && (
            <div className="alert alert-success text-sm">
              ✅ Test created successfully!
            </div>
          )}
          {isError && (
            <div className="alert alert-error text-sm">
              ❌ {error?.message || "Something went wrong"}
            </div>
          )}

          {/* --- Test Information --- */}
          <div className="card bg-base-200 p-4">
            <h2 className="text-lg font-semibold mb-4">Test Information</h2>
            <div className="space-y-4">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Test Title *</span>
                </label>
                <input
                  {...register("testTitle", { required: "Test title is required" })}
                  placeholder="Enter title of the test"
                  className="input input-bordered w-full"
                />
                {errors.testTitle && (
                  <span className="text-error text-sm mt-1">{errors.testTitle.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Test Description</span>
                </label>
                <textarea
                  {...register("testDescription")}
                  placeholder="Enter the purpose of the test"
                  rows={3}
                  className="textarea textarea-bordered w-full"
                />
              </div>

              {/* Duration */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Test Duration (minutes) *</span>
                </label>
                <input
                  {...register("testDuration", { 
                    required: "Duration is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Duration must be at least 1 minute" }
                  })}
                  type="number"
                  min="1"
                  placeholder="Enter duration of test"
                  className="input input-bordered w-full"
                />
                {errors.testDuration && (
                  <span className="text-error text-sm mt-1">{errors.testDuration.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* --- Problems Section --- */}
          <div className="card bg-base-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Problems</h2>
              <button
                type="button"
                onClick={addNewProblem}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Add Problem
              </button>
            </div>

            {problemFields.length === 0 && (
              <p className="text-base-content/70 text-center py-4">No problems added yet. Click "Add Problem" to get started.</p>
            )}

            {problemFields.map((problemField, problemIndex) => (
              <ProblemForm
                key={problemField.id}
                problemIndex={problemIndex}
                register={register}
                control={control}
                errors={errors}
                onRemove={() => removeProblem(problemIndex)}
              />
            ))}

            {errors.problem && (
              <p className="text-error text-sm mt-2">At least one problem is required</p>
            )}
          </div>

          {/* --- Submit Button --- */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" className="btn btn-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`btn btn-success ${isPending ? "btn-disabled" : ""}`}
            >
              {isPending && <Loader2 className="animate-spin mr-2" size={16} />}
              {isPending ? "Creating..." : "Create Test"}
            </button> 
          </div>
        </form>
      </div>
    </div>
  );
}

// Props interface
interface ProblemFormProps {
  problemIndex: number;
  register: UseFormRegister<CodeTestInput>;
  control: Control<CodeTestInput>;
  errors: FieldErrors<CodeTestInput>;
  onRemove: () => void;
}

// Problem form component
function ProblemForm({ problemIndex, register, control, errors, onRemove }: ProblemFormProps) {
  const {
    fields: testCaseFields,
    append: addTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control,
    name: `problem.${problemIndex}.testcases`,
  });

  const addNewTestCase = () => {
    addTestCase({
      input: '',
      expectedOutput: '',
      description: '',
      hidden: false
    });
  };

  const problemErrors = errors.problem?.[problemIndex];

  return (
    <div className="card bg-base-100 border border-base-300 p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-md font-medium">Problem {problemIndex + 1}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="btn btn-ghost btn-xs text-error"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Problem Title */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Problem Title *</span>
          </label>
          <input
            {...register(`problem.${problemIndex}.title`, { 
              required: "Problem title is required" 
            })}
            placeholder="Enter problem title"
            className="input input-bordered w-full"
          />
          {problemErrors?.title && (
            <span className="text-error text-sm mt-1">{problemErrors.title.message}</span>
          )}
        </div>

        {/* Problem Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Problem Description</span>
          </label>
          <textarea
            {...register(`problem.${problemIndex}.description`)}
            placeholder="Enter problem description"
            rows={3}
            className="textarea textarea-bordered w-full"
          />
        </div>

        {/* Problem Score */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Score *</span>
          </label>
          <input
            {...register(`problem.${problemIndex}.score`, { 
              required: "Score is required",
              valueAsNumber: true,
              min: { value: 0, message: "Score must be non-negative" }
            })}
            type="number"
            min="0"
            placeholder="Enter problem score"
            className="input input-bordered w-full"
          />
          {problemErrors?.score && (
            <span className="text-error text-sm mt-1">{problemErrors.score.message}</span>
          )}
        </div>

        {/* Test Cases */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">Test Cases</h4>
            <button
              type="button"
              onClick={addNewTestCase}
              className="btn btn-success btn-xs"
            >
              <Plus size={14} />
              Add Test Case
            </button>
          </div>

          {testCaseFields.map((testCaseField, testCaseIndex) => (
            <div key={testCaseField.id} className="card bg-base-200 border border-base-300 p-3 mb-3 flex  gap-3">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-sm font-medium">Test Case {testCaseIndex + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeTestCase(testCaseIndex)}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex flex-col  gap-3">
                <div className="flex flex-col">
                  <label className="label">
                    <span className="label-text">Input *</span>
                  </label>
                  <textarea
                    {...register(`problem.${problemIndex}.testcases.${testCaseIndex}.input`, {
                      required: "Input is required"
                    })}
                    placeholder="Enter test input"
                    rows={2}
                    className="textarea textarea-bordered text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="label">
                    <span className="label-text">Expected Output *</span>
                  </label>
                  <textarea
                    {...register(`problem.${problemIndex}.testcases.${testCaseIndex}.expectedOutput`, {
                      required: "Expected output is required"
                    })}
                    placeholder="Enter expected output"
                    rows={2}
                    className="textarea textarea-bordered text-sm"
                  />
                </div>
              </div>

              <div className="form-control mt-3">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <input
                  {...register(`problem.${problemIndex}.testcases.${testCaseIndex}.description`)}
                  placeholder="Optional test case description"
                  className="input input-bordered text-sm"
                />
              </div>

              <div className="form-control mt-3">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`problem.${problemIndex}.testcases.${testCaseIndex}.hidden`)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="label-text ml-2">Hidden test case</span>
                </label>
              </div>
            </div>
          ))}

          {testCaseFields.length === 0 && (
            <p className="text-base-content/70 text-sm text-center py-2">No test cases added. Click "Add Test Case" to add one.</p>
          )}

          {problemErrors?.testcases && (
            <span className="text-error text-sm mt-1">At least one test case is required</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestCreationPage;
