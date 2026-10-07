"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { useWillStore } from "@/store/useWillStore";

interface WizardNavigationProps {
  currentStep: number;
  isValid?: boolean;
  onNext?: () => void;
  nextLabel?: string;
  validationMessage?: string;
}

export function WizardNavigation({
  currentStep,
  isValid = true,
  onNext,
  nextLabel,
  validationMessage,
}: WizardNavigationProps) {
  const router = useRouter();
  const { saveCurrentStep, isSaving } = useWillStore();
  const [localSaving, setLocalSaving] = useState(false);

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/wizard/${currentStep - 1}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleNext = async () => {
    if (!isValid || localSaving || isSaving) return;
    setLocalSaving(true);

    try {
      // Auto-save current step to Neon DB
      await saveCurrentStep(currentStep);

      if (onNext) {
        onNext();
      } else if (currentStep < 16) {
        router.push(`/wizard/${currentStep + 1}`);
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLocalSaving(false);
    }
  };

  const defaultNextLabel = currentStep === 16 ? "Finish & Go to Dashboard" : "Save & Continue";
  const saving = localSaving || isSaving;

  return (
    <div className="bg-white border-t border-court-border py-4 px-4 sm:px-6 shadow-court mt-12 sticky bottom-0 z-30">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Back button & Auto-save status */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-court-border bg-white hover:bg-alabaster text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStep === 1 ? "Dashboard" : "Back"}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-court-bronze" />
                <span className="text-court-bronze-dark">Saving to database...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Saved to Neon DB</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Validation hint + Next / Continue button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {!isValid && validationMessage && (
            <div className="text-xs text-amber-800 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{validationMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid || saving}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold shadow-sm transition-all duration-200 ${
              isValid && !saving
                ? "bg-court-bronze hover:bg-court-bronze-dark text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>{nextLabel || defaultNextLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
