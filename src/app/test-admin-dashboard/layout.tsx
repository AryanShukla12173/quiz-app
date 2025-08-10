import type { Metadata } from "next";
import "@/app/globals.css";
import { TRPCProvider } from "@/components/trpcProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
export const metadata: Metadata = {
  title: "Quiz App",
  description: "Website for creating tests and administering them to users",
};
import "dotenv/config";
import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await supabase.auth.getUser();
  if (error) {
    console.log(error);
    redirect("/sign-in");
  }
  return (
    <TRPCProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        {children}
      </SidebarProvider>
    </TRPCProvider>
  );
}
