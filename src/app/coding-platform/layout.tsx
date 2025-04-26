'use client';

import { AuthProvider, ProtectedRoute, UserRole } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import '@/app/globals.css';
import { Metadata } from 'next';


export default function CodingPlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthRoute = pathname.startsWith('/coding-platform/sign-in') || pathname.startsWith('/coding-platform/sign-up') || pathname.startsWith('/coding-platform/forgot-password') || pathname.startsWith('/coding-platform/reset-password');

  if (isAuthRoute) {
    return (
      <>
        <Toaster />
        {children}
      </>
    );
  }

  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={[UserRole.quiz_app_user]} redirectPath="/coding-platform/sign-in">
        <Toaster />
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
}
