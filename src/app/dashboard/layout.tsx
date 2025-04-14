'use client';

import DashboardSidebar from '@/components/dashboard-sidebar';
import '@/app/globals.css'; // make sure Tailwind styles load here
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if the user is not authenticated
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // You can show a loading spinner or skeleton UI here
  }

  if (!user) {
    return null; // Optionally render nothing or a placeholder while the redirect happens
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
