import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "UAE Non-Muslim Will Preparation | ADJD Civil Family Court",
  description:
    "Prepare, verify, and generate court-ready Abu Dhabi Judicial Department (ADJD) Non-Muslim bilingual Last Will & Testament.",
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#faf9f6]">
      <body className="min-h-full flex flex-col font-sans antialiased text-[#29213f] bg-[#faf9f6]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

