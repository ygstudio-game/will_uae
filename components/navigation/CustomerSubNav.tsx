"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useOwaStore } from "@/store/useOwaStore";
import { Check, Shield } from "lucide-react";

interface CustomerSubNavProps {
  className?: string;
}

function CustomerSubNavInner({ className = "" }: CustomerSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { application, isSaving } = useOwaStore();

  const appId = searchParams.get("applicationId") || application?.id || "";
  const querySuffix = appId ? `?applicationId=${encodeURIComponent(appId)}` : "";

  // Determine current active section
  const isOverview = pathname === "/dashboard";
  const isQuestionnaire = pathname.startsWith("/wizard");
  const isPeople = pathname === "/dashboard/people";
  const isSupport = pathname === "/dashboard/support";

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      href: `/dashboard${querySuffix}`,
      active: isOverview,
    },
    {
      id: "questionnaire",
      label: "My questionnaire",
      href: `/wizard/details${querySuffix}`,
      active: isQuestionnaire,
    },
    {
      id: "people",
      label: "My people",
      href: `/dashboard/people${querySuffix}`,
      active: isPeople,
    },
    {
      id: "support",
      label: "Support",
      href: `/dashboard/support${querySuffix}`,
      active: isSupport,
    },
  ];

  return (
    <nav
      aria-label="Customer Workspace Navigation"
      className={`w-full bg-[#FAF9F6] border-b border-[#E4DFEE] transition-colors ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Main 4 Customer Tabs */}
          <div className="flex items-center gap-6 sm:gap-9 overflow-x-auto scrollbar-none py-0">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`relative py-3.5 sm:py-4 text-xs sm:text-[13.5px] whitespace-nowrap transition-colors duration-150 font-sans ${
                  item.active
                    ? "text-[#6243AD] font-semibold"
                    : "text-[#797287] hover:text-[#29213F] font-normal"
                }`}
              >
                <span>{item.label}</span>
                {item.active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6243AD] rounded-t-sm"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right subtle status indicator */}
          <div className="hidden md:flex items-center gap-3 text-xs text-[#797287]">
            <div className="flex items-center gap-1.5 font-sans text-[11px] text-[#797287]">
              {isSaving ? (
                <span className="flex items-center gap-1 text-[#6243AD]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6243AD] animate-ping" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#366D58]">
                  <Check className="w-3.5 h-3.5 text-[#366D58]" />
                  <span>Saved on this browser</span>
                </span>
              )}
            </div>
            {application?.packageType && (
              <>
                <span className="text-[#E4DFEE]">|</span>
                <span className="text-[11px] font-medium text-[#797287] bg-[#F7F4FC] border border-[#E4DFEE] px-2 py-0.5 rounded-md">
                  {application.packageType === "COUPLES" ? "Couples Will" : "Individual Will"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function CustomerSubNav(props: CustomerSubNavProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#FAF9F6] border-b border-[#E4DFEE] h-[48px]" />
      }
    >
      <CustomerSubNavInner {...props} />
    </Suspense>
  );
}

