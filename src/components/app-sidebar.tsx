"use client";
import { Home, User, ShieldCheck, LogOutIcon } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Profile",
    url: "/test-admin-dashboard",
    icon: Home,
  },
  {
    title: "Test Admin User List",
    url: "/test-admin-dashboard/admin-user-list",
    icon: ShieldCheck,
  },
  {
    title: "Test User List",
    url: "/test-admin-dashboard/test-user-list",
    icon: User,
  },
  {
    title: "Create Code Test",
    url: "/test-admin-dashboard/test_creation",
    icon: User,
  },
  {
    title: "Created Tests",
    url: "/test-admin-dashboard/test-display",
    icon: User,
  },
];
import { createClient } from "@/lib/utils/supabase/client";
import { redirect } from "next/navigation";
export function AppSidebar() {
  const supabase = createClient();
  return (
    <Sidebar className="bg-base-200 min-h-screen w-64 text-base-content">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-bold mb-6 px-2">
            Quiz App
          </SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu className="menu rounded-box">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-4 text-lg font-medium hover:bg-base-300 rounded-lg py-3 px-3 transition-colors"
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="">
                <SidebarMenuButton
                  onClick={() => {
                    supabase.auth.signOut();
                    redirect("/");
                  }}
                  className="btn"
                >
                  <LogOutIcon />
                  Logout
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
