import React from "react";
import { ArrowRight, CheckCircle2, FileCheck2, Fingerprint, Languages, Scale } from "lucide-react";
import Link from "next/link";

const stages = [
  {
    numeral: "I",
    title: "Identity Verification & Optical Extraction",
    legalTag: "Steps 1–4 · Testator Particulars",
    description:
      "Upload your passport or Emirates ID. The system securely reads your document to populate legal names, date of birth, and nationality, presenting a side-by-side verification dialog before persisting records.",
    detail: "Zero manual data entry errors; strict passport match.",
    icon: Fingerprint,
  },
  {
    numeral: "II",
    title: "Fiduciary Appointments & Guardianship",
    legalTag: "Steps 5–12 · Statutory Parties",
    description:
      "Appoint primary and substitute executors, designate permanent and interim guardians for minor children, and allocate estate percentages with automated 100% total verification.",
    detail: "Prevents intestate estate freezes under UAE Civil Personal Status Law.",
    icon: Scale,
  },
  {
    numeral: "III",
    title: "Phonetic Arabic Transliteration",
    legalTag: "Step 15 · Court Requirement",
    description:
      "The Abu Dhabi Civil Family Court strictly requires foreign names to be phonetically transliterated into Arabic script rather than translated by meaning. Review and approve all Arabic names in an interactive audit matrix.",
    detail: "Ensures legal identity matches across dual-language court filings.",
    icon: Languages,
  },
  {
    numeral: "IV",
    title: "Court-Ready Bilingual Will Generation",
    legalTag: "Step 16 · Form ADJD-NM1221-06-01",
    description:
      "Instantly compile an official 8-page court document featuring synchronized side-by-side English (LTR) and Arabic (RTL) clauses, formatted for physical execution and remote notary video attestation.",
    detail: "Directly accepted by the Abu Dhabi Judicial Department.",
    icon: FileCheck2,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-alabaster border-b border-court-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Context & Editorial Statement */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-obsidian tracking-tight leading-[1.15]">
              From identity verification to court filing
            </h2>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Our 16-step guided wizard structures complex Abu Dhabi Civil Family Court procedures into four verifiable stages, ensuring every statutory clause complies with Abu Dhabi Law No. 14 of 2021.
            </p>

            {/* Statutory Guarantees Box */}
            <div className="p-5 rounded-lg bg-white border border-court-border space-y-3.5">
              <div className="font-serif font-bold text-sm text-obsidian">
                Statutory Guarantees
              </div>
              <ul className="space-y-2.5 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                  <span>Dual-column English (LTR) and Arabic (RTL) legal synchronization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                  <span>Mandatory phonetic transliteration audit prior to generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-court-bronze flex-shrink-0 mt-0.5" />
                  <span>Statutory revocation, executor powers, and minor trust clauses</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/wizard/1"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-obsidian hover:bg-obsidian-light text-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                <span>Begin Preparation</span>
                <ArrowRight className="w-4 h-4 text-court-tan" />
              </Link>
            </div>
          </div>

          {/* Right Column: Asymmetric Editorial Stage Progression */}
          <div className="lg:col-span-7 space-y-6">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-6 sm:p-7 border border-court-border transition-colors hover:border-court-bronze/60"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-xl sm:text-2xl font-bold text-court-bronze tracking-tight">
                        Stage {stage.numeral}
                      </span>
                      <span className="text-[11px] font-mono text-gray-700 bg-alabaster px-2.5 py-0.5 rounded border border-court-border">
                        {stage.legalTag}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded bg-alabaster border border-court-border flex items-center justify-center text-obsidian flex-shrink-0">
                      <Icon className="w-4 h-4 text-court-bronze" />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-obsidian mb-2">
                    {stage.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
                    {stage.description}
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center text-xs text-court-bronze-dark font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-court-bronze mr-2" />
                    <span>{stage.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
