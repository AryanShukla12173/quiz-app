"use server";
import { Header, Footer, Features, Hero } from "@/components";
import { roleEnum } from "@/lib/schemas/data_schemas";
import { createClient } from "@/lib/utils/supabase/server";
import "dotenv/config";
import { redirect } from "next/navigation";
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user?.id != null) {
    const { data: userProfileData, error } = await supabase
      .from("test_admin_profile")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if(userProfileData?.Role === roleEnum.enum.test_admin){
      redirect('/test-admin-dashboard')
    }
    if(userProfileData?.Role === roleEnum.enum.test_user){
      redirect('/test-user-dashboard')
    }
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
