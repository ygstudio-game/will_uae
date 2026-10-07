import React from "react";
import Image from "next/image";

export function ADJDCourtHeader() {
  return (
    <header className="border-b-2 border-[#A37E44] pb-6 mb-6">
      <div className="flex items-center justify-between">
        {/* Left: Department Name */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full border border-[#A37E44]/40 flex items-center justify-center bg-[#FAF7F2] text-[#A37E44] font-serif font-bold text-lg">
            ADJD
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-[#0B1528]">
              Judicial Department
            </p>
            <p className="text-xs font-arabic text-gray-600" dir="rtl">
              دائرة القضاء
            </p>
          </div>
        </div>

        {/* Right: Court Name */}
        <div className="text-right">
          <p className="font-arabic font-bold text-sm text-[#0B1528]" dir="rtl">
            محكمة أبوظبي للأسرة المدنية
          </p>
          <p className="text-xs font-semibold text-gray-700 tracking-wider uppercase">
            Abu Dhabi Civil Family Court
          </p>
        </div>
      </div>

      {/* Center Title Banner */}
      <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-center">
        <h1 className="text-lg sm:text-xl font-serif font-bold text-[#0B1528] tracking-wide uppercase">
          LAST WILL AND TESTAMENT
        </h1>
        <p className="text-base sm:text-lg font-arabic font-bold text-[#A37E44] mt-0.5" dir="rtl">
          نموذج وصيـة مدنيـة
        </p>
      </div>
    </header>
  );
}
