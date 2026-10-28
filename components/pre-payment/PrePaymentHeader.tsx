"use client";

import React from "react";
import { ArrowRight, HelpCircle } from "lucide-react";

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
        <span className="brand-text">
          owa
          <span className="brand-sub">
            Online Wills
            <br />
            Advisor
          </span>
        </span>
      </button>

      <div className="cro-header-help">
        <span className="text-xs text-[#64748B] hidden sm:inline">
          Questions before you continue?
        </span>
        <button
          type="button"
          className="pre-link text-xs sm:text-sm text-[#A37E44] hover:text-[#8C6A35] font-semibold"
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
