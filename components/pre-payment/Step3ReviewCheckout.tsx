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
      <div className="pre-pagehead cro-checkout-head">
        <span className="pre-eyebrow">STEP 3 OF 4 · REVIEW</span>
        <h1>Review {isCouples ? "your two Wills." : "your Will."}</h1>
        <p className="sub">
          Check your package and contact details. You'll pay only the OWA service fee at checkout.
        </p>

        <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 text-xs text-[#0B1528] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#1E6B4A]" />
            No documents needed at checkout
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#1E6B4A]" />
            Save and return to your questionnaire anytime
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="cro-checkout mt-6">
        {/* Included Card */}
        <section className="pre-card cro-included">
          <div className="pre-cardbody">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="pre-eyebrow text-[10px]">
                  {isCouples ? "TWO SEPARATE WILLS" : "ONE INDIVIDUAL WILL"}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0B1528] mt-1">
                  {isCouples ? "Wills for Couples" : "Individual Will"}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Prepared for <strong>{state.fullName || "you"}</strong>
                  {isCouples ? " and your partner" : ""}
                </p>
              </div>
              <button
                type="button"
                className="pre-link text-xs text-[#A37E44] hover:underline"
                onClick={onEditDetails}
              >
                Edit details
              </button>
            </div>

            <hr className="border-t border-[#E5E0D8] my-5" />

            <h3 className="text-sm font-bold text-[#0B1528] mb-3">What is included:</h3>

            {/* Interactive Inclusion Explorer Tabs */}
            <div className="border border-[#E5E0D8] rounded-lg p-1 bg-[#FAF7F2] flex flex-wrap gap-1 mb-4">
              <button
                type="button"
                onClick={() => onUpdateInclusionTab("questionnaire")}
                className={`flex-1 py-1.5 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  state.activeInclusionTab === "questionnaire"
                    ? "bg-white text-[#0B1528] shadow-sm"
                    : "text-[#64748B] hover:text-[#0B1528]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Questionnaire</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateInclusionTab("bilingual")}
                className={`flex-1 py-1.5 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  state.activeInclusionTab === "bilingual"
                    ? "bg-white text-[#0B1528] shadow-sm"
                    : "text-[#64748B] hover:text-[#0B1528]"
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Bilingual Draft</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateInclusionTab("support")}
                className={`flex-1 py-1.5 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  state.activeInclusionTab === "support"
                    ? "bg-white text-[#0B1528] shadow-sm"
                    : "text-[#64748B] hover:text-[#0B1528]"
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Support</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateInclusionTab("court")}
                className={`flex-1 py-1.5 px-2.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  state.activeInclusionTab === "court"
                    ? "bg-white text-[#0B1528] shadow-sm"
                    : "text-[#64748B] hover:text-[#0B1528]"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Court Filing</span>
              </button>
            </div>

            {/* Tab Descriptions */}
            <div className="p-4 bg-[#FBF9F5] border border-[#E5E0D8] rounded-lg text-xs leading-relaxed text-[#0B1528]">
              {state.activeInclusionTab === "questionnaire" && (
                <div>
                  <strong className="block text-[#A37E44] uppercase tracking-wider text-[10px] mb-1">
                    Guided Questionnaire
                  </strong>
                  Six-section structured questionnaire with auto-save. Guides you through personal
                  details, children guardianship, executors, and primary and substitute beneficiaries.
                </div>
              )}
              {state.activeInclusionTab === "bilingual" && (
                <div>
                  <strong className="block text-[#A37E44] uppercase tracking-wider text-[10px] mb-1">
                    Certified Side-by-Side Draft
                  </strong>
                  Statutory bilingual draft matching the official ADJD court form (English on left,
                  Arabic on right). Names are phonetically transliterated for court compliance.
                </div>
              )}
              {state.activeInclusionTab === "support" && (
                <div>
                  <strong className="block text-[#A37E44] uppercase tracking-wider text-[10px] mb-1">
                    In-App Support & OCR
                  </strong>
                  Assistance with document uploads (Emirates ID and passport scans) and built-in
                  support ticket conversation directly with legal specialists.
                </div>
              )}
              {state.activeInclusionTab === "court" && (
                <div>
                  <strong className="block text-[#A37E44] uppercase tracking-wider text-[10px] mb-1">
                    Application Review & Submission
                  </strong>
                  Complete application verification by the OWA team before submission to the ADJD
                  Non-Muslim Wills Registry. ADJD handles the final registration decision.
                </div>
              )}
            </div>

            <button
              type="button"
              className="pre-link text-xs text-[#A37E44] hover:underline mt-4 inline-flex items-center gap-1 font-semibold"
              onClick={onOpenSample}
            >
              <span>See a sample bilingual Will</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Contact Details Card */}
        <section id="checkout-contact" className="pre-card cro-contact">
          <div className="pre-cardhead">
            <div>
              <span className="pre-eyebrow text-[10px]">YOUR CONTACT DETAILS</span>
              <h3 className="text-base font-bold text-[#0B1528] mt-1">
                Where should we send your receipt?
              </h3>
            </div>
          </div>
          <div className="pre-cardbody">
            <p className="text-xs text-[#64748B] mb-4">
              Enter your email and phone number for your receipt and account sign-in. You can save
              and return to your application at any time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="pre-field">
                <label htmlFor="checkout-email">Email address *</label>
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
                />
              </div>
              <div className="pre-field">
                <label htmlFor="checkout-phone">Phone number *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+971 50 000 0001"
                  value={state.phoneNumber}
                  onChange={(e) => onUpdatePhone(e.target.value)}
                />
                <span className="hint">Include your country code.</span>
              </div>
            </div>

            {/* Email OTP Verification Box */}
            {state.email.trim().includes("@") && (
              <div className="mt-4">
                {state.isEmailVerified ? (
                  <div className="flex items-center gap-2 p-3 bg-[#EDF5F0] border border-[#BCD4C7] rounded-md text-xs text-[#1E6B4A] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#1E6B4A] flex-shrink-0" />
                    <span>Email verified for this application (Test session active).</span>
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-lg text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-[#0B1528] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#A37E44]" />
                        Email verification
                      </span>
                      <span className="px-2 py-0.5 bg-[#F4EFEA] border border-[#C5A880] text-[#A37E44] font-mono text-[11px] font-bold rounded">
                        PROTOTYPE OTP: 123456
                      </span>
                    </div>
                    <p className="text-[#64748B] mb-3 leading-relaxed">
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
                        className="w-32 tracking-widest text-center font-mono font-bold text-sm bg-white border border-[#E5E0D8] rounded px-3 py-1.5 text-[#0B1528]"
                      />
                      <button
                        type="button"
                        className="pre-btn primary text-xs py-1.5 px-3 min-h-[36px]"
                        onClick={handleVerifyOtp}
                      >
                        Verify code
                      </button>
                      <button
                        type="button"
                        className="pre-btn text-xs py-1.5 px-3 min-h-[36px]"
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

        {/* Sticky Order Aside Card */}
        <aside className="cro-order-wrap">
          <div className="pre-card cro-order">
            <div className="pre-cardbody">
              <div className="flex items-center justify-between">
                <span className="pre-eyebrow text-[10px]">PAYABLE TO OWA TODAY</span>
                <button
                  type="button"
                  className="pre-link text-xs text-[#A37E44] hover:underline"
                  onClick={onEditPackage}
                >
                  Change package
                </button>
              </div>

              <div className="pre-price">
                AED {feeAed.toLocaleString()}
                <span>{isCouples ? "Wills for Couples · two Wills" : "Individual Will · one Will"}</span>
              </div>

              <button
                type="button"
                className="pre-btn primary w-full justify-center mt-4"
                onClick={handleProceedClick}
              >
                <span>Continue to payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] border-b border-[#E5E0D8] my-4 pb-3">
                <span>1 Review</span>
                <span>2 Payment</span>
                <span>3 Questionnaire</span>
              </div>

              <p className="text-[11px] text-[#64748B] text-center leading-relaxed">
                Test checkout mode available. No real payment is taken during prototyping.
              </p>

              <div className="pre-court-line mt-4">
                ADJD court fee: <strong>AED {courtFeeAed.toLocaleString()}{isCouples ? " for two Wills" : " per Will"}</strong>,
                paid directly to ADJD later (not charged by OWA).
              </div>
            </div>
          </div>
        </aside>

        {/* FAQ Accordions Section */}
        <section className="cro-questions">
          <h3 className="text-base font-bold text-[#0B1528] mb-3">Before you continue</h3>
          <div className="space-y-3">
            <details className="p-4 bg-white border border-[#E5E0D8] rounded-lg text-xs">
              <summary className="font-semibold text-[#0B1528] cursor-pointer">
                Do I need my documents now?
              </summary>
              <p className="mt-2 text-[#64748B] leading-relaxed">
                No uploads are needed at checkout. You will upload identity documents (passport and
                Emirates ID) in the questionnaire after payment. You can save your progress and
                return at any time.
              </p>
            </details>
            <details className="p-4 bg-white border border-[#E5E0D8] rounded-lg text-xs">
              <summary className="font-semibold text-[#0B1528] cursor-pointer">
                Can I finish the questionnaire later?
              </summary>
              <p className="mt-2 text-[#64748B] leading-relaxed">
                Yes. Your answers are auto-saved. You can log in using your email address and resume
                from where you left off.
              </p>
            </details>
            <details className="p-4 bg-white border border-[#E5E0D8] rounded-lg text-xs">
              <summary className="font-semibold text-[#0B1528] cursor-pointer">
                What happens after I pay?
              </summary>
              <p className="mt-2 text-[#64748B] leading-relaxed">
                Your questionnaire and in-app support become active immediately. Complete your details
                to generate your bilingual ADJD court draft. Once complete, OWA reviews the
                application prior to court submission.
              </p>
            </details>
          </div>

          <button
            type="button"
            className="pre-link text-xs text-[#A37E44] hover:underline mt-4 inline-flex items-center gap-1 font-semibold"
            onClick={onOpenHelp}
          >
            <span>Still have a question? Get help</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>

      {/* Back Action Bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E0D8]">
        <button
          type="button"
          className="pre-link text-xs text-[#64748B] hover:text-[#0B1528]"
          onClick={onEditDetails}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to your details</span>
        </button>
      </div>
    </div>
  );
}
