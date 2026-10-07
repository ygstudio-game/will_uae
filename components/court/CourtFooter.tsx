import React from "react";

interface CourtFooterProps {
  pageNumber?: number;
  totalPages?: number;
}

export function CourtFooter({ pageNumber = 1, totalPages = 8 }: CourtFooterProps) {
  return (
    <footer className="mt-8 pt-4 border-t border-court-border text-[11px] text-gray-500 font-sans flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-obsidian">ADJD-NM1221-06-01</span>
        <span>·</span>
        <span>Abu Dhabi Civil Family Court</span>
      </div>

      <div className="font-arabic text-xs text-gray-600" dir="rtl">
        دائرة القضاء في أبوظبي · محكمة الأسرة المدنية لغير المسلمين
      </div>

      <div className="font-mono text-gray-400">
        Page {pageNumber} of {totalPages}
      </div>
    </footer>
  );
}
