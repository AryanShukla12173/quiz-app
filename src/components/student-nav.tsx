"use client";

import { clearAuthSession } from "@/lib/auth/session";
import { testUserDashboardNavItems } from "@/lib/constants";
import { BarChart3, ClipboardList, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";

type StudentNavProps = {
  name: string;
  initials: string;
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Dashboard: ClipboardList,
  Analytics: BarChart3,
};

export function StudentNav({ name, initials }: StudentNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="navbar min-h-16 border-b border-slate-200 bg-white/90 px-4 text-slate-900 backdrop-blur-xl lg:px-8">
      <div className="navbar-start">
        <Link href="/test-user-dashboard" className="text-2xl font-semibold text-slate-950">
          QuizApp
        </Link>
      </div>
      <div className="navbar-center hidden gap-2 md:flex">
        {testUserDashboardNavItems.map((item) => {
          const Icon = iconMap[item.name] ?? ClipboardList;
          const isActive = pathname === item.href;

          return (
            <Link
              href={item.href}
              className={`btn btn-sm ${
                isActive
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "btn-ghost text-slate-600"
              }`}
              key={item.id}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="navbar-end gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{name || "Student"}</p>
          <p className="text-xs text-slate-500">Test user</p>
        </div>
        <div className="avatar avatar-placeholder">
          <div className="w-10 rounded-full bg-slate-950 text-white">
            <span className="text-sm font-semibold">{initials || "TU"}</span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            clearAuthSession();
            router.replace("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
