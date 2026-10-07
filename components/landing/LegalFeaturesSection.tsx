import React from "react";
import { Scale, Users, Check, FileText, ShieldAlert } from "lucide-react";
import Link from "next/link";

export function LegalFeaturesSection() {
  return (
    <section id="legal-framework" className="py-20 sm:py-28 bg-white border-b border-court-border">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header: Direct & Authoritative */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-obsidian tracking-tight leading-[1.15]">
            Civil testamentary jurisdiction under Abu Dhabi Law No. 14 of 2021
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
            The Abu Dhabi Civil Family Court provides non-Muslim expatriates with full testamentary freedom to distribute UAE estates and appoint minor guardians according to secular civil law.
          </p>
        </div>

        {/* Editorial Two-Column Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Column A: Individual Will */}
          <div className="bg-alabaster rounded-lg p-7 sm:p-9 border border-court-border flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Option A · Single Testator
                </span>
                <Scale className="w-4 h-4 text-court-bronze" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-obsidian">
                  Individual Non-Muslim Will
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
                  Tailored for individual asset holders, investors, and working expatriates seeking to govern UAE real estate, local bank accounts, and gratuity distributions.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-obsidian">
                  Included Statutory Provisions
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Section One: Absolute revocation of prior testamentary instruments</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Section Two: Primary, substitute, and secondary executor appointments</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Section Four: Minor trust provisions for beneficiaries under 21 years</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Section Seven: Debts, funeral expenses, and administrative costs</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-court-border">
              <Link
                href="/wizard/1?type=individual"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-md bg-obsidian hover:bg-obsidian-light text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Draft Individual Will</span>
              </Link>
            </div>
          </div>

          {/* Column B: Mirror Wills */}
          <div className="bg-alabaster rounded-lg p-7 sm:p-9 border border-court-bronze/50 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-court-bronze-dark uppercase tracking-wider">
                  Option B · Married Partners
                </span>
                <Users className="w-4 h-4 text-court-bronze" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-2xl text-obsidian">
                  Reciprocal Mirror Wills
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
                  Interlocking reciprocal wills for married couples where each spouse leaves their estate to the survivor, paired with synchronized child guardianship.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-obsidian">
                  Included Statutory Provisions
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>100% reciprocal estate transfer upon the death of the first spouse</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Section Three: Permanent, temporary, and interim child guardianship</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Unified substitute beneficiaries in the event of simultaneous demise</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                    <span>Coordinated dual-file submission with ADJD Family Court Notary</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-court-border">
              <Link
                href="/wizard/1?type=mirror"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-md bg-court-bronze hover:bg-court-bronze-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Draft Mirror Wills</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Intestate Risk Alert Banner: Authoritative Legal Note */}
        <div className="mt-12 p-6 rounded-lg bg-obsidian text-white border border-court-tan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5 max-w-2xl">
            <ShieldAlert className="w-5 h-5 text-court-tan flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-serif font-bold text-sm text-white">
                Statutory Intestacy Protection
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                In the absence of a registered non-Muslim Will, UAE bank accounts (including joint accounts) are immediately frozen upon notification of death, and minor guardianship defaults to local statutory determination.
              </p>
            </div>
          </div>

          <Link
            href="/wizard/1"
            className="flex-shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-court-tan hover:text-white uppercase tracking-wider transition-colors"
          >
            <span>Review Statutory Rules</span>
            <FileText className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
