"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function TestInfoFields({ control }: { control: any }) {
  return (
    <>
      <FormField
        control={control}
        name="testTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter test title" {...field} />
            </FormControl>
            <FormDescription>The name of your test</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="testDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test Description</FormLabel>
            <FormControl>
              <Input placeholder="Enter test description" {...field} />
            </FormControl>
            <FormDescription>Optional description</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="testDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test Duration (in minutes)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter Test Time"
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
    </>
  );
}
