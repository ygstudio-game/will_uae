import React from "react";
import Link from "next/link";
import { CheckCircle2, Download, ExternalLink, Printer, Scale } from "lucide-react";

interface GeneratedWillCardProps {
  id: string;
  testatorName: string;
  completedDate: string;
  versionTag?: string;
  partiesSummary: string[];
}

export function GeneratedWillCard({
  id,
  testatorName,
  completedDate,
  versionTag = "non-muslim-v1",
  partiesSummary,
}: GeneratedWillCardProps) {
  return (
    <div className="bg-white rounded-xl border border-court-border shadow-court p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg text-obsidian tracking-tight">
                {testatorName}
              </h3>
              <div className="text-xs text-gray-500 font-sans mt-0.5">
                Completed on {completedDate} · Court Version {versionTag}
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Generated</span>
          </span>
        </div>

        {/* Confirmed Parties list */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">
            Confirmed Will Appointments
          </div>
          <div className="flex flex-wrap gap-1.5">
            {partiesSummary.map((party, idx) => (
              <span
                key={idx}
                className="text-xs bg-alabaster border border-court-border/70 text-gray-700 px-2.5 py-1 rounded-md"
              >
                {party}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <Link
          href={`/will/${id}/print`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-obsidian font-semibold transition-colors px-3 py-2 rounded-md hover:bg-alabaster"
        >
          <Printer className="w-3.5 h-3.5 text-court-bronze" />
          <span>Print / PDF</span>
        </Link>

        <Link
          href={`/will/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-obsidian hover:bg-obsidian-light text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-all"
        >
          <span>Open Will</span>
          <ExternalLink className="w-3.5 h-3.5 text-court-tan" />
        </Link>
      </div>
    </div>
  );
}
