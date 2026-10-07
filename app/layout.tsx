import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "UAE Non-Muslim Will Preparation | ADJD Civil Family Court",
  description:
    "Prepare, verify, and generate court-ready Abu Dhabi Judicial Department (ADJD) Non-Muslim bilingual Last Will & Testament.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-alabaster">
      <body className="min-h-full flex flex-col font-sans antialiased text-gray-900 bg-alabaster">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

