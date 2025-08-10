"use client";

import React  from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { codeTestSchema, CodeTestInput } from "@/lib/schemas/data_schemas";

import TestInfoFields from "./TestInfoFields";
import ProblemList from "./ProblemList";
import { trpc } from "@/lib/utils/trpc";
export default function CodeTestCreationPage() {
  const form = useForm<CodeTestInput>({
    resolver: zodResolver(codeTestSchema),
    defaultValues: {
      testTitle: "",
      testDescription: "",
      problem: [],
       testDuration: 0,
    },
  });

  const {
    control,
    handleSubmit,
    reset  } = form;
  const createTest = trpc.createCodeTest.useMutation()
  const {isError,isSuccess ,error} = createTest
  const onSubmit = (data: CodeTestInput) => {
    createTest.mutate(data)
    if(isSuccess){
      alert('Test was created successfully')
      reset()
    }
    if(isError){
      alert(`Error occured : ${error}`)
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto p-4 space-y-6"
      >
        <span className="text-4xl my-10">Create Test</span>

        <TestInfoFields control={control} />

        <ProblemList control={control} />

        <div className="flex justify-end mt-6">
          <Button type="submit" className="btn-primary">
            Submit Code Test
          </Button>
        </div>
      </form>
    </Form>
  );
}
