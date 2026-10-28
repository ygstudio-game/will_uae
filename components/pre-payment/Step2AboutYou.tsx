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
      setErrorMsg("Enter your full name as shown on your passport.");
      return;
    }
    if (state.primaryApplicant.married === null) {
      setErrorMsg("Answer the marriage question for yourself.");
      return;
    }
    if (state.primaryApplicant.children === null) {
      setErrorMsg("Answer the children-under-18 question for yourself.");
      return;
    }
    if (isCouples) {
      if (state.partnerApplicant.married === null) {
        setErrorMsg("Answer the marriage question for your partner.");
        return;
      }
      if (state.partnerApplicant.children === null) {
        setErrorMsg("Answer the children-under-18 question for your partner.");
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
      <div className="pagehead">
        <div className="eyebrow text-[#5730A1] text-xs font-bold mb-1 tracking-wider">
          STEP 2 OF 4 · ABOUT YOU
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2c184b]">
          A little about you and your family.
        </h1>
        <p className="sub text-[#625975] text-sm mt-1">
          These details help us prepare your questionnaire. No document uploads are needed yet.
        </p>
      </div>

      <div className="pre-step-2-grid mt-6">
        {/* Left Column: Form Details Card */}
        <div className="card pre-details-card">
          <div className="cardbody">
            <label className="field font-semibold text-sm text-[#241B35] block">
              Your full name *
              <input
                type="text"
                autoComplete="name"
                aria-required="true"
                placeholder="e.g. John Michael Smith"
                value={state.fullName}
                onChange={(e) => onUpdateFullName(e.target.value)}
              />
              <span className="hint">Use your name as shown on your passport.</span>
            </label>

            <div className={`grid ${isCouples ? "grid-cols-1 md:grid-cols-2 gap-4" : "grid-cols-1"} mt-6`}>
              <section>
                <h3 className="font-serif text-lg font-bold text-[#322046] mb-3">
                  {isCouples ? "You" : "Personal details"}
                </h3>
                {renderRadioQuestion(
                  "Are you married?",
                  false,
                  "married",
                  state.primaryApplicant.married
                )}
                {renderRadioQuestion(
                  "Do you have any children under 18?",
                  false,
                  "children",
                  state.primaryApplicant.children
                )}
              </section>

              {isCouples && (
                <section>
                  <h3 className="font-serif text-lg font-bold text-[#322046] mb-3">
                    Your partner
                  </h3>
                  {renderRadioQuestion(
                    "Is your partner married?",
                    true,
                    "married",
                    state.partnerApplicant.married
                  )}
                  {renderRadioQuestion(
                    "Does your partner have any children under 18?",
                    true,
                    "children",
                    state.partnerApplicant.children
                  )}
                </section>
              )}
            </div>

            {isCouples && (
              <p className="text-xs text-[#625975] mt-4 leading-relaxed">
                You’ll enter your partner’s full identity and contact details after payment. Each Will can have different children and appointments.
              </p>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-[#FFF2F1] border border-[#EDC8C5] rounded text-xs text-[#9F3431] mt-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reassurance Green Satin Card */}
        <aside className="callout pre-about-note">
          <div>
            <strong>You won’t need to enter this twice</strong>
            <p>
              Your answers carry into the questionnaire and help us show the relevant sections. You choose your beneficiaries and appointments later.
            </p>
            <p>You can edit these details later.</p>
          </div>
        </aside>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          className="btn"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1 inline" />
          <span>Back</span>
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={handleNextClick}
        >
          <span>Review your package</span>
          <ArrowRight className="w-4 h-4 ml-1 inline" />
        </button>
      </div>
    </div>
  );
}
