"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import {
  PrePaymentJourneyState,
  PrePaymentApplicant,
} from "@/types/pre-payment";

interface Step2AboutYouProps {
  state: PrePaymentJourneyState;
  onUpdateFullName: (name: string) => void;
  onUpdateApplicantDetails: (
    isPartner: boolean,
    field: "married" | "children",
    value: boolean
  ) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step2AboutYou({
  state,
  onUpdateFullName,
  onUpdateApplicantDetails,
  onBack,
  onNext,
}: Step2AboutYouProps) {
  const isCouples = state.packageType === "COUPLES";
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNextClick = () => {
    if (!state.fullName.trim()) {
      setErrorMsg("Please enter your full legal name as shown on your passport.");
      return;
    }
    if (state.primaryApplicant.married === null) {
      setErrorMsg("Please answer whether you are legally married.");
      return;
    }
    if (state.primaryApplicant.children === null) {
      setErrorMsg("Please answer whether you have children under 18.");
      return;
    }
    if (isCouples) {
      if (state.partnerApplicant.married === null) {
        setErrorMsg("Please answer the marriage question for your partner.");
        return;
      }
      if (state.partnerApplicant.children === null) {
        setErrorMsg("Please answer the minor children question for your partner.");
        return;
      }
    }

    setErrorMsg(null);
    onNext();
  };

  const renderRadioQuestion = (
    label: string,
    isPartner: boolean,
    field: "married" | "children",
    currentValue: boolean | null,
    hint?: string
  ) => (
    <fieldset className="pre-question">
      <legend>
        {label} <span className="text-[#BE4743]" aria-hidden="true">*</span>
      </legend>
      <div className="pre-options">
        <label className={`pre-radio ${currentValue === true ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            checked={currentValue === true}
            onChange={() => onUpdateApplicantDetails(isPartner, field, true)}
          />
          <span>Yes</span>
        </label>
        <label className={`pre-radio ${currentValue === false ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            checked={currentValue === false}
            onChange={() => onUpdateApplicantDetails(isPartner, field, false)}
          />
          <span>No</span>
        </label>
      </div>
      {hint && <span className="hint block mt-1.5">{hint}</span>}
    </fieldset>
  );

  return (
    <div className="pre-step-2">
      <div className="pre-pagehead">
        <span className="pre-eyebrow">STEP 2 OF 4 · ABOUT YOU</span>
        <h1>A few details about you.</h1>
        <p className="sub">
          These answers configure your application and ensure the correct ADJD statutory clauses
          are loaded for your Will.
        </p>
      </div>

      <div className="pre-card">
        <div className="pre-cardbody">
          {/* Full Legal Name */}
          <div className="pre-field">
            <label htmlFor="fullName" className="flex items-center justify-between">
              <span>Full legal name as on passport *</span>
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="e.g. John Michael Smith"
              value={state.fullName}
              onChange={(e) => onUpdateFullName(e.target.value)}
              className="mt-1"
            />
            <span className="hint">
              Enter your exact name as shown in the machine-readable zone of your passport.
              This will be registered with the ADJD Civil Family Court.
            </span>
          </div>

          <hr className="border-t border-[#E5E0D8] my-6" />

          {/* Primary Applicant Marital & Children Questions */}
          <div className="space-y-4">
            <div className="font-semibold text-xs text-[#A37E44] uppercase tracking-wider mb-2">
              Your Marital & Family Status
            </div>
            {renderRadioQuestion(
              "Are you legally married?",
              false,
              "married",
              state.primaryApplicant.married
            )}
            {renderRadioQuestion(
              "Do you have children under 18 years of age?",
              false,
              "children",
              state.primaryApplicant.children,
              "ADJD requires guardian clauses if you have minor children residing in or outside the UAE."
            )}
          </div>

          {/* Partner Questions (if Couples) */}
          {isCouples && (
            <div className="space-y-4 mt-8 pt-6 border-t border-[#E5E0D8]">
              <div className="font-semibold text-xs text-[#A37E44] uppercase tracking-wider mb-2">
                Your Partner's Family Status
              </div>
              {renderRadioQuestion(
                "Is your partner legally married to you?",
                true,
                "married",
                state.partnerApplicant.married
              )}
              {renderRadioQuestion(
                "Does your partner have children under 18 years of age?",
                true,
                "children",
                state.partnerApplicant.children
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-[#FFF2F1] border border-[#EDC8C5] rounded text-xs text-[#9F3431] mt-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E0D8]">
            <button
              type="button"
              className="pre-link text-xs text-[#64748B] hover:text-[#0B1528]"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to package choice</span>
            </button>
            <button
              type="button"
              className="pre-btn primary"
              onClick={handleNextClick}
            >
              <span>Continue to review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
