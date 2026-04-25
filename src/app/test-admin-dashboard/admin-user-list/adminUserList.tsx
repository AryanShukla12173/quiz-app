"use client";

import { Loader, ShieldCheck } from "lucide-react";
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

  if (isError) return <span className="m-auto text-error">Error in fetching</span>;
  if (isLoading) return <Loader className="m-auto animate-spin" />;
  if (!data || data.userData.length === 0)
    return <span className="m-auto text-neutral">No data available</span>;
  return (
    <main className="min-h-screen w-full bg-slate-100 p-6">
      <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-slate-900" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Test Admin Users</h1>
            <p className="text-sm text-slate-500">
              {data.userCount} registered admin account
              {data.userCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                  {(item.fullName as string) ?? "-"}
                </TableCell>
                <TableCell>{(item.department as string) ?? "-"}</TableCell>
                <TableCell>{(item.designation as string) ?? "-"}</TableCell>
                <TableCell>
                  {item.createdAt
                    ? new Date(item.createdAt as string).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}

export default AdminUserList;
