"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/utils/trpc";
import { CopyIcon, Loader, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function TestDisplay() {
  const utils = trpc.useContext();
  const { data, error, isError, isLoading, isSuccess } = trpc.getTestsCreatedByUser.useQuery();

  // Mutation for deleting test
  const deleteTestMutation = trpc.deleteCodeTest.useMutation({
    onSuccess: () => {
      utils.getTestsCreatedByUser.invalidate();
    },
  });

  // State to show copy success per item
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000); // Clear message after 2 seconds
  };

  if (isLoading) {
    return <Loader className="animate-spin m-auto" size={48} />;
  }

  if (isError) {
    return <span className="text-red-600">Error loading tests: {JSON.stringify(error)}</span>;
  }

  if (isSuccess && (!data || data.length === 0)) {
    return <span className="text-2xl m-auto">No Tests Created Yet</span>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      {data?.map((item, index) => (
        <Card key={item.testId ?? index} className="shadow-lg">
          <CardHeader className="flex justify-between items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">{item.testTitle}</CardTitle>
              <CardDescription className="text-gray-600">{item.testDescr}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => copyToClipboard(item.testId.toString())}
                aria-label="Copy Test ID"
                title={copiedId === item.testId.toString() ? "Copied!" : "Copy Test ID"}
                className={`p-2 rounded hover:bg-gray-200 transition ${
                  copiedId === item.testId.toString() ? "bg-green-200" : ""
                }`}
              >
                <CopyIcon size={20} />
              </button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTestMutation.mutate(item.testId)}
                disabled={isLoading}
                aria-label="Delete Test"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">Test ID: {item.testId}</p>
            <p className="mt-2">Duration: {item.testDuration} minutes</p>
          </CardContent>
          <CardFooter>
            <p className="text-gray-500 text-xs">Created at: {new Date(item.createdAt).toLocaleString()}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default TestDisplay;
