"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Loader2, HelpCircle } from "lucide-react";
import { OwaSectionId, OWA_SECTIONS } from "@/types/owa";

interface OwaNavigationProps {
  currentSection: OwaSectionId;
  onNext: () => void;
  onPrev: () => void;
  onOpenSupport?: () => void;
  isSaving?: boolean;
  canContinue?: boolean;
  saveError?: string | null;
}

export function OwaNavigation({
  currentSection,
  onNext,
  onPrev,
  onOpenSupport,
  isSaving,
  canContinue = true,
  saveError,
}: OwaNavigationProps) {
  const currentIndex = OWA_SECTIONS.findIndex((s) => s.id === currentSection);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === OWA_SECTIONS.length - 1;

  return (
    <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#E5E0D8] py-4 px-4 sm:px-8 mt-8 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back button & Support */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#E5E0D8] text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {onOpenSupport && (
            <button
              type="button"
              onClick={onOpenSupport}
              className="inline-flex items-center gap-1.5 text-xs text-[#A37E44] hover:text-[#8C6B37] font-semibold transition-all px-2 py-1"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Support Request</span>
            </button>
          )}
        </div>

        {/* Center: Save state indicator */}
        <div className="text-center">
          {isSaving ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A37E44]" />
              <span>Saving to Neon DB...</span>
            </span>
          ) : saveError ? (
            <span className="text-xs text-red-600">{saveError}</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#047857] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to database</span>
            </span>
          )}
        </div>

        {/* Right: Continue button */}
        <div>
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#A37E44] hover:bg-[#8C6B37] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <span>{isLast ? "Review Draft" : "Save & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
