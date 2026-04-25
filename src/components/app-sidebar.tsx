"use client";
import { ClipboardList, FileCode2, Home, LogOutIcon, ShieldCheck, Users } from "lucide-react";
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
    icon: Users,
  },
  {
    title: "Create Code Test",
    url: "/test-admin-dashboard/test_creation",
    icon: FileCode2,
  },
  {
    title: "Created Tests",
    url: "/test-admin-dashboard/test-display",
    icon: ClipboardList,
  },
];
import { clearAuthSession } from "@/lib/auth/session";
import { usePathname, useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar className="min-h-screen w-64 border-r border-slate-200 bg-white text-slate-900">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-6 px-2 text-2xl font-semibold text-slate-950">
            Quiz App
          </SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu className="menu rounded-box">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        pathname === item.url
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
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
                    clearAuthSession();
                    router.replace("/");
                  }}
                  className="btn mt-4 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
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
