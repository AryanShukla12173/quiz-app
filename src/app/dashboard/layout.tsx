'use client'

import '@/app/globals.css'
import { AdminRoute, useAuth } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import LoadingScreen from '@/components/LoadingScreen'
import DashboardSidebar from '@/components/dashboard-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Loading authentication..." />
  }

  return (
    <AdminRoute redirectPath="/sign-in">
      <DashboardSidebar>
        {children}
        <Toaster />
      </DashboardSidebar>
    </AdminRoute>
  )
}
