import type { Metadata } from "next";
import "@/app/globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RoleGuard } from "@/components/role-guard";
import { getCurrentUser } from "@/server/auth/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quiz App",
  description: "Website for creating tests and administering them to users",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "test_admin" && user.role !== "admin")) {
    redirect("/");
  }

  return (
    <RoleGuard allowedRoles={["admin", "test_admin"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        {children}
      </SidebarProvider>
    </RoleGuard>
  );
}
