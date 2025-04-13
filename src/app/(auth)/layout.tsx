import type { Metadata } from "next";

import "../globals.css";
import { Geist } from 'next/font/google'


const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Add weights as needed
  display: 'swap',
})
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
    <html lang="en"  className={geist.className}>
      <body className="">
        {children}
      </body>
    </html>
  );
}
