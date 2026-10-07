"use client";

import React from "react";
import Link from "next/link";
import { WIZARD_STEPS } from "@/types/will";
import { Check, ChevronRight } from "lucide-react";

interface WizardStepperProps {
  currentStep: number;
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  const currentMeta = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];
  const progressPercent = Math.round((currentStep / 16) * 100);

  return (
    <div className="bg-white border-b border-court-border sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3.5">
        {/* Top summary row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-court-bronze bg-court-tan/15 px-2.5 py-0.5 rounded">
              Step {currentStep} of 16
            </span>
            {currentMeta.romanNumeral && (
              <span className="text-[11px] font-serif font-bold text-gray-400">
                ({currentMeta.sectionCode})
              </span>
            )}
            <h1 className="text-sm sm:text-base font-serif font-bold text-obsidian tracking-tight">
              {currentMeta.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-sans">
              Progress: <strong className="text-court-bronze">{progressPercent}%</strong>
            </span>
            <div className="w-24 sm:w-36 h-2 rounded-full bg-alabaster border border-court-border overflow-hidden">
              <div
                className="h-full bg-court-bronze transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step chips bar (desktop horizontal scroll) */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-xs">
          {WIZARD_STEPS.map((stepItem) => {
            const isCompleted = stepItem.step < currentStep;
            const isCurrent = stepItem.step === currentStep;

            return (
              <Link
                key={stepItem.step}
                href={`/wizard/${stepItem.step}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex-shrink-0 ${
                  isCurrent
                    ? "bg-obsidian text-white font-semibold"
                    : isCompleted
                    ? "bg-court-tan/15 text-court-bronze-dark hover:bg-court-tan/25"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    isCurrent
                      ? "bg-court-bronze text-white font-bold"
                      : isCompleted
                      ? "bg-court-bronze/20 text-court-bronze-dark font-bold"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : stepItem.step}
                </span>
                <span>{stepItem.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
