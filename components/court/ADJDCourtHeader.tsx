import React from "react";
import Image from "next/image";

export function ADJDCourtHeader() {
  return (
    <header className="border-b-2 border-[#A37E44] pb-4 mb-5">
      <div className="w-full flex justify-center mb-2">
        <img
          src="/adjd-header.jpg"
          alt="Abu Dhabi Judicial Department - Civil Family Court"
          className="w-full max-h-24 sm:max-h-28 object-contain"
        />
      </div>

      {/* Center Title Banner */}
      <div className="pt-2 border-t border-[#E5E0D8] text-center">
        <h1 className="text-base sm:text-lg font-serif font-bold text-[#0B1528] tracking-wide uppercase">
          LAST WILL AND TESTAMENT
        </h1>
        <p className="text-sm sm:text-base font-arabic font-bold text-[#A37E44] mt-0.5" dir="rtl">
          نموذج وصيـة مدنيـة
        </p>
      </div>
    </header>
  );
}
