import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, Trash2, Clock, CheckCircle } from "lucide-react";

interface DraftWillCardProps {
  id: string;
  willNumber: number;
  testatorName: string;
  startDate: string;
  lastUpdated: string;
  currentStep: number;
  totalSteps?: number;
  stepName: string;
  progressPercent: number;
  willType?: "INDIVIDUAL" | "MIRROR";
  onDelete?: () => void;
}

export function DraftWillCard({
  id,
  willNumber,
  testatorName,
  startDate,
  lastUpdated,
  currentStep,
  totalSteps = 16,
  stepName,
  progressPercent,
  willType = "INDIVIDUAL",
  onDelete,
}: DraftWillCardProps) {
  return (
    <div className="bg-white rounded-xl border border-court-border shadow-court hover:shadow-court-lg transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group">
      <div>
        {/* Top header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-court-tan/15 text-court-bronze flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg text-obsidian tracking-tight group-hover:text-court-bronze transition-colors">
                {testatorName || "Untitled Will"}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mt-0.5">
                <span>Will #{willNumber}</span>
                <span>·</span>
                <span>Started {startDate}</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-court-tan/15 text-court-bronze-dark">
            {willType === "MIRROR" ? "Mirror Will" : "Individual Will"}
          </span>
        </div>

        {/* Progress bar and step text */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-gray-700">
              Step {currentStep} of {totalSteps}: <strong className="text-obsidian">{stepName}</strong>
            </span>
            <span className="font-semibold text-court-bronze">{progressPercent}%</span>
          </div>

          {/* Progress bar container */}
          <div className="w-full h-2 rounded-full bg-alabaster border border-court-border/60 overflow-hidden">
            <div
              className="h-full bg-court-bronze rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <button
          onClick={onDelete}
          className="text-xs text-gray-400 hover:text-red-700 flex items-center gap-1.5 transition-colors px-2 py-1.5 rounded"
          title="Delete draft"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete draft</span>
        </button>

        <Link
          href={`/wizard/${currentStep}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-court-bronze hover:bg-court-bronze-dark text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-all duration-200"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
