import React from "react";
import { Scale } from "lucide-react";

export function CourtHeader() {
  return (
    <header className="border-b-2 border-court-tan pb-5 mb-6 text-center">
      {/* Court emblem */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-court-tan/15 border border-court-bronze/40 flex items-center justify-center text-court-bronze shadow-sm">
          <Scale className="w-6 h-6 text-court-bronze" />
        </div>
      </div>

      <div className="text-[11px] uppercase tracking-widest font-semibold text-gray-500 font-sans">
        United Arab Emirates · Emirate of Abu Dhabi · Abu Dhabi Judicial Department
      </div>
      <div className="text-xs uppercase tracking-wider font-bold text-obsidian font-sans mt-0.5">
        Civil Family Court · Non-Muslim Personal Status
      </div>

      {/* Bilingual Document Title */}
      <div className="mt-4 pt-3 border-t border-court-border/70 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          LAST WILL AND TESTAMENT
        </h1>
        <span className="hidden sm:inline text-court-tan font-bold">|</span>
        <h1 className="text-2xl sm:text-3xl font-arabic font-bold text-obsidian" dir="rtl">
          وصية وتصرف في التركة
        </h1>
      </div>

      <div className="text-[11px] font-mono text-gray-500 mt-2">
        Official Court Form Code: <strong>ADJD-NM1221-06-01</strong>
      </div>
    </header>
  );
}
