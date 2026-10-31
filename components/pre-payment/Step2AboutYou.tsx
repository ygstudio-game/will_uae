"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  PrePaymentJourneyState,
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
  const [errors, setErrors] = useState<string[]>([]);

  const getAboutErrors = (): string[] => {
    const e: string[] = [];
    if (!state.fullName.trim()) {
      e.push("Enter your full name as shown on your passport.");
    }
    if (state.primaryApplicant.married === null) {
      e.push("You: answer the marriage question.");
    }
    if (state.primaryApplicant.children === null) {
      e.push("You: answer the children-under-18 question.");
    }
    if (isCouples) {
      if (state.partnerApplicant.married === null) {
        e.push("Your partner: answer the marriage question.");
      }
      if (state.partnerApplicant.children === null) {
        e.push("Your partner: answer the children-under-18 question.");
      }
    }
    return e;
  };

  const handleNextClick = () => {
    const errs = getAboutErrors();
    if (errs.length > 0) {
      setErrors(errs);
      const errBox = document.getElementById("pre-errors");
      if (errBox) {
        errBox.scrollIntoView({ behavior: "smooth", block: "center" });
        errBox.focus();
      }
      return;
    }
    setErrors([]);
    onNext();
  };

  const handleRadioDetailsChange = (
    isPartner: boolean,
    field: "married" | "children",
    value: boolean
  ) => {
    onUpdateApplicantDetails(isPartner, field, value);
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const renderRadioQuestion = (
    label: string,
    isPartner: boolean,
    field: "married" | "children",
    currentValue: boolean | null
  ) => (
    <fieldset className="pre-question">
      <legend>
        {label} <span aria-hidden="true">*</span>
      </legend>
      <div className="pre-options">
        <label className={`pre-radio ${currentValue === true ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            value="true"
            checked={currentValue === true}
            onChange={() => handleRadioDetailsChange(isPartner, field, true)}
          />
          Yes
        </label>
        <label className={`pre-radio ${currentValue === false ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            value="false"
            checked={currentValue === false}
            onChange={() => handleRadioDetailsChange(isPartner, field, false)}
          />
          No
        </label>
      </div>
    </fieldset>
  );

  return (
    <div className="pre-step-2">
      {/* Pagehead */}
      <div className="pagehead">
        <div className="eyebrow">STEP 2 OF 4 · ABOUT YOU</div>
        <h1>A little about you and your family.</h1>
        <p className="sub">
          These details help us prepare your questionnaire. No document uploads are needed yet.
        </p>
      </div>

      <div className="cols">
        {/* Left Card: Form Inputs */}
        <div className="card pre-details-card">
          <div className="cardbody">
            <label className="field">
              Your full name *
              <input
                type="text"
                autoComplete="name"
                aria-required="true"
                value={state.fullName}
                onChange={(e) => {
                  onUpdateFullName(e.target.value);
                  if (errors.length > 0) setErrors([]);
                }}
              />
              <span className="hint">Use your name as shown on your passport.</span>
            </label>

            <div className="grid2 pre-gap">
              <section>
                <h3>You</h3>
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
                  <h3>Your partner</h3>
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
              <p className="small muted">
                You’ll enter your partner’s full identity and contact details after payment. Each Will can have different children and appointments.
              </p>
            )}
          </div>
        </div>

        {/* Right Aside: Callout Reassurance */}
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

      {/* Error alert box matching prototype */}
      {errors.length > 0 && (
        <div
          id="pre-errors"
          className="errorbox show pre-gap"
          role="alert"
          tabIndex={-1}
        >
          <strong>Please check:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={onBack}
        >
          <ArrowLeft className="icon inline w-4 h-4 mr-1" aria-hidden="true" />
          <span>Back</span>
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={handleNextClick}
        >
          <span>Review your package</span>
          <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
