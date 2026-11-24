"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Play,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AccountSettingsModal } from "@/components/account/AccountSettingsModal";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"profile" | "email">("profile");

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

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

  const openSettings = (tab: "profile" | "email" = "profile") => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
    setIsUserMenuOpen(false);
  };

  const handleSignOutClick = async () => {
    setIsUserMenuOpen(false);
    await signOut();
  };

  return (
    <>
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

          {/* Right CTA Button & Authenticated Controls */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="relative" ref={menuRef}>
                {/* User Avatar & Menu Button */}
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-left"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-[#A37E44] text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-[12px] font-semibold text-white leading-tight max-w-[130px] truncate">
                      {user.name || "Client Account"}
                    </span>
                    <span className="text-[10px] text-white/60 leading-tight max-w-[130px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E5E0D8] text-[#0B1528] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header info */}
                    <div className="px-4 py-2.5 border-b border-[#E5E0D8] bg-[#FAF9F6]">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-gray-500 font-semibold">
                        Signed In As
                      </div>
                      <div className="font-semibold text-xs text-[#0B1528] truncate mt-0.5">
                        {user.name || "Client Account"}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/dashboard");
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-[#FAF9F6] hover:text-[#0B1528] flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#A37E44]" />
                        <span>My Will Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openSettings("profile")}
                        className="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-[#FAF9F6] hover:text-[#0B1528] flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#A37E44]" />
                        <span>Account & Profile Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openSettings("email")}
                        className="w-full px-4 py-2 text-xs text-left text-gray-700 hover:bg-[#FAF9F6] hover:text-[#0B1528] flex items-center gap-2.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#A37E44]" />
                        <span>Change Email (OTP)</span>
                      </button>
                    </div>

                    <div className="border-t border-[#E5E0D8] pt-1">
                      <button
                        type="button"
                        onClick={handleSignOutClick}
                        className="w-full px-4 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsInitialTab}
      />
    </>
  );
}
