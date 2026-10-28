"use client";

import React from "react";
import { Check } from "lucide-react";

interface PrePaymentProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
}

const STEPS: { id: 1 | 2 | 3 | 4; label: string }[] = [
  { id: 1, label: "Choose your Will" },
  { id: 2, label: "About you" },
  { id: 3, label: "Review" },
  { id: 4, label: "Payment" },
];

export function PrePaymentProgress({
  currentStep,
  onStepClick,
}: PrePaymentProgressProps) {
  return (
    <ol className="pre-progress" aria-label="Application progress">
      {STEPS.map((s) => {
        const isActive = currentStep === s.id;
        const isDone = currentStep > s.id;
        const canClick = isDone && onStepClick;

        return (
          <li
            key={s.id}
            className={`${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            aria-current={isActive ? "step" : undefined}
          >
            {canClick ? (
              <button
                type="button"
                onClick={() => onStepClick(s.id)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left bg-transparent border-0 p-0 cursor-pointer"
              >
                <span>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                </span>
                <span>{s.label}</span>
              </button>
            ) : (
              <>
                <span>
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  ) : (
                    s.id
                  )}
                </span>
                <span>{s.label}</span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
