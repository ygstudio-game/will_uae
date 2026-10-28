import React from "react";
import Link from "next/link";

export function OwaFooter() {
  return (
    <footer className="bg-[#281b40] text-[#d9d0e6] text-[14px] border-t border-[#382852] no-print">
      <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12">
          {/* Brand & Legal Consultancy Disclosure */}
          <div className="max-w-[440px] flex flex-col gap-2">
            <b className="font-serif text-[18px] text-white tracking-tight">Online Wills Advisor</b>
            <span className="text-[13.5px] leading-relaxed text-[#c9bfd8]">
              Operated by SP LEGAL FZ LLE, a legal consultancy licensed in Fujairah. A legal expert reviews every Will before we file it.
            </span>
            <span className="text-[13px] text-[#c9bfd8]">
              Email: <a href="mailto:info@onlinewillsadvisor.com" className="text-white hover:underline">info@onlinewillsadvisor.com</a>
            </span>
          </div>

          {/* 2-Column Navigation Grid */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13.5px]" aria-label="Footer Navigation">
            <Link href="/dashboard" className="text-white hover:underline transition-colors">
              How it works
            </Link>
            <Link href="/wizard/review" className="text-white hover:underline transition-colors">
              Sample Will
            </Link>
            <Link href="/dashboard" className="text-white hover:underline transition-colors">
              UAE Wills guide
            </Link>
            <Link href="/dashboard" className="text-white hover:underline transition-colors">
              About us
            </Link>
            <Link href="/dashboard" className="text-white hover:underline transition-colors">
              Privacy policy
            </Link>
            <Link href="/dashboard/support" className="text-white hover:underline transition-colors">
              Contact support
            </Link>
            <Link href="/handbook" className="text-white hover:underline transition-colors">
              Developer Handbook
            </Link>
          </nav>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <small className="block pt-4 border-t border-[#45375c] text-[13px] text-[#c9bfd8] leading-relaxed">
          You complete ADJD&apos;s civil Will template on this platform. ADJD reviews, notarises and registers your Will. This is general information, not legal advice about your estate. © 2026 Online Wills Advisor.
        </small>
      </div>
    </footer>
  );
}
