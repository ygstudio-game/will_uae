"use client";

import React, { useState } from "react";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  Languages,
  LifeBuoy,
  Scale,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import {
  PrePaymentJourneyState,
  PrePaymentInclusionTab,
} from "@/types/pre-payment";

interface Step3ReviewCheckoutProps {
  state: PrePaymentJourneyState;
  onUpdateEmail: (email: string) => void;
  onUpdatePhone: (phone: string) => void;
  onVerifyEmail: (verified: boolean) => void;
  onUpdateInclusionTab: (tab: PrePaymentInclusionTab) => void;
  onEditDetails: () => void;
  onEditPackage: () => void;
  onOpenSample: () => void;
  onOpenHelp: () => void;
  onNext: () => void;
}

export function Step3ReviewCheckout({
  state,
  onUpdateEmail,
  onUpdatePhone,
  onVerifyEmail,
  onUpdateInclusionTab,
  onEditDetails,
  onEditPackage,
  onOpenSample,
  onOpenHelp,
  onNext,
}: Step3ReviewCheckoutProps) {
  const isCouples = state.packageType === "COUPLES";
  const feeAed = isCouples ? 1799 : 999;
  const courtFeeAed = isCouples ? 1900 : 950;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleVerifyOtp = () => {
    if (otpInput.trim() === "123456") {
      onVerifyEmail(true);
      setOtpError(null);
    } else {
      setOtpError("Incorrect test code. For prototype mode, use 123456.");
    }
  };

  const handleAutoFillAndVerify = () => {
    setOtpInput("123456");
    onVerifyEmail(true);
    setOtpError(null);
  };

  const handleProceedClick = () => {
    if (!state.email.trim() || !state.email.includes("@")) {
      setErrorMsg("Please enter a valid email address for your receipt and login.");
      return;
    }
    if (!state.phoneNumber.trim() || state.phoneNumber.trim().length < 7) {
      setErrorMsg("Please enter a valid phone number with country code (e.g. +971 50 000 0001).");
      return;
    }

    // Auto-verify email if user proceeds and hasn't verified yet
    if (!state.isEmailVerified) {
      onVerifyEmail(true);
    }

    setErrorMsg(null);
    onNext();
  };

  return (
    <div className="pre-step-3">
      {/* Page Header */}
      <div className="pagehead cro-checkout-head">
        <div className="eyebrow text-[#5730A1] text-xs font-bold mb-1 tracking-wider">
          STEP 3 OF 4 · REVIEW
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2c184b]">
          Review {isCouples ? "your two Wills." : "your Will."}
        </h1>
        <p className="sub text-[#625975] text-sm mt-1">
          Check your package and contact details. You’ll pay only the OWA service fee at checkout.
        </p>

        <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 text-xs text-[#005e53] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#005e53]" />
            No documents needed at checkout
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#005e53]" />
            Save and return to your questionnaire
          </span>
        </div>
      </div>

      <div className="cro-checkout mt-6">
        {/* Left Column: Review Inclusions & Contacts */}
        <div className="space-y-6">
          {/* Selected Package Header Card */}
          <section className="card cro-included">
            <div className="cardbody p-6">
              <div className="cro-application">
                <div>
                  <span className="eyebrow text-[10px] text-[#5730A1] font-bold tracking-wider uppercase block">
                    {isCouples ? "TWO SEPARATE WILLS" : "ONE INDIVIDUAL WILL"}
                  </span>
                  <h2>{isCouples ? "Wills for Couples" : "Individual Will"}</h2>
                  <p className="small text-xs text-[#625975]">
                    Prepared for {state.fullName || "you"}{isCouples ? " and your partner" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="link text-xs text-[#5730A1] hover:underline font-semibold bg-transparent border-0 cursor-pointer p-0"
                  onClick={onEditDetails}
                >
                  Edit details
                </button>
              </div>

              <hr className="border-t border-[#E1DDEB] my-5" />

              <h3 className="font-serif text-base font-bold text-[#241B35] mb-2">
                What is included:
              </h3>

              {/* Inclusion Explorer Tabs */}
              <div className="cro-benefit-tabs">
                <button
                  type="button"
                  className={state.activeInclusionTab === "guided" ? "active" : ""}
                  onClick={() => onUpdateInclusionTab("guided")}
                >
                  <span className="cro-tab-number">01</span>
                  <span>Guided questions</span>
                </button>
                <button
                  type="button"
                  className={state.activeInclusionTab === "bilingual" ? "active" : ""}
                  onClick={() => onUpdateInclusionTab("bilingual")}
                >
                  <span className="cro-tab-number">02</span>
                  <span>Bilingual draft</span>
                </button>
                <button
                  type="button"
                  className={state.activeInclusionTab === "support" ? "active" : ""}
                  onClick={() => onUpdateInclusionTab("support")}
                >
                  <span className="cro-tab-number">03</span>
                  <span>In-app support</span>
                </button>
                <button
                  type="button"
                  className={state.activeInclusionTab === "court" ? "active" : ""}
                  onClick={() => onUpdateInclusionTab("court")}
                >
                  <span className="cro-tab-number">04</span>
                  <span>Court filing</span>
                </button>
              </div>

              {/* Dynamic Tab Body */}
              <div className="cro-benefit-stage">
                {state.activeInclusionTab === "guided" && (
                  <div>
                    <strong className="block text-[#5730A1] uppercase tracking-wider text-[11px] font-bold mb-1">
                      Six-Section Questionnaire
                    </strong>
                    Structured questionnaire with auto-save. Guides you through personal
                    details, children guardianship, executors, and primary and substitute beneficiaries.
                  </div>
                )}
                {state.activeInclusionTab === "bilingual" && (
                  <div>
                    <strong className="block text-[#5730A1] uppercase tracking-wider text-[11px] font-bold mb-1">
                      Certified Side-by-Side Draft
                    </strong>
                    Statutory bilingual draft matching the official ADJD court form (English on left,
                    Arabic on right). Names are phonetically transliterated for court compliance.
                  </div>
                )}
                {state.activeInclusionTab === "support" && (
                  <div>
                    <strong className="block text-[#5730A1] uppercase tracking-wider text-[11px] font-bold mb-1">
                      In-App Support & OCR
                    </strong>
                    Assistance with document uploads (Emirates ID and passport scans) and built-in
                    support ticket conversation directly with legal specialists.
                  </div>
                )}
                {state.activeInclusionTab === "court" && (
                  <div>
                    <strong className="block text-[#5730A1] uppercase tracking-wider text-[11px] font-bold mb-1">
                      Application Review & Submission
                    </strong>
                    Complete application verification by the OWA team before submission to the ADJD
                    Non-Muslim Wills Registry. ADJD handles the final registration decision.
                  </div>
                )}
              </div>

              <button
                type="button"
                className="draft-preview-link mt-2"
                onClick={onOpenSample}
              >
                <span>See a sample bilingual Will</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* Contact Details Card */}
          <section id="checkout-contact" className="card cro-contact">
            <div className="p-6 border-b border-[#E1DDEB]">
              <span className="eyebrow text-[10px] text-[#5730A1] font-bold tracking-wider uppercase block">
                YOUR CONTACT DETAILS
              </span>
              <h3 className="text-base font-bold text-[#241B35] mt-1">
                Where should we send your receipt?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-xs text-[#625975] mb-4">
                Enter your email and phone number for your receipt and application. You can verify your email when you return to the paid questionnaire.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field">
                  <label htmlFor="checkout-email" className="font-semibold text-xs text-[#241B35] block mb-1">
                    Email address *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={(e) => {
                      onUpdateEmail(e.target.value);
                      if (state.isEmailVerified) onVerifyEmail(false);
                    }}
                    className="w-full p-2.5 border border-[#DCD5E8] rounded-lg text-sm"
                  />
                </div>
                <div className="field">
                  <label htmlFor="checkout-phone" className="font-semibold text-xs text-[#241B35] block mb-1">
                    Phone number *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+971 50 000 0001"
                    value={state.phoneNumber}
                    onChange={(e) => onUpdatePhone(e.target.value)}
                    className="w-full p-2.5 border border-[#DCD5E8] rounded-lg text-sm"
                  />
                  <span className="hint text-[11px] text-[#625975] mt-1 block">
                    Include your country code.
                  </span>
                </div>
              </div>

              {/* Email OTP Verification Box */}
              {state.email.trim().includes("@") && (
                <div className="mt-4">
                  {state.isEmailVerified ? (
                    <div className="flex items-center gap-2 p-3 bg-[#EDF5F0] border border-[#BCD4C7] rounded-md text-xs text-[#005E53] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#005E53] flex-shrink-0" />
                      <span>Email verified for this application (Test session active).</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F8F5FA] border border-[#E1DDEB] rounded-lg text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-[#241B35] flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#5730A1]" />
                          Email verification
                        </span>
                        <span className="px-2 py-0.5 bg-[#EEE7FB] border border-[#8B6DB4] text-[#5730A1] font-mono text-[11px] font-bold rounded">
                          PROTOTYPE OTP: 123456
                        </span>
                      </div>
                      <p className="text-[#625975] mb-3 leading-relaxed">
                        Testing mode: enter <strong>123456</strong> to verify your email address.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpInput}
                          onChange={(e) => {
                            setOtpInput(e.target.value);
                            setOtpError(null);
                          }}
                          className="w-32 tracking-widest text-center font-mono font-bold text-sm bg-white border border-[#DCD5E8] rounded px-3 py-1.5 text-[#241B35]"
                        />
                        <button
                          type="button"
                          className="btn primary text-xs py-1.5 px-3 min-h-[36px]"
                          onClick={handleVerifyOtp}
                        >
                          Verify code
                        </button>
                        <button
                          type="button"
                          className="btn text-xs py-1.5 px-3 min-h-[36px]"
                          onClick={handleAutoFillAndVerify}
                        >
                          Auto-fill 123456
                        </button>
                      </div>
                      {otpError && (
                        <div className="text-xs text-[#9F3431] mt-2 font-medium">
                          {otpError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-[#FFF2F1] border border-[#EDC8C5] rounded text-xs text-[#9F3431] mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Order Summary Card */}
        <aside className="cro-order-wrap">
          <div className="cro-order">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1DDEB]">
              <span className="eyebrow text-[11px] text-[#5730A1] font-bold uppercase tracking-wider">
                YOUR ORDER
              </span>
              <button
                type="button"
                className="text-xs text-[#5730A1] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                onClick={onEditPackage}
              >
                Change
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs text-[#625975] block">
                {isCouples ? "Wills for Couples" : "Individual Will"}
              </span>
              <div className="premium-price flex items-baseline gap-2 my-2">
                <span className="premium-price__currency text-base font-semibold text-[#625076] leading-none">
                  AED
                </span>
                <strong className="text-5xl font-serif font-normal text-[#432571] leading-none [font-variant-numeric:lining-nums_tabular-nums]">
                  {feeAed.toLocaleString()}
                </strong>
              </div>
              <p className="text-xs text-[#625975]">
                OWA service fee · covers {isCouples ? "two Wills" : "one Will"} in English and Arabic
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E1DDEB]">
              <button
                type="button"
                className="btn primary w-full text-sm font-semibold flex items-center justify-center gap-2"
                onClick={handleProceedClick}
              >
                <span>Continue to payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11.5px] leading-relaxed text-[#625975] mt-4">
                ADJD court fee: <strong>AED {courtFeeAed.toLocaleString()} {isCouples ? "for two Wills" : "per Will"}</strong>, paid directly to ADJD later (not charged by OWA).
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Back button */}
      <div className="mt-8">
        <button
          type="button"
          className="btn"
          onClick={onEditDetails}
        >
          <ArrowLeft className="w-4 h-4 mr-1 inline" />
          <span>Back to details</span>
        </button>
      </div>
    </div>
  );
}
