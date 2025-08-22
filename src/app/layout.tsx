import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/components/trpcProvider";
export const metadata: Metadata = {
  title: "Quiz App",
  description: "Website for creating tests and administering them to users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-hidden">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
} 
