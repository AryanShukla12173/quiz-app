'use client';
import DashboardSidebar from '@/components/dashboard-sidebar';
import '@/app/globals.css';
import { ProtectedRoute } from '@/context/AuthContext';
import { UserRole } from '@/form_schemas/registerFormSchema';
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute 
      allowedRoles={[UserRole.quiz_app_admin]} 
    >
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          {children}
          <Toaster />
        </div>
      </div>
    </ProtectedRoute>
  );
}