"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  PrePaymentJourneyState,
  PrePaymentPackageType,
  PrePaymentApplicant,
} from "@/types/pre-payment";

interface Step1ChoosePackageProps {
  state: PrePaymentJourneyState;
  onUpdatePackage: (pkg: PrePaymentPackageType) => void;
  onUpdateApplicantEligibility: (
    isPartner: boolean,
    field: keyof PrePaymentApplicant,
    value: boolean
  ) => void;
  onOpenHelp?: () => void;
  onNext: () => void;
}

export function Step1ChoosePackage({
  state,
  onUpdatePackage,
  onUpdateApplicantEligibility,
  onOpenHelp,
  onNext,
}: Step1ChoosePackageProps) {
  const isCouples = state.packageType === "COUPLES";
  const [errors, setErrors] = useState<string[]>([]);

  const getScopeErrors = (): string[] => {
    const e: string[] = [];
    if (!state.packageType) {
      e.push("Choose an Individual Will or Wills for Couples.");
      return e;
    }
    const applicants = isCouples
      ? [
          { applicant: state.primaryApplicant, isPartner: false },
          { applicant: state.partnerApplicant, isPartner: true },
        ]
      : [{ applicant: state.primaryApplicant, isPartner: false }];

    applicants.forEach(({ applicant, isPartner }) => {
      const who = isPartner ? "Your partner" : "You";
      const questions: [keyof PrePaymentApplicant, string][] = [
        ["age21", "age 21 or above"],
        ["nonUae", "non-UAE nationality"],
        ["uaeAssets", "assets in the UAE"],
      ];

      questions.forEach(([key, label]) => {
        const val = applicant[key];
        if (val === null) {
          e.push(`${who}: answer the question about ${label}.`);
        } else if (val === false) {
          e.push(`${who}: this answer needs a team check before payment.`);
        }
      });
    });

    return e;
  };

  const handleSelectPackage = (pkg: PrePaymentPackageType) => {
    onUpdatePackage(pkg);
    setErrors([]);
  };

  const handleRadioChange = (
    isPartner: boolean,
    field: keyof PrePaymentApplicant,
    val: boolean
  ) => {
    onUpdateApplicantEligibility(isPartner, field, val);
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleContinue = () => {
    const errs = getScopeErrors();
    if (errs.length > 0) {
      setErrors(errs);
      const errBox = document.getElementById("pre-errors");
      if (errBox) {
        errBox.scrollIntoView({ behavior: "smooth", block: "center" });
        errBox.focus();
      }
      return;
    }
    onNext();
  };

  const renderRadioQuestion = (
    label: string,
    isPartner: boolean,
    field: keyof PrePaymentApplicant,
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
            onChange={() => handleRadioChange(isPartner, field, true)}
          />
          Yes
        </label>
        <label className={`pre-radio ${currentValue === false ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            value="false"
            checked={currentValue === false}
            onChange={() => handleRadioChange(isPartner, field, false)}
          />
          No
        </label>
      </div>
    </fieldset>
  );

  return (
    <div className="pre-step-1">
      {/* Intro Header */}
      <div className="pre-intro pagehead">
        <div>
          <div className="eyebrow">START YOUR APPLICATION · STEP 1 OF 4</div>
          <h1>Who is your Will for?</h1>
          <p className="sub">
            Start with who needs a Will. Then answer a few questions about you. Review the fee before you pay.
          </p>
        </div>
        <div className="pre-intro-art" aria-hidden="true">
          <span className="pre-intro-sheet"></span>
          <span className="pre-intro-seal">owa</span>
        </div>
      </div>

      {/* 01 Choose your Will Section Line */}
      <div className="pre-sectionline">
        <span>01</span>
        <strong>Choose your Will</strong>
        <small>You can change your choice before payment</small>
      </div>

      {/* Package Selection Cards */}
      <div className="grid2 pre-package-grid">
        {/* Individual Will */}
        <button
          type="button"
          data-package-choice="individual"
          className={`card pre-package individual ${!isCouples && state.packageType === "INDIVIDUAL" ? "selected" : ""}`}
          aria-pressed={!isCouples && state.packageType === "INDIVIDUAL"}
          onClick={() => handleSelectPackage("INDIVIDUAL")}
        >
          <span className="cardbody">
            <span className="pre-package-photo" aria-hidden="true">
              <img
                src="/assets/people/individual.jpg"
                alt=""
                width="600"
                height="800"
                decoding="async"
              />
            </span>
            <span className="pre-package-copy">
              <span className="pre-package-title">
                <span>
                  <span className="pre-package-count">FOR YOU</span>
                  <span className="pre-package-name">Individual Will</span>
                </span>
                <span className="choice-indicator" aria-hidden="true">
                  ✓
                </span>
              </span>
              <span className="premium-package-detail">
                One Will for your assets, your beneficiaries and the people you appoint.
              </span>
            </span>
            <span className="pre-package-action">
              {!isCouples && state.packageType === "INDIVIDUAL" ? "Selected" : "Choose this option"}{" "}
              <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
            </span>
          </span>
        </button>

        {/* Wills for Couples */}
        <button
          type="button"
          data-package-choice="couples"
          className={`card pre-package couples ${isCouples ? "selected" : ""}`}
          aria-pressed={isCouples}
          onClick={() => handleSelectPackage("COUPLES")}
        >
          <span className="cardbody">
            <span className="pre-package-photo" aria-hidden="true">
              <img
                src="/assets/people/couples.jpg"
                alt=""
                width="600"
                height="800"
                decoding="async"
              />
            </span>
            <span className="pre-package-copy">
              <span className="pre-package-title">
                <span>
                  <span className="pre-package-count">FOR YOU AND YOUR PARTNER</span>
                  <span className="pre-package-name">Wills for Couples</span>
                </span>
                <span className="choice-indicator" aria-hidden="true">
                  ✓
                </span>
              </span>
              <span className="premium-package-detail">
                Two separate Wills. One person can complete both, with different wishes for each.
              </span>
            </span>
            <span className="pre-package-action">
              {isCouples ? "Selected" : "Choose this option"}{" "}
              <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
            </span>
          </span>
        </button>
      </div>

      {/* 02 Confirm a few essentials */}
      {state.packageType && (
        <div className="card pre-gap pre-scope">
          <div className="pre-scope-heading">
            <span>02</span>
            <strong>Confirm a few essentials</strong>
          </div>
          <div className="cardbody">
            <div className="grid2">
              <section>
                <h3>You</h3>
                {renderRadioQuestion(
                  "Are you aged 21 or above?",
                  false,
                  "age21",
                  state.primaryApplicant.age21
                )}
                {renderRadioQuestion(
                  "Are you a non-UAE national?",
                  false,
                  "nonUae",
                  state.primaryApplicant.nonUae
                )}
                {renderRadioQuestion(
                  "Do you own any assets in the UAE?",
                  false,
                  "uaeAssets",
                  state.primaryApplicant.uaeAssets
                )}
              </section>

              {isCouples && (
                <section>
                  <h3>Your partner</h3>
                  {renderRadioQuestion(
                    "Is your partner aged 21 or above?",
                    true,
                    "age21",
                    state.partnerApplicant.age21
                  )}
                  {renderRadioQuestion(
                    "Is your partner a non-UAE national?",
                    true,
                    "nonUae",
                    state.partnerApplicant.nonUae
                  )}
                  {renderRadioQuestion(
                    "Does your partner own assets in the UAE?",
                    true,
                    "uaeAssets",
                    state.partnerApplicant.uaeAssets
                  )}
                </section>
              )}
            </div>
            <p className="pre-scope-note">
              These questions check our standard service scope. If an answer is No, the team will need to check your application before you pay.
            </p>
          </div>
        </div>
      )}

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

      {/* Bottom Actions */}
      <div className="actions">
        <button
          type="button"
          className="link small"
          onClick={onOpenHelp}
        >
          Need help choosing?
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={handleContinue}
        >
          <span>Continue</span>
          <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
