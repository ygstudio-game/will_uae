import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck, Clock, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="no-print bg-obsidian text-white border-t border-obsidian-light/60 mt-auto">
      {/* Upper legal trust pillars */}
      <div className="border-b border-white/10 bg-obsidian-dark/50 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-court-bronze/15 border border-court-bronze/30 flex items-center justify-center flex-shrink-0 text-court-bronze">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-white">Abu Dhabi Civil Family Court</h4>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">
                  Drafted strictly against official court template form <strong>ADJD-NM1221-06-01</strong> for Non-Muslim UAE expatriates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-court-bronze/15 border border-court-bronze/30 flex items-center justify-center flex-shrink-0 text-court-bronze">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-white">1-Year Document Privacy</h4>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">
                  Uploaded passports and IDs are retained securely for exactly 1 year, and then automatically purged from storage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-court-bronze/15 border border-court-bronze/30 flex items-center justify-center flex-shrink-0 text-court-bronze">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-semibold text-white">Bilingual Court Ready</h4>
                <p className="text-white/60 text-xs mt-1 leading-relaxed">
                  Dual-column English and Arabic layout ready for download, print, and personal submission to the ADJD registration portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-court-bronze" />
              <span className="font-serif font-bold text-lg text-white">UAE Will Preparation Platform</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-md">
              A private online preparation engine enabling non-Muslim residents in the UAE to prepare, verify, and export official ADJD Civil Family Court Last Will and Testament documents in bilingual English and Arabic.
            </p>
            <div className="text-[11px] text-court-tan/80 pt-1">
              Court Form Code: ADJD-NM1221-06-01 · Civil Family Court of Abu Dhabi
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-court-tan mb-3">Quick Navigation</h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/wizard/1" className="hover:text-white transition-colors">
                  Prepare a Single Will
                </Link>
              </li>
              <li>
                <Link href="/wizard/1?type=mirror" className="hover:text-white transition-colors">
                  Prepare Mirror Wills (Couples)
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="hover:text-white transition-colors">
                  Sign In to Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-court-tan mb-3">Legal & Compliance</h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  ADJD Court Regulations
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Non-Muslim Personal Status Law
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Data Retention Policy (1 Year)
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service & Disclaimer
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & court disclaimer */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/50 gap-4">
          <div>
            © {new Date().getFullYear()} UAE Will Preparation Platform. Designed strictly for ADJD Civil Family Court filing.
          </div>
          <div className="text-center sm:text-right max-w-xl text-[10px] text-white/40 leading-normal">
            Disclaimer: This platform provides document preparation and bilingual formatting for the official Abu Dhabi Judicial Department Non-Muslim Will. Submission, court fee payment, and final attestation are conducted directly through the ADJD civil portal.
          </div>
        </div>
      </div>
    </footer>
  );
}
