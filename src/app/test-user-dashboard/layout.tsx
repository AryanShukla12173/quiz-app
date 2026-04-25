import { RoleGuard } from "@/components/role-guard";
import { getCurrentUser } from "@/server/auth/session";
import { redirect } from "next/navigation";

export default async function TestUserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user || user.role !== "test_user") {
    redirect("/");
  }

  return <RoleGuard allowedRoles={["test_user"]}>{children}</RoleGuard>;
}
