"use server";
import { Header, Footer, Features, Hero } from "@/components";
import { createClient } from "@/lib/utils/supabase/server";
import "dotenv/config";
import { redirect } from "next/navigation";
export default async function Home() {
  const supabase = await createClient();
  const {data} = await supabase.auth.getUser();
  if(data.user !== null){
    redirect('/test-admin-dashboard')
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
