"use client";

import { Loader } from "lucide-react";
import React from "react";
import { trpc } from "@/lib/utils/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function AdminUserList() {
  const { data, isError, isLoading } = trpc.getAdminTestUserData.useQuery();

  if (isError) return <span className="text-error">Error in fetching</span>;
  if (isLoading) return <Loader className="animate-spin m-auto" />;
  if (!data || data.userData.length === 0)
    return <span className="text-neutral">No data available</span>;
  return (
    <div className="flex py-8 w-screen flex-col min-h-screen">
      <div className="card bg-base-100 shadow-md rounded-xl mb-8 mx-20 max-w-xs transition hover:shadow-lg">
        <div className="card-body flex-row items-center justify-between">
          <div>
            <p className="text-sm text-base-content/70">Test Admin User </p>
            <h2 className="text-3xl font-bold text-base-content">
              {data.userCount}
            </h2>
          </div>
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-8 0 4 4 0 008 0zM17 11h.01M7 11h.01"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="  rounded-lg border border-base-content/10 bg-base-100 shadow-lg mx-20">
        <h2 className="text-lg font-bold mb-4 text-center text-base-content p-4 border-b border-base-content/10">
          Admin User List
        </h2>
        <Table className="table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.userData.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                  {item.fullName ?? "-"}
                </TableCell>
                <TableCell>{item.department ?? "-"}</TableCell>
                <TableCell>{item.designation ?? "-"}</TableCell>
                <TableCell>{item.createdAt ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminUserList;
