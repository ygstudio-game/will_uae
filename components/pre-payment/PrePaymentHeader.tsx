"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface PrePaymentHeaderProps {
  onOpenHelp: () => void;
  onOpenResume: () => void;
  onGoToStart: () => void;
}

export function PrePaymentHeader({
  onOpenHelp,
  onOpenResume,
  onGoToStart,
}: PrePaymentHeaderProps) {
  return (
    <header className="cro-header" role="banner">
      <button
        type="button"
        className="pre-brand"
        onClick={onGoToStart}
        aria-label="Online Wills Advisor application start"
      >
        <span className="brand">
          owa
          <span>
            Online Wills
            <br />
            Advisor
          </span>
        </span>
      </button>

      <div className="cro-header-help">
        <span className="muted-text hidden sm:inline">
          A question before you continue?
        </span>
        <button
          type="button"
          className="text-xs sm:text-sm text-[#e0d1ee] hover:text-white flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer"
          onClick={onOpenHelp}
        >
          <span>Get help</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pre-btn text-xs py-1.5 px-3 min-h-[34px] ml-2 font-medium"
          onClick={onOpenResume}
        >
          Resume application
        </button>
      </div>
    </header>
  );
}
