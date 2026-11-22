"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleStartWill = () => {
    if (pathname === "/start") {
      const el = document.getElementById("choose-package") || document.querySelector(".pre-step-1");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      router.push("/start");
    }
  };

  const handleBrandClick = () => {
    router.push("/start");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#160826] border-b border-white/10 text-white shadow-md">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        {/* Brand: owa | ONLINE WILLS ADVISOR */}
        <div 
          onClick={handleBrandClick} 
          className="flex items-center cursor-pointer select-none group"
        >
          <span className="font-serif text-[32px] sm:text-[36px] tracking-[-1.5px] leading-none text-white font-normal lowercase">
            owa
          </span>
          <span className="text-[9.5px] sm:text-[10px] leading-[1.3] tracking-[1.6px] border-l border-white/20 pl-3.5 ml-3.5 uppercase text-white/80 group-hover:text-white transition-colors font-sans font-medium">
            Online Wills
            <br />
            Advisor
          </span>
        </div>

        {/* Right CTA Button */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 pr-2 border-r border-white/20">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-7 h-7 rounded-full bg-court-bronze text-white text-[11px] flex items-center justify-center font-bold"
                title={`Dashboard (${user.name || user.email})`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartWill}
            className="bg-[#d83a3a] hover:bg-[#c22e2e] active:scale-[0.98] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm transition-all duration-150 cursor-pointer border-0"
          >
            <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
            </div>
            <span>Start My Will Now</span>
          </button>
        </div>
      </div>
    </header>
  );
}
