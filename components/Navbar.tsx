"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Menu, X, Shield, FileText, User, LogOut } from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setCurrentUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-obsidian text-white border-b border-obsidian-light/60 shadow-md">
      {/* Top micro-bar with court compliance indicator */}
      <div className="bg-obsidian-dark border-b border-white/5 py-1 px-4 text-xs text-court-tan/90 flex justify-between items-center font-sans tracking-wide">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Abu Dhabi Judicial Department (ADJD) Civil Family Court Compliant</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/70">
            <span className="hover:text-court-tan cursor-pointer transition-colors">ADJD Form ADJD-NM0723-07-03</span>
            <span className="text-white/20">|</span>
            <span className="font-arabic text-sm hover:text-court-tan cursor-pointer transition-colors" dir="rtl">
              العربية
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand & Crest */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-court-bronze/15 border border-court-bronze/30 flex items-center justify-center text-court-bronze group-hover:bg-court-bronze/25 transition-colors">
            <Scale className="w-5 h-5 text-court-bronze" />
          </div>
          <div>
            <div className="font-serif font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-court-tan transition-colors">
              UAE Non-Muslim Will
            </div>
            <div className="text-[11px] text-white/60 tracking-wider uppercase font-sans">
              Civil Family Court Preparation
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
          <Link href="/dashboard" className="hover:text-court-tan transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-court-bronze" />
            <span>Dashboard</span>
          </Link>
          <Link href="/start" className="hover:text-court-tan transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-court-bronze" />
            <span>Start Will</span>
          </Link>
          <Link href="/wizard/details" className="hover:text-court-tan transition-colors">
            Questionnaire
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
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors border border-white/15"
              >
                <div className="w-5 h-5 rounded-full bg-court-bronze text-white text-[10px] flex items-center justify-center font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="font-medium max-w-[120px] truncate">{currentUser.name || currentUser.email}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
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
        <div className="md:hidden bg-obsidian-dark border-t border-white/10 px-4 py-5 space-y-4">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            Dashboard
          </Link>
          <Link
            href="/wizard/1"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            Prepare Will (16 Steps)
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            How It Works
          </Link>
          <Link
            href="/#legal-framework"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/90 hover:text-court-tan py-1"
          >
            Court Framework
          </Link>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {currentUser ? (
              <div className="space-y-2">
                <div className="text-xs text-court-tan font-medium">
                  Signed in as: {currentUser.name}
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
        </div>
      )}
    </header>
  );
}
