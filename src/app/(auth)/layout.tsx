import type { Metadata } from "next";

import "../globals.css";


export const metadata: Metadata = {
  title: "Quiz App",
  description: "Landing Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <div>
    {children}
   </div>
  );
}
