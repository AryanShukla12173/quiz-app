import { Header, Footer, Features, Hero } from "@/components";
import { getCurrentUser } from "@/server/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (user?.role === "test_admin" || user?.role === "admin") {
    redirect("/test-admin-dashboard");
  }

  if (user?.role === "test_user") {
    redirect("/test-user-dashboard");
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
