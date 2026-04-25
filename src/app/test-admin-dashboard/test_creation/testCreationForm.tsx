"use client";
import React from "react";
import {
  useForm,
  useFieldArray,
  Control,
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  FileCode2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { CodeTestInput } from "@/lib/schemas/data_schemas";
import { trpc } from "@/lib/utils/trpc";
function TestCreationPage() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CodeTestInput>({
    defaultValues: {
      testTitle: "",
      testDescription: "",
      testDuration: 10,
      problem: [],
    },
  });

  const {
    fields: problemFields,
    append: addProblem,
    remove: removeProblem,
  } = useFieldArray({
    control,
    name: "problem",
  });
  const { error, mutate, isSuccess, isError, isPending } =
    trpc.createCodeTest.useMutation();
  const onSubmit = (data: CodeTestInput) => {
    mutate(data);
    reset();
  };

  const addNewProblem = () => {
    addProblem({
      title: "",
      description: "",
      score: 10,
      testcases: [
        {
          input: "",
          expectedOutput: "",
          hidden: false,
        },
      ],
    });
  };

  return (
    <main className="min-h-screen w-full overflow-auto bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <FileCode2 className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase">Test Builder</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-950">Create New Coding Test</h1>
          <p className="mt-2 text-slate-600">
            Add the test details, create at least one problem, then add visible
            or hidden test cases.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Success/Error Messages --- */}
          {isSuccess && (
            <div className="alert alert-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Test created successfully.
            </div>
          )}
          {isError && (
            <div className="alert alert-error text-sm">
              <AlertCircle className="h-4 w-4" />
              {error?.message || "Something went wrong"}
            </div>
          )}

          {/* --- Test Information --- */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Test Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Test Title *</span>
                </label>
                <input
                  {...register("testTitle", {
                    required: "Test title is required",
                  })}
                  placeholder="Enter title of the test"
                  className="input input-bordered w-full"
                />
                {errors.testTitle && (
                  <span className="text-error text-sm mt-1">
                    {errors.testTitle.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="form-control md:col-span-2">
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
                    min: {
                      value: 1,
                      message: "Duration must be at least 1 minute",
                    },
                  })}
                  type="number"
                  min="1"
                  placeholder="Enter duration of test"
                  className="input input-bordered w-full"
                />
                {errors.testDuration && (
                  <span className="text-error text-sm mt-1">
                    {errors.testDuration.message}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* --- Problems Section --- */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Problems</h2>
                <p className="text-sm text-base-content/60">
                  {problemFields.length} added
                </p>
              </div>
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
              <p className="text-base-content/70 text-center py-4">
                No problems added yet. Click &quot;Add Problem&quot; to get
                started.
              </p>
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
              <p className="text-error text-sm mt-2">
                At least one problem is required
              </p>
            )}
          </section>

          {/* --- Submit Button --- */}
          <div className="sticky bottom-0 flex justify-end gap-4 border-t border-slate-200 bg-slate-100/95 py-4 backdrop-blur">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => reset()}
            >
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
    </main>
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
function ProblemForm({
  problemIndex,
  register,
  control,
  errors,
  onRemove,
}: ProblemFormProps) {
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
      input: "",
      expectedOutput: "",
      hidden: false,
    });
  };

  const problemErrors = errors.problem?.[problemIndex];

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-md font-semibold">Problem {problemIndex + 1}</h3>
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
              required: "Problem title is required",
            })}
            placeholder="Enter problem title"
            className="input input-bordered w-full"
          />
          {problemErrors?.title && (
            <span className="text-error text-sm mt-1">
              {problemErrors.title.message}
            </span>
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
              min: { value: 0, message: "Score must be non-negative" },
            })}
            type="number"
            min="0"
            placeholder="Enter problem score"
            className="input input-bordered w-full"
          />
          {problemErrors?.score && (
            <span className="text-error text-sm mt-1">
              {problemErrors.score.message}
            </span>
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
            <div
              key={testCaseField.id}
              className="mb-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="mb-3 flex items-start justify-between">
                <h5 className="text-sm font-medium">
                  Test Case {testCaseIndex + 1}
                </h5>
                <button
                  type="button"
                  onClick={() => removeTestCase(testCaseIndex)}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="label">
                    <span className="label-text">Input *</span>
                  </label>
                  <textarea
                    {...register(
                      `problem.${problemIndex}.testcases.${testCaseIndex}.input`,
                      {
                        required: "Input is required",
                      }
                    )}
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
                    {...register(
                      `problem.${problemIndex}.testcases.${testCaseIndex}.expectedOutput`,
                      {
                        required: "Expected output is required",
                      }
                    )}
                    placeholder="Enter expected output"
                    rows={2}
                    className="textarea textarea-bordered text-sm"
                  />
                </div>
              </div>

              <div className="form-control mt-3">
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    {...register(
                      `problem.${problemIndex}.testcases.${testCaseIndex}.hidden`
                    )}
                    className="checkbox checkbox-sm"
                  />
                  <span className="label-text ml-2">Hidden test case</span>
                </label>
              </div>
            </div>
          ))}

          {testCaseFields.length === 0 && (
            <p className="text-base-content/70 text-sm text-center py-2">
              No test cases added. Click &quot;Add Test Case&quot; to add one.
            </p>
          )}

          {problemErrors?.testcases && (
            <span className="text-error text-sm mt-1">
              At least one test case is required
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestCreationPage;
