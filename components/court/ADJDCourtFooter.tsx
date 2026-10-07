import React from "react";

interface ADJDCourtFooterProps {
  pageNumber?: number;
}

export function ADJDCourtFooter({ pageNumber = 1 }: ADJDCourtFooterProps) {
  return (
    <footer className="mt-8 pt-4 border-t border-[#E5E0D8] text-[10px] text-gray-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Contact info */}
        <div className="flex flex-wrap items-center gap-3">
          <span>📞 600 599 799</span>
          <span>☎ 02 651 3262</span>
          <span>✉ CivilFamilyCourt@adjd.gov.ae</span>
          <span>🌐 www.adjd.gov.ae</span>
        </div>

        {/* Page and Ref Code */}
        <div className="flex items-center gap-2 font-mono font-bold text-gray-700">
          <span>PAGE {pageNumber} of 8</span>
          <span>·</span>
          <span dir="rtl">صفحة {pageNumber} من 8</span>
          <span>·</span>
          <span className="text-[#A37E44]">ADJD-NM0723-07-03</span>
        </div>
      </div>

      <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] text-gray-400">
        <div>All rights reserved to Abu Dhabi Judicial Department, © 2023</div>
        <div dir="rtl">جميع الحقوق محفوظة لدائرة القضاء في أبوظبي، 2023©</div>
      </div>
    </footer>
  );
}
