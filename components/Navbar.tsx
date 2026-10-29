"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, FileText, User, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isStartPage = pathname === "/start";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const triggerModal = (modalType: "help" | "resume") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("owa-open-prepayment-modal", { detail: modalType })
      );
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        isStartPage
          ? "bg-[#21152F] border-b border-[#443158]"
          : "bg-obsidian border-b border-obsidian-light/60"
      } text-white shadow-md`}
    >
      {/* Main navigation bar */}
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand: owa · Online Wills Advisor */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="flex items-center gap-3">
            <span className="font-serif text-[30px] sm:text-[33px] tracking-[-1.8px] leading-none text-white group-hover:text-court-tan transition-colors lowercase font-normal">
              owa
            </span>
            <span className="text-[9px] sm:text-[9.5px] leading-[1.35] tracking-[1.4px] border-l border-white/20 pl-3 uppercase text-white/75 group-hover:text-white transition-colors font-sans font-medium">
              Online Wills
              <br />
              Advisor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
          <Link href="/dashboard" className="hover:text-court-tan transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-court-bronze" />
            <span>Overview</span>
          </Link>
          <Link href="/wizard/details" className="hover:text-court-tan transition-colors">
            My questionnaire
          </Link>
          <Link href="/dashboard/people" className="hover:text-court-tan transition-colors">
            My people
          </Link>
          <Link href="/dashboard/support" className="hover:text-court-tan transition-colors">
            Support
          </Link>
          <Link href="/admin" className="hover:text-court-tan transition-colors text-[#A37E44] font-semibold">
            Admin Portal
          </Link>
        </nav>

        {/* Right CTA / Auth state */}
        <div className="hidden sm:flex items-center gap-3">
          {isStartPage ? (
            /* Blended Start Page Header Actions */
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#A599B5]">
                <span>A question before you continue?</span>
                <button
                  type="button"
                  onClick={() => triggerModal("help")}
                  className="text-[#e0d1ee] hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0"
                >
                  <span>Get help</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => triggerModal("resume")}
                className="bg-white hover:bg-[#F3EEFA] text-[#21152F] text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200 cursor-pointer border-0"
              >
                Resume application
              </button>
              {user && (
                <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                  <Link
                    href="/dashboard"
                    className="w-7 h-7 rounded-full bg-court-bronze text-white text-[11px] flex items-center justify-center font-bold"
                    title={`Dashboard (${user.name || user.email})`}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : user ? (
            /* Standard logged-in state on other pages */
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors border border-white/15"
                title="Go to Dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-court-bronze text-white text-[11px] flex items-center justify-center font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[130px] truncate">{user.name || user.email}</span>
              </Link>
              <Link
                href="/dashboard"
                className="text-xs uppercase tracking-wider font-semibold bg-court-bronze hover:bg-court-bronze-dark text-white px-3.5 py-2 rounded-md shadow-sm transition-all duration-200 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Standard logged-out state on other pages */
            <>
              <Link
                href="/auth/signin"
                className="text-xs uppercase tracking-wider font-medium text-white/80 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/start"
                className="text-xs uppercase tracking-wider font-semibold bg-court-bronze hover:bg-court-bronze-dark text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Start Will</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden ${
            isStartPage ? "bg-[#21152F] border-t border-[#443158]" : "bg-obsidian-dark border-t border-white/10"
          } px-4 py-5 space-y-4`}
        >
          {isStartPage && (
            <div className="p-3 mb-2 rounded-lg bg-[#2E1D42] border border-[#523B69] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#BCAECB]">Need assistance?</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerModal("help");
                    setMobileMenuOpen(false);
                  }}
                  className="text-[#e0d1ee] hover:text-white font-semibold flex items-center gap-1 bg-transparent border-0"
                >
                  <span>Get help</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerModal("resume");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-white text-[#21152F] rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors border-0"
              >
                Resume application
              </button>
            </div>
          )}

          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            Overview
          </Link>
          <Link
            href="/wizard/details"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            My questionnaire
          </Link>
          <Link
            href="/dashboard/people"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            My people
          </Link>
          <Link
            href="/dashboard/support"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            Support
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#A37E44] hover:text-court-tan py-1"
          >
            Admin Portal
          </Link>

          {!isStartPage && (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-court-tan font-medium">
                    Signed in as: {user.name || user.email}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-sm text-red-300 hover:text-red-200 py-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-court-bronze text-white text-xs uppercase font-semibold tracking-wider"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
