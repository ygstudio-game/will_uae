"use client";

import React from "react";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
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
      <div className="pre-pagehead">
        <span className="pre-eyebrow">STEP 1 OF 4 · START YOUR APPLICATION</span>
        <h1>Choose your Will.</h1>
        <p className="sub">
          Prepare a legally binding non-Muslim Will for the Abu Dhabi Judicial Department (ADJD)
          Civil Family Court.
        </p>
      </div>

      {/* Package Selection Cards */}
      <div className="pre-package-grid">
        {/* Individual Will Card */}
        <div
          className={`pre-package ${!isCouples ? "selected" : ""}`}
          onClick={() => onUpdatePackage("INDIVIDUAL")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onUpdatePackage("INDIVIDUAL");
            }
          }}
        >
          <div className="flex items-center justify-between">
            <span className="pre-eyebrow text-[10px]">ONE INDIVIDUAL WILL</span>
            {!isCouples && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E6B4A] bg-[#EDF5F0] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Selected
              </span>
            )}
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0B1528] mt-2">Individual Will</h2>
          <div className="pre-price">
            AED 999
            <span>OWA service fee · covers one Will in English and Arabic</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
            Personalised bilingual Will registered with the ADJD Civil Family Court. Includes
            six-section questionnaire, document support, and application review.
          </p>
          <div className="pre-court-line">
            ADJD court fee: <strong>AED 950 per Will</strong>, paid directly to ADJD later (not
            charged by OWA).
          </div>
        </div>

        {/* Couples Will Card */}
        <div
          className={`pre-package ${isCouples ? "selected" : ""}`}
          onClick={() => onUpdatePackage("COUPLES")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onUpdatePackage("COUPLES");
            }
          }}
        >
          <div className="flex items-center justify-between">
            <span className="pre-eyebrow text-[10px]">TWO SEPARATE WILLS</span>
            {isCouples && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E6B4A] bg-[#EDF5F0] px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Selected
              </span>
            )}
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0B1528] mt-2">Wills for Couples</h2>
          <div className="pre-price">
            AED 1,799
            <span>OWA service fee · covers two Wills in English and Arabic</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
            Two separate or mirror Wills for married couples or partners with UAE assets.
            Covers mutual inheritance, guardianship for children, and joint application review.
          </p>
          <div className="pre-court-line">
            ADJD court fee: <strong>AED 1,900 for two Wills</strong>, paid directly to ADJD later
            (not charged by OWA).
          </div>
        </div>
      </div>

      {/* Scope / Eligibility Questions Section */}
      <div className="pre-card p-6 sm:p-8 mt-6">
        <h3 className="text-base font-bold text-[#0B1528] mb-1">
          Court Eligibility Screening
        </h3>
        <p className="text-xs text-[#64748B] mb-5">
          The ADJD Civil Family Court requires all non-Muslim testators to meet official statutory
          conditions before registration.
        </p>

        {/* Primary Applicant Questions */}
        <div className="space-y-4">
          <div className="font-semibold text-xs text-[#A37E44] uppercase tracking-wider mb-2">
            Your Eligibility
          </div>
          {renderRadioQuestion(
            "Are you aged 21 or above?",
            false,
            "age21",
            state.primaryApplicant.age21
          )}
          {renderRadioQuestion(
            "Do you hold a nationality other than the United Arab Emirates?",
            false,
            "nonUae",
            state.primaryApplicant.nonUae
          )}
          {renderRadioQuestion(
            "Do you reside in the UAE or own assets (real estate, bank accounts, or shares) in the UAE?",
            false,
            "uaeAssets",
            state.primaryApplicant.uaeAssets
          )}
        </div>

        {/* Partner Questions (if Couples) */}
        {isCouples && (
          <div className="space-y-4 mt-8 pt-6 border-t border-[#E5E0D8]">
            <div className="font-semibold text-xs text-[#A37E44] uppercase tracking-wider mb-2">
              Your Partner's Eligibility
            </div>
            {renderRadioQuestion(
              "Is your partner aged 21 or above?",
              true,
              "age21",
              state.partnerApplicant.age21
            )}
            {renderRadioQuestion(
              "Does your partner hold a nationality other than the United Arab Emirates?",
              true,
              "nonUae",
              state.partnerApplicant.nonUae
            )}
            {renderRadioQuestion(
              "Does your partner reside in the UAE or own assets in the UAE?",
              true,
              "uaeAssets",
              state.partnerApplicant.uaeAssets
            )}
          </div>
        )}

        {/* Court Restriction Warning */}
        {(hasIneligiblePrimary || hasIneligiblePartner) && (
          <div className="flex items-start gap-3 p-4 bg-[#FFF2F1] border border-[#EDC8C5] rounded-md text-xs text-[#9F3431] mt-6">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>ADJD Civil Family Court restriction:</strong>
              <p className="mt-1">
                The Non-Muslim Wills Registry is restricted to non-Muslim, non-UAE nationals aged
                21 or older who possess assets or residency in the UAE. If you answered "No", your
                application may require special review before payment.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E0D8]">
          <div className="text-xs text-[#64748B]">
            All answers are automatically saved to your draft.
          </div>
          <button
            type="button"
            className="pre-btn primary"
            disabled={isFormIncomplete}
            onClick={onNext}
          >
            <span>Continue to your details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
