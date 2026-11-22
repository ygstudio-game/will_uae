import React from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Scale, FileText } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-[#160826] text-white pt-16 pb-20 sm:pt-22 sm:pb-26 border-b border-white/10 overflow-hidden">
      {/* Subtle background ambient purple glow */}
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#66388f]/20 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Authoritative Editorial Statement */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#E8D8B0] font-medium tracking-wide">
              <span>Online UAE Will for Expats</span>
            </div>

            {/* Official Heading from Page 1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-serif font-bold text-white tracking-tight leading-[1.12]">
              Create Your Non-Sharia Will Online and Register It Remotely With ADJD or DIFC
            </h1>

            {/* Official Subheading from Page 1 */}
            <p className="text-base sm:text-lg text-white/80 font-sans leading-relaxed max-w-xl">
              Online Wills Advisor is a digital will-writing service that helps individuals and couples prepare Will drafts and submit them to the relevant UAE authorities for registration.
            </p>

            {/* Direct Action Group - ALL CTAs LINK TO THE START URL */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#d83a3a] hover:bg-[#c22e2e] text-white font-semibold text-sm shadow-md transition-all duration-150 active:scale-[0.98]"
              >
                <span>Start My Will Now (From AED 999)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/20 font-medium text-sm transition-colors"
              >
                <span>Choose Package</span>
                <ArrowRight className="w-4 h-4 text-[#E8D8B0]" />
              </Link>
            </div>

            {/* Key Trust Metrics */}
            <div className="pt-6 sm:pt-7 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#E8D8B0] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-court-bronze" />
                  <span>Abu Dhabi & DIFC</span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  Non-Muslim secular civil estate inheritance laws.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#E8D8B0] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-court-bronze" />
                  <span>Bilingual Court Ready</span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  English LTR & Arabic RTL synchronized court clauses.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#E8D8B0] uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-court-bronze" />
                  <span>100% Online Filing</span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  Remote notary video attestation from home.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Artifact with Document Preview & Family Portrait (Page 3 of PDF) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-[#231238] border border-white/15 p-6 shadow-2xl overflow-hidden">
              {/* Document Sample Preview Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium text-[#E8D8B0]">
                  BILINGUAL SAMPLE · English + Arabic
                </span>
                <span className="text-[10px] text-white/60 tracking-wider uppercase font-mono">
                  ADJD & DIFC Ready
                </span>
              </div>

              {/* Simulated Dual-Column Document Form */}
              <div className="bg-white/95 text-[#0B1528] rounded-lg p-5 shadow-inner space-y-3 font-serif text-[11px] leading-relaxed">
                <div className="text-center pb-2 border-b border-gray-200">
                  <strong className="block text-[12px] tracking-wide text-obsidian uppercase font-sans">
                    The Last Will and Testament
                  </strong>
                  <span className="text-[11px] text-gray-600 font-serif" dir="rtl">
                    الوصية الأخيرة والإرادة المدنية
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  <div>
                    <span className="font-bold text-[#0B1528] block mb-0.5 font-sans text-[10px] uppercase">
                      Declaration
                    </span>
                    I hereby revoke all previous testamentary dispositions and wills made by me...
                  </div>
                  <div dir="rtl" className="text-right">
                    <span className="font-bold text-[#0B1528] block mb-0.5 font-sans text-[10px] uppercase">
                      إقرار
                    </span>
                    أنا الموقع أدناه بموجب هذه الوثيقة ألغي جميع التصرفات والوصايا السابقة...
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-gray-700">
                  <div>
                    <span className="font-bold text-[#0B1528] block mb-0.5 font-sans text-[10px] uppercase">
                      Executors & Assets
                    </span>
                    I appoint my spouse and substitute executor to administer my UAE estate...
                  </div>
                  <div dir="rtl" className="text-right">
                    <span className="font-bold text-[#0B1528] block mb-0.5 font-sans text-[10px] uppercase">
                      المنفذ والأموال
                    </span>
                    أعين زوجي كمنفذ ووصي لإدارة كافة أصولي داخل دولة الإمارات...
                  </div>
                </div>
              </div>

              {/* Floating Pills and Family Photo matching Page 3 */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="flex flex-col gap-2">
                  <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs text-white">
                    <span className="text-[10px] text-[#E8D8B0] uppercase tracking-wider block font-semibold">
                      YOUR CHOICES
                    </span>
                    <span>Name beneficiaries and guardians</span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs text-white">
                    <span className="text-[10px] text-[#E8D8B0] uppercase tracking-wider block font-semibold">
                      REGISTRATION
                    </span>
                    <span>Remotely registered</span>
                  </div>
                </div>

                {/* Photo matching Page 3 */}
                <div className="rounded-xl overflow-hidden border border-white/20 h-28 shadow-lg">
                  <img
                    src="/assets/people/couples-pro.jpg"
                    alt="Expatriate family in the UAE"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
