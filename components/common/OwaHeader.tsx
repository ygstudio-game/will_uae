"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOwaStore } from "@/store/useOwaStore";
import { MessageSquare } from "lucide-react";

interface OwaHeaderProps {
  activeTab?: "dashboard" | "wizard" | "people" | "support";
}

export function OwaHeader({ activeTab }: OwaHeaderProps) {
  const pathname = usePathname();
  const { application, activeWillIndex } = useOwaStore();

  const currentWill = application?.wills?.[activeWillIndex];
  const testator = currentWill?.testatorPerson;
  const firstName = testator?.fullName?.split(" ")?.[0] || "Daniel";
  const initials = testator?.fullName
    ? testator.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "DR";

  const isLanding = pathname === "/";
  const isDashboard = pathname === "/dashboard" || activeTab === "dashboard";
  const isWizard = pathname?.startsWith("/wizard") || activeTab === "wizard";
  const isCourtFee = pathname?.startsWith("/checkout/court-fee");
  const isSupport = pathname?.startsWith("/dashboard/support") || activeTab === "support";
  const appRef = application?.id
    ? application.id.startsWith("draft-")
      ? "OWA-DEMO-001"
      : `OWA-${application.id.slice(-6).toUpperCase()}`
    : "OWA-DEMO-001";

  return (
    <>
      {/* Test / Dev Status Bar matching screenshot */}
      <div className="bg-[#29213F] text-[#F0EAF9] py-1.5 px-4 sm:px-8 text-[11px] flex items-center justify-between border-b border-white/5 select-none z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span className="font-medium tracking-wide">
            ONLINE WILLS ADVISOR · Abu Dhabi Civil Family Court Registration Portal
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#D9D0E6]">
          <span className="hidden sm:inline">Ref: {appRef}</span>
          <Link href="/admin" className="hover:text-white underline text-xs transition-colors">
            Admin desk ↗
          </Link>
        </div>
      </div>

      {/* Main Top Application Header */}
      <header className="bg-[#FFFEFA] border-b border-[#E4DFEE] px-4 sm:px-8 py-3 select-none sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link href={isLanding ? "/" : "/dashboard"} className="flex items-baseline gap-2 text-inherit no-underline group">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#29213F] group-hover:text-[#6243AD] transition-colors">
                owa
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 border-l border-[#E4DFEE] pl-2.5">
                Online Wills Advisor
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {isLanding ? (
            <nav className="hidden sm:flex items-center gap-4 sm:gap-6 text-xs font-semibold" aria-label="Landing Navigation">
              <Link href="/#how-it-works" className="text-gray-600 hover:text-[#6243AD] transition-colors">
                How it works
              </Link>
              <Link href="/#features" className="text-gray-600 hover:text-[#6243AD] transition-colors">
                Legal features
              </Link>
              <Link href="/checkout/court-fee" className="text-gray-600 hover:text-[#6243AD] transition-colors">
                Court fee
              </Link>
              <Link href="/dashboard/support" className="text-gray-600 hover:text-[#6243AD] transition-colors">
                Support
              </Link>
            </nav>
          ) : (
            <nav className="flex items-center gap-1 sm:gap-4 text-xs font-semibold overflow-x-auto scrollbar-none" aria-label="Customer Navigation">
              <Link
                href="/dashboard"
                className={`py-1.5 px-3 rounded-lg transition-colors ${
                  isDashboard && !isWizard && !isSupport && !isCourtFee
                    ? "text-[#6243AD] bg-[#F0EBF9] font-bold"
                    : "text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC]"
                }`}
              >
                Overview
              </Link>
              <Link
                href="/wizard/details"
                className={`py-1.5 px-3 rounded-lg transition-colors ${
                  isWizard
                    ? "text-[#6243AD] bg-[#F0EBF9] font-bold"
                    : "text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC]"
                }`}
              >
                My questionnaire
              </Link>
              <Link
                href="/checkout/court-fee"
                className={`py-1.5 px-3 rounded-lg transition-colors ${
                  isCourtFee
                    ? "text-[#6243AD] bg-[#F0EBF9] font-bold"
                    : "text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC]"
                }`}
              >
                Court fee
              </Link>
              <Link
                href="/dashboard/support"
                className={`py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isSupport
                    ? "text-[#6243AD] bg-[#F0EBF9] font-bold"
                    : "text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Support</span>
              </Link>
            </nav>
          )}

          {/* Right Action / Profile */}
          {isLanding ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="bg-[#6243AD] hover:bg-[#523594] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-2xs"
              >
                Client Workspace ↗
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-[#E4DFEE]">
              <div className="w-8 h-8 rounded-full bg-[#F0EBF9] text-[#6243AD] font-bold text-xs flex items-center justify-center border border-[#DFD2EF]">
                {initials}
              </div>
              <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
                {firstName}
              </span>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
