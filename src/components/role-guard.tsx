"use client";

import { clearAuthSession, getAuthToken } from "@/lib/auth/session";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type Role = "admin" | "test_admin" | "test_user";

type RoleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

function getRoleFromToken(token: string | null): Role | null {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(
      window.atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { role?: string; exp?: number };

    if (
      decodedPayload.exp &&
      decodedPayload.exp * 1000 < Date.now()
    ) {
      return null;
    }

    if (
      decodedPayload.role === "admin" ||
      decodedPayload.role === "test_admin" ||
      decodedPayload.role === "test_user"
    ) {
      return decodedPayload.role;
    }

    return null;
  } catch {
    return null;
  }
}

function getHomeForRole(role: Role | null) {
  if (role === "admin" || role === "test_admin") {
    return "/test-admin-dashboard";
  }

  if (role === "test_user") {
    return "/test-user-dashboard";
  }

  return "/";
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const enforceRole = () => {
      const role = getRoleFromToken(getAuthToken());

      if (!role) {
        clearAuthSession();
        if (pathname !== "/") {
          router.replace("/");
        }
        return;
      }

      if (!allowedRoles.includes(role)) {
        const redirectPath = getHomeForRole(role);

        if (pathname !== redirectPath) {
          router.replace(redirectPath);
        }
      }
    };

    enforceRole();

    window.addEventListener("pageshow", enforceRole);
    window.addEventListener("focus", enforceRole);
    document.addEventListener("visibilitychange", enforceRole);

    return () => {
      window.removeEventListener("pageshow", enforceRole);
      window.removeEventListener("focus", enforceRole);
      document.removeEventListener("visibilitychange", enforceRole);
    };
  }, [allowedRoles, pathname, router]);

  return children;
}
