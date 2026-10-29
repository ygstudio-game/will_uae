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

  // Requirement 2: Auto-scroll to Section 02 on package selection
  const handleSelectPackage = (pkg: PrePaymentPackageType) => {
    onUpdatePackage(pkg);
    setTimeout(() => {
      const scopeEl = document.getElementById("pre-scope-section");
      if (scopeEl) {
        scopeEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleRadioChange = (
    isPartner: boolean,
    field: keyof PrePaymentApplicant,
    val: boolean
  ) => {
    onUpdateApplicantEligibility(isPartner, field, val);
    // If the answer is Yes, check if all questions are answered to guide toward continue
    if (val === true) {
      setTimeout(() => {
        const nextBtn = document.getElementById("pre-step1-continue-btn");
        if (nextBtn) {
          nextBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 150);
    }
  };

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
            onChange={() => handleRadioChange(isPartner, field, true)}
          />
          <span>Yes</span>
        </label>
        <label className={`pre-radio ${currentValue === false ? "selected" : ""}`}>
          <input
            type="radio"
            name={`${isPartner ? "partner" : "primary"}-${field}`}
            checked={currentValue === false}
            onChange={() => handleRadioChange(isPartner, field, false)}
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

  // =========================================================================
  // REQUIREMENT 3 & 4: 9-WAY LEGAL REPLIES SYSTEM
  // Replaces the generic "Please check: this answer needs a team check" card
  // with 9 tailored, authoritative, reassuring legal replies.
  // =========================================================================
  interface ScopeReply {
    id: number;
    badge: string;
    title: string;
    text: string;
    recommendation: string;
    actionLabel?: string;
    onAction?: () => void;
    correctionField: keyof PrePaymentApplicant;
    isPartnerCorrection: boolean;
  }

  const activeReplies: ScopeReply[] = [];

  // --- CRITERION 1: AGE 21+ ---
  if (state.primaryApplicant.age21 === false && (!isCouples || state.partnerApplicant.age21 !== false)) {
    // Way 1: Primary under 21
    activeReplies.push({
      id: 1,
      badge: "ADJD Civil Family Court · Age Requirement",
      title: "Minimum Age Requirement (You)",
      text: "Under Abu Dhabi Civil Family Court Law No. 14 of 2021, a testator must be at least 21 years of age according to the Gregorian calendar to legally register a Will in the UAE.",
      recommendation: "If you are currently under 21, you cannot execute a standalone Will yet. Our legal specialists can guide your family on interim custody declarations and guardian nominations.",
      actionLabel: "Speak with our legal team",
      onAction: onOpenHelp,
      correctionField: "age21",
      isPartnerCorrection: false,
    });
  } else if (isCouples && state.partnerApplicant.age21 === false && state.primaryApplicant.age21 !== false) {
    // Way 2: Partner under 21
    activeReplies.push({
      id: 2,
      badge: "ADJD Civil Family Court · Age Requirement",
      title: "Partner Minimum Age (Under 21)",
      text: "Your partner must reach 21 years of age under ADJD court regulations to register a Will in Abu Dhabi.",
      recommendation: "You can proceed with an Individual Will (AED 999) for yourself today. Once your partner celebrates their 21st birthday, we can easily register a separate Will for them.",
      actionLabel: "Switch to Individual Will (AED 999)",
      onAction: () => onUpdatePackage("INDIVIDUAL"),
      correctionField: "age21",
      isPartnerCorrection: true,
    });
  } else if (isCouples && state.primaryApplicant.age21 === false && state.partnerApplicant.age21 === false) {
    // Way 3: Both under 21
    activeReplies.push({
      id: 3,
      badge: "ADJD Civil Family Court · Age Requirement",
      title: "Minimum Age Requirement (Both Testators)",
      text: "Both testators must be at least 21 years of age to register legal wills with the Abu Dhabi Judicial Department.",
      recommendation: "Our team can assist you with preliminary family estate structuring and custody planning so your documents are ready for court submission when you reach 21.",
      actionLabel: "Contact Legal Support",
      onAction: onOpenHelp,
      correctionField: "age21",
      isPartnerCorrection: false,
    });
  }

  // --- CRITERION 2: NON-UAE NATIONALITY ---
  if (state.primaryApplicant.nonUae === false && (!isCouples || state.partnerApplicant.nonUae !== false)) {
    // Way 4: Primary is UAE national
    activeReplies.push({
      id: 4,
      badge: "ADJD Jurisdiction · Nationality Scope",
      title: "ADJD Non-Muslim Registry is for Expatriates (You)",
      text: "The ADJD Civil Family Court Non-Muslim Wills Registry is specifically established for expatriates and foreign nationals. For UAE citizens, inheritance is governed by the UAE Personal Status Law.",
      recommendation: "Our licensed legal consultancy can advise you on Sharia-compliant estate planning and specialized family estate distribution in accordance with UAE law.",
      actionLabel: "Request UAE National Consultation",
      onAction: onOpenHelp,
      correctionField: "nonUae",
      isPartnerCorrection: false,
    });
  } else if (isCouples && state.partnerApplicant.nonUae === false && state.primaryApplicant.nonUae !== false) {
    // Way 5: Partner is UAE national
    activeReplies.push({
      id: 5,
      badge: "ADJD Jurisdiction · Nationality Scope",
      title: "Partner is a UAE Citizen",
      text: "The ADJD Non-Muslim Will regime applies to non-UAE citizens. If your partner is a UAE citizen, their estate is governed by the UAE Personal Status Law.",
      recommendation: "You can proceed with an Individual Will (AED 999) for yourself as an expatriate, and our legal team can assist your partner with UAE national estate arrangements.",
      actionLabel: "Proceed with Individual Will (AED 999)",
      onAction: () => onUpdatePackage("INDIVIDUAL"),
      correctionField: "nonUae",
      isPartnerCorrection: true,
    });
  } else if (isCouples && state.primaryApplicant.nonUae === false && state.partnerApplicant.nonUae === false) {
    // Way 6: Both are UAE nationals
    activeReplies.push({
      id: 6,
      badge: "ADJD Jurisdiction · Nationality Scope",
      title: "Both Testators are UAE Citizens",
      text: "The ADJD Non-Muslim Wills Registry exclusively registers wills for foreign non-UAE nationals. UAE citizens are subject to the UAE Personal Status Law.",
      recommendation: "Please connect with our legal consultancy team for tailored Sharia-compliant estate planning and court-notarized inheritance documentation.",
      actionLabel: "Contact Family Law Consultancy",
      onAction: onOpenHelp,
      correctionField: "nonUae",
      isPartnerCorrection: false,
    });
  }

  // --- CRITERION 3: UAE ASSETS ---
  if (state.primaryApplicant.uaeAssets === false && (!isCouples || state.partnerApplicant.uaeAssets !== false)) {
    // Way 7: Primary has no UAE assets
    activeReplies.push({
      id: 7,
      badge: "ADJD Jurisdiction · UAE Assets",
      title: "No Current Assets Owned in the UAE (You)",
      text: "An ADJD Non-Muslim Will is registered with the Abu Dhabi Judicial Department to distribute and protect assets (real estate, bank accounts, business shares, vehicles) situated within the UAE.",
      recommendation: "If you are in the process of purchasing real estate, opening UAE bank accounts, or moving funds to the UAE, our team can help you prepare your draft now so it is ready once assets are formalized.",
      actionLabel: "Consult about Future Assets",
      onAction: onOpenHelp,
      correctionField: "uaeAssets",
      isPartnerCorrection: false,
    });
  } else if (isCouples && state.partnerApplicant.uaeAssets === false && state.primaryApplicant.uaeAssets !== false) {
    // Way 8: Partner has no UAE assets
    activeReplies.push({
      id: 8,
      badge: "ADJD Jurisdiction · UAE Assets",
      title: "Your Partner Does Not Own Assets in the UAE",
      text: "A UAE Will distributes assets located inside the Emirates. If your partner does not hold assets in the UAE, a separate Will may not be required for them.",
      recommendation: "An Individual Will (AED 999) for your assets may be more suitable, or we can structure the couples package to protect prospective assets your partner plans to acquire in the UAE.",
      actionLabel: "Switch to Individual Will (AED 999)",
      onAction: () => onUpdatePackage("INDIVIDUAL"),
      correctionField: "uaeAssets",
      isPartnerCorrection: true,
    });
  } else if (isCouples && state.primaryApplicant.uaeAssets === false && state.partnerApplicant.uaeAssets === false) {
    // Way 9: Neither has UAE assets
    activeReplies.push({
      id: 9,
      badge: "ADJD Jurisdiction · UAE Assets",
      title: "No Current Assets in the UAE (Both Testators)",
      text: "ADJD Non-Muslim Wills are designed specifically to protect and distribute assets situated within the United Arab Emirates.",
      recommendation: "If you are relocating to the UAE, acquiring property, or setting up businesses here, our team can prepare your draft in advance ready for court registration when your assets are in place.",
      actionLabel: "Inquire about Prospective Assets",
      onAction: onOpenHelp,
      correctionField: "uaeAssets",
      isPartnerCorrection: false,
    });
  }

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
          onClick={() => handleSelectPackage("INDIVIDUAL")}
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
          onClick={() => handleSelectPackage("COUPLES")}
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

      {/* Scope Essentials Section - with id for smooth redirect */}
      <div id="pre-scope-section" className="card pre-scope">
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
          <p className="pre-scope-note">
            These questions verify ADJD Civil Family Court service scope. Answering No to any item will provide specific legal guidance below.
          </p>
        </div>
      </div>

      {/* 9-Way Tailored Legal Replies */}
      {activeReplies.length > 0 && (
        <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-top-3 duration-200">
          {activeReplies.map((reply) => (
            <div
              key={reply.id}
              className="p-5 bg-[#FAF7F3] border border-[#E4D8C7] rounded-2xl shadow-sm text-[#2E203C]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EADCC8] text-[#694A22]">
                  {reply.badge}
                </span>
                <button
                  type="button"
                  className="text-xs text-[#8C6D41] hover:text-[#5A3F1A] underline font-medium cursor-pointer"
                  onClick={() =>
                    onUpdateApplicantEligibility(
                      reply.isPartnerCorrection,
                      reply.correctionField,
                      true
                    )
                  }
                >
                  Change answer to &quot;Yes&quot;
                </button>
              </div>

              <h4 className="font-serif text-base font-bold text-[#27173B] mb-1.5">
                {reply.title}
              </h4>
              <p className="text-xs text-[#4F415D] leading-relaxed mb-2.5">
                {reply.text}
              </p>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E9E0D4] text-xs text-[#635570] leading-relaxed mb-3">
                <strong className="text-[#8C6D41]">Recommendation: </strong>
                {reply.recommendation}
              </div>

              {reply.actionLabel && reply.onAction && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={reply.onAction}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#21152F] hover:bg-[#322046] text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <span>{reply.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Eligible Reassurance Badge */}
      {!isFormIncomplete && activeReplies.length === 0 && (
        <div className="flex items-center gap-3 p-4 bg-[#EDF8F4] border border-[#BCE4D7] rounded-xl text-xs sm:text-sm text-[#1B6D53] mt-6 animate-in fade-in duration-200">
          <span className="w-5 h-5 rounded-full bg-[#248B69] text-white flex items-center justify-center text-xs font-bold shrink-0">
            ✓
          </span>
          <div>
            <strong className="font-bold">Standard ADJD Scope Confirmed: </strong>
            Non-Muslim expatriate testators aged 21+ with assets in the UAE. You are eligible for court-notarized Will preparation.
          </div>
        </div>
      )}

      {/* Continue CTA */}
      <div id="pre-step1-continue-btn" className="flex items-center justify-end mt-8">
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
