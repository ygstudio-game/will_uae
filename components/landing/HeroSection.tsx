import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, Check, ShieldCheck, Scale } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-obsidian text-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-court-tan/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-14 items-center">
          {/* Left Column: Authoritative Editorial Statement */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
              Official Non-Muslim Will for Abu Dhabi Civil Family Court
            </h1>

            <p className="text-base sm:text-lg text-white/80 font-sans leading-relaxed max-w-xl">
              Prepare, review, and print a legally binding bilingual Will governed by Abu Dhabi Law No. 14 of 2021. Secure your UAE real estate, bank accounts, and designate minor guardians under secular civil jurisdiction.
            </p>

            {/* Direct Action Group */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                href="/wizard/1"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-md bg-court-bronze hover:bg-court-bronze-dark text-white font-semibold text-sm tracking-wide transition-colors"
              >
                <span>Prepare Your Will</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/20 font-medium text-sm transition-colors"
              >
                <FileText className="w-4 h-4 text-court-tan" />
                <span>Resume Saved Draft</span>
              </Link>
            </div>

            {/* Plain-Spoken Legal Ground Truth Metrics */}
            <div className="pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-court-tan uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-court-bronze" />
                  <span>Law No. 14 of 2021</span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  Civil family court secular inheritance and estate laws.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-court-tan uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-court-bronze" />
                  <span>ADJD-NM1221-06-01</span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  Official statutory bilingual 8-page court form template.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-court-tan uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-court-bronze" />
                  <span>100% Online Filing</span>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  Remote video attestation with Abu Dhabi Judicial notary.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Court Document Artifact */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg border border-court-tan/40 text-obsidian p-6 sm:p-7 shadow-2xl relative">
              {/* Official Court Document Header */}
              <div className="border-b-2 border-court-bronze/30 pb-4 mb-5 flex items-start justify-between">
                <div>
                  <div className="font-serif text-sm font-bold text-obsidian tracking-wide">
                    دائرة القضاء - أبوظبي
                  </div>
                  <div className="text-[11px] font-sans font-semibold text-gray-700 tracking-wider uppercase">
                    Abu Dhabi Judicial Department
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-mono bg-court-tan/20 text-court-bronze-dark px-2 py-0.5 rounded border border-court-bronze/30 font-semibold">
                    FORM ADJD-NM1221-06-01
                  </span>
                  <div className="text-[10px] text-gray-600 mt-1">
                    Civil Family Court
                  </div>
                </div>
              </div>

              {/* Title Preamble */}
              <div className="text-center py-2 mb-4 bg-alabaster border border-court-border rounded">
                <div className="font-serif font-bold text-xs text-obsidian tracking-wide">
                  LAST WILL AND TESTAMENT
                </div>
                <div className="font-serif text-xs text-gray-800" dir="rtl">
                  الوصية الأخيرة والإرادة
                </div>
              </div>

              {/* Dual-Column Preview Snippet */}
              <div className="space-y-3.5 text-[11px] leading-relaxed">
                {/* Section One */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                  <div className="text-gray-700">
                    <span className="font-bold text-obsidian block mb-0.5">Section One: Revocation</span>
                    I hereby revoke all previous testamentary dispositions and wills made by me...
                  </div>
                  <div className="text-gray-700 font-serif" dir="rtl">
                    <span className="font-bold text-obsidian block mb-0.5">البند الأول: الإلغاء</span>
                    أنا الموقع أدناه بموجب هذه الوثيقة ألغي جميع التصرفات والوصايا السابقة...
                  </div>
                </div>

                {/* Section Two */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                  <div className="text-gray-700">
                    <span className="font-bold text-obsidian block mb-0.5">Section Two: Executors</span>
                    I appoint my spouse as Primary Executor and Trustee of this my Will...
                  </div>
                  <div className="text-gray-700 font-serif" dir="rtl">
                    <span className="font-bold text-obsidian block mb-0.5">البند الثاني: الوصي المنفذ</span>
                    أعين زوجي/زوجتي منفذاً رئيسياً ووصياً على هذه الوصية...
                  </div>
                </div>

                {/* Section Three */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-gray-700">
                    <span className="font-bold text-obsidian block mb-0.5">Section Three: Guardianship</span>
                    I appoint permanent guardians for my minor children residing in the UAE...
                  </div>
                  <div className="text-gray-700 font-serif" dir="rtl">
                    <span className="font-bold text-obsidian block mb-0.5">البند الثالث: الوصاية على القصر</span>
                    أعين أوصياء دائمين على أطفالي القصر المقيمين في دولة الإمارات...
                  </div>
                </div>
              </div>

              {/* Official Attestation Strip */}
              <div className="mt-5 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between text-[10px] text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-court-bronze inline-block" />
                  Bilingual English LTR & Arabic RTL
                </span>
                <span className="font-mono text-gray-600">Court Verified · 8 Pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
