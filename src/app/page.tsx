"use server";
import { Header, Footer, Features, Hero } from "@/components";
import { createClient } from "@/lib/utils/supabase/server";
import "dotenv/config";
import { redirect } from "next/navigation";
export default async function Home() {
  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const res = await supabase.auth.getUser();
  if (!res.data.user?.is_anonymous) {
    redirect("/test-admin-dashboard");
  }
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Footer />
    </>
  );
}
