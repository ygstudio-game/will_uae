"use client";

import React, { useState } from "react";
import { AlertCircle, FileCheck, ArrowRight, X } from "lucide-react";

interface DocumentAlertBannerProps {
  count?: number;
  onReviewClick?: () => void;
}

export function DocumentAlertBanner({ count = 1, onReviewClick }: DocumentAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300/50 flex items-center justify-center flex-shrink-0 text-amber-800 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs uppercase tracking-wider text-amber-900">
                Documents to confirm ({count})
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-amber-950/80 mt-1 leading-relaxed">
              Your uploaded passport for primary executor <strong>Sarah Elizabeth Carter</strong> has been scanned. Please verify the auto-extracted identity details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onReviewClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold tracking-wide transition-colors"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-amber-800/60 hover:text-amber-950 rounded-md transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
