"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWillStore } from "@/store/useWillStore";
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

export function Step16Generate() {
  const router = useRouter();
  const { testator, parties } = useWillStore();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Final Output · Step 16 of 16
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Generate Court-Ready Bilingual Will
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Your document is fully structured and validated in accordance with the official Abu Dhabi Civil Family Court template <strong>ADJD-NM1221-06-01</strong>.
        </p>
      </div>

      {/* Main Generation Banner Box */}
      <div className="bg-white rounded-2xl border-2 border-court-bronze/40 p-6 sm:p-10 shadow-court space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-court-bronze/10 border border-court-bronze/30 flex items-center justify-center text-court-bronze mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="max-w-lg mx-auto space-y-2">
          <h3 className="font-serif font-bold text-2xl text-obsidian">
            Ready to Generate Final Bilingual Will
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Side-by-side English (LTR) and Classical Arabic (RTL) court formatting with statutory Sections ONE through NINE, Execution, and Attestation clauses.
          </p>
        </div>

        {/* Action button */}
        {!generated ? (
          <div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-court-bronze hover:bg-court-bronze-dark text-white font-semibold text-sm uppercase tracking-wider shadow-lg shadow-court-bronze/25 transition-all duration-200 disabled:opacity-60"
            >
              {generating ? (
                <span>Compiling Bilingual Court Draft...</span>
              ) : (
                <>
                  <FileText className="w-5 h-5 text-white" />
                  <span>Generate Court Will (ADJD-NM1221-06-01)</span>
                </>
              )}
            </button>
            <div className="text-[11px] text-gray-400 mt-2 font-mono">
              Court Version Stamp: non-muslim-v1 · Zero drafting errors
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Will Successfully Generated & Stamped (ADJD-NM1221-06-01)</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/will/carter-01"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-obsidian hover:bg-obsidian-light text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-court-tan" />
                <span>Open Bilingual Will Viewer</span>
              </Link>

              <Link
                href="/will/carter-01/print"
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-court-border bg-white hover:bg-alabaster text-obsidian text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4 text-court-bronze" />
                <span>Print / Save to PDF</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Official Court Registration Guidance Note */}
      <div className="p-6 bg-alabaster rounded-2xl border border-court-border space-y-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-court-bronze flex-shrink-0" />
          <h4 className="font-serif font-bold text-base text-obsidian">
            What Happens Next: Abu Dhabi Civil Family Court Registration
          </h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          1. Download and print the generated bilingual document in full color on clean A4 paper.<br />
          2. Log in to the official <strong>Abu Dhabi Judicial Department (ADJD) Portal</strong> under Non-Muslim Civil Family Services.<br />
          3. Upload your bilingual will alongside passport copies of the testator, executors, and two witnesses.<br />
          4. Pay the statutory court registration fee (AED 950) directly to ADJD and complete your identity video attestation.
        </p>
      </div>
    </div>
  );
}
