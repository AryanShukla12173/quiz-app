'use client';
import DashboardSidebar from '@/components/dashboard-sidebar';
import '@/app/globals.css';
import {AdminRoute, useAuth } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import LoadingScreen from '@/components/LoadingScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  
  // Add conditional loading check to prevent premature auth checks
  if (loading) {
    return <LoadingScreen message="Loading authentication..." />;
  }
  
  return (
    <AdminRoute redirectPath="/sign-in">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          {children}
          <Toaster />
        </div>
      </div>
    </AdminRoute>
  );
}