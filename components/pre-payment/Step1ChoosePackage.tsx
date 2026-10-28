"use client";

import React from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
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
  onNext: () => void;
}

export function Step1ChoosePackage({
  state,
  onUpdatePackage,
  onUpdateApplicantEligibility,
  onNext,
}: Step1ChoosePackageProps) {
  const isCouples = state.packageType === "COUPLES";

  const renderRadioQuestion = (
    label: string,
    isPartner: boolean,
    field: keyof PrePaymentApplicant,
    currentValue: boolean | null
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
            onChange={() => onUpdateApplicantEligibility(isPartner, field, true)}
          />
          <span>Yes</span>
        </label>
        <label className={`pre-radio ${currentValue === false ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            checked={currentValue === false}
            onChange={() => onUpdateApplicantEligibility(isPartner, field, false)}
          />
          <span>No</span>
        </label>
      </div>
    </fieldset>
  );

  const hasIneligiblePrimary =
    state.primaryApplicant.age21 === false ||
    state.primaryApplicant.nonUae === false ||
    state.primaryApplicant.uaeAssets === false;

  const hasIneligiblePartner =
    isCouples &&
    (state.partnerApplicant.age21 === false ||
      state.partnerApplicant.nonUae === false ||
      state.partnerApplicant.uaeAssets === false);

  const isFormIncomplete =
    state.primaryApplicant.age21 === null ||
    state.primaryApplicant.nonUae === null ||
    state.primaryApplicant.uaeAssets === null ||
    (isCouples &&
      (state.partnerApplicant.age21 === null ||
        state.partnerApplicant.nonUae === null ||
        state.partnerApplicant.uaeAssets === null));

  return (
    <div className="pre-step-1">
      {/* Intro Hero Banner */}
      <div className="pre-intro pagehead">
        <div>
          <div className="eyebrow text-[#5730A1] text-xs font-bold mb-1 tracking-wider">
            START YOUR APPLICATION · STEP 1 OF 4
          </div>
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

      {/* Section line */}
      <div className="pre-sectionline">
        <span>01</span>
        <strong>Choose your Will</strong>
        <small>You can change your choice before payment</small>
      </div>

      {/* Package Selection Cards */}
      <div className="pre-package-grid">
        {/* Individual Will Card Button */}
        <button
          type="button"
          data-package-choice="individual"
          className={`card pre-package individual ${!isCouples ? "selected" : ""}`}
          aria-pressed={!isCouples}
          onClick={() => onUpdatePackage("INDIVIDUAL")}
        >
          <span className="cardbody">
            <span className="pre-package-photo" aria-hidden="true">
              <img
                src="/assets/people/individual.jpg"
                alt="Individual will testator illustration"
                width="600"
                height="800"
                loading="eager"
              />
            </span>
            <span className="pre-package-copy">
              <span className="pre-package-title">
                <span>
                  <span className="pre-package-count">FOR YOU</span>
                  <span className="pre-package-name">Individual Will</span>
                  <span className="pre-package-price-tag">AED 999</span>
                </span>
                <span className="choice-indicator" aria-hidden="true">✓</span>
              </span>
              <span className="premium-package-detail">
                One Will for your assets, your beneficiaries and the people you appoint.
              </span>
            </span>
            <span className="pre-package-action">
              {!isCouples ? "Selected" : "Choose this option"}
              <ArrowRight className="w-3.5 h-3.5 ml-1 inline" aria-hidden="true" />
            </span>
          </span>
        </button>

        {/* Couples Will Card Button */}
        <button
          type="button"
          data-package-choice="couples"
          className={`card pre-package couples ${isCouples ? "selected" : ""}`}
          aria-pressed={isCouples}
          onClick={() => onUpdatePackage("COUPLES")}
        >
          <span className="cardbody">
            <span className="pre-package-photo" aria-hidden="true">
              <img
                src="/assets/people/couples.jpg"
                alt="Couples wills partners illustration"
                width="600"
                height="800"
                loading="eager"
              />
            </span>
            <span className="pre-package-copy">
              <span className="pre-package-title">
                <span>
                  <span className="pre-package-count">FOR YOU AND YOUR PARTNER</span>
                  <span className="pre-package-name">Wills for Couples</span>
                  <span className="pre-package-price-tag">AED 1,799</span>
                </span>
                <span className="choice-indicator" aria-hidden="true">✓</span>
              </span>
              <span className="premium-package-detail">
                Two separate Wills. One person can complete both, with different wishes for each.
              </span>
            </span>
            <span className="pre-package-action">
              {isCouples ? "Selected" : "Choose this option"}
              <ArrowRight className="w-3.5 h-3.5 ml-1 inline" aria-hidden="true" />
            </span>
          </span>
        </button>
      </div>

      {/* Scope Essentials Section */}
      <div className="card pre-scope">
        <div className="pre-scope-heading">
          <span>02</span>
          <strong>Confirm a few essentials</strong>
        </div>
        <div className="cardbody">
          <div className={`grid ${isCouples ? "grid-cols-1 md:grid-cols-2 gap-8" : "grid-cols-1"}`}>
            <section>
              <h3 className="font-serif text-xl font-bold text-[#322046] mb-4">
                {isCouples ? "You" : "Primary Testator"}
              </h3>
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
                <h3 className="font-serif text-xl font-bold text-[#322046] mb-4">Your partner</h3>
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
        </div>
      </div>

      {/* Ineligibility Advice Warning */}
      {(hasIneligiblePrimary || hasIneligiblePartner) && (
        <div
          className="flex items-start gap-3 p-4 bg-[#FFF2F1] border border-[#EDC8C5] rounded-xl text-sm text-[#9F3431] mt-6"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Special assistance required:</strong>
            ADJD Non-Muslim Wills require testators to be non-Muslim expatriates aged 21 or over
            with assets in the UAE. If you answered &quot;No&quot; to any of these, our legal team
            will need to assist you directly before proceeding.
          </div>
        </div>
      )}

      {/* Continue CTA */}
      <div className="flex items-center justify-end mt-8">
        <button
          type="button"
          className="pre-btn primary"
          onClick={onNext}
          disabled={isFormIncomplete || hasIneligiblePrimary || hasIneligiblePartner}
        >
          <span>Continue to About you</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
