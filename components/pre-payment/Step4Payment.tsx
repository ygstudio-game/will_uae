"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { PrePaymentJourneyState } from "@/types/pre-payment";

interface Step4PaymentProps {
  state: PrePaymentJourneyState;
  onToggleTerms: (accepted: boolean) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onOpenSample: () => void;
  onEditPackage: () => void;
  onEditContact: () => void;
  onPay: () => void;
  loading: boolean;
  error: string | null;
}

export function Step4Payment({
  state,
  onToggleTerms,
  onOpenTerms,
  onOpenPrivacy,
  onOpenSample,
  onEditPackage,
  onEditContact,
  onPay,
  loading,
  error,
}: Step4PaymentProps) {
  const isCouples = state.packageType === "COUPLES";
  const feeAed = isCouples ? 1799 : 999;
  const courtFeeAed = isCouples ? 1900 : 950;

  return (
    <div className="pre-step-4">
      {/* Page Header */}
      <div className="pagehead saas-checkout-head">
        <div className="eyebrow text-[#5730A1] text-xs font-bold mb-1 tracking-wider">
          STEP 4 OF 4 · PAYMENT
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2c184b]">
          Complete your checkout
        </h1>
        <p className="sub text-[#625975] text-sm mt-1">
          Your Will preparation with Online Wills Advisor.
        </p>
      </div>

      {/* Two-Column SaaS Checkout Layout */}
      <div className="saas-checkout mt-6">
        {/* Left Column: Rich Satin Order Summary */}
        <section className="saas-order" aria-label="Order summary">
          <div className="saas-order-top">
            <span className="saas-label">YOUR ORDER</span>
            <button type="button" onClick={onEditPackage}>
              Change
            </button>
          </div>

          <div className="saas-product">
            <span className="saas-product-icon" aria-hidden="true">
              <svg viewBox="0 0 40 44" fill="none" className="w-6 h-6 text-white">
                <path
                  d="M9 4h16l8 8v28H9zM25 4v9h8M15 21h12M15 27h12M15 33h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <div>
              <h2>{isCouples ? "Wills for Couples" : "Individual Will"}</h2>
              <p>{isCouples ? "Two separate Wills" : "One Will"} · English & Arabic</p>
            </div>
          </div>

          <div className="saas-order-name">
            Prepared for <strong>{state.fullName}{isCouples ? " and your partner" : ""}</strong>
          </div>

          <div className="saas-price-block">
            <span>Payable now to OWA</span>
            <div className="saas-price">
              <span>AED</span>
              <strong>{feeAed.toLocaleString()}</strong>
            </div>
            <p className="text-xs text-[#e5d7f2] mt-1">OWA service fee</p>
          </div>

          <div className="saas-inclusions">
            <h3>Your package includes</h3>
            <ul>
              <li>
                <Check className="w-3.5 h-3.5 text-[#d1f5dc] flex-shrink-0" />
                <span>Six-section questionnaire with auto-save</span>
              </li>
              <li>
                <Check className="w-3.5 h-3.5 text-[#d1f5dc] flex-shrink-0" />
                <span>English and Arabic Will draft</span>
              </li>
              <li>
                <Check className="w-3.5 h-3.5 text-[#d1f5dc] flex-shrink-0" />
                <span>Document assistance and in-app support</span>
              </li>
              <li>
                <Check className="w-3.5 h-3.5 text-[#d1f5dc] flex-shrink-0" />
                <span>Application review and ADJD submission</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="saas-sample"
            onClick={onOpenSample}
          >
            View a sample Will →
          </button>

          <p className="saas-court">
            ADJD court fee: <strong>AED {courtFeeAed.toLocaleString()} {isCouples ? "for two Wills" : "per Will"}</strong>, paid directly to ADJD later (not charged by OWA).
          </p>
        </section>

        {/* Right Column: Customer Details & Card Payment Simulation */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Account Info Pill */}
            <div className="p-4 bg-[#F8F5FA] border border-[#E1DDEB] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#5730A1] font-bold uppercase tracking-wider block">
                  RECEIPT & APPLICATION ACCOUNT
                </span>
                <span className="text-sm font-semibold text-[#241B35] block mt-0.5">
                  {state.email}
                </span>
                <span className="text-xs text-[#625975] block">
                  {state.phoneNumber}
                </span>
              </div>
              <button
                type="button"
                className="text-xs text-[#5730A1] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                onClick={onEditContact}
              >
                Edit
              </button>
            </div>

            {/* Payment Method Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#241B35] uppercase tracking-wider">
                  Payment Method
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#625975]">
                  <Lock className="w-3 h-3 text-[#005E53]" />
                  <span>256-bit Encrypted SSL</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="field">
                  <label htmlFor="card-name" className="text-xs font-semibold text-[#241B35] block mb-1">
                    Cardholder name
                  </label>
                  <input
                    id="card-name"
                    type="text"
                    defaultValue={state.fullName}
                    className="w-full p-2.5 border border-[#DCD5E8] rounded-lg text-sm"
                  />
                </div>

                <div className="field">
                  <label htmlFor="card-num" className="text-xs font-semibold text-[#241B35] block mb-1">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      id="card-num"
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      className="w-full p-2.5 pr-10 border border-[#DCD5E8] rounded-lg text-sm font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-[#8B6DB4] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="field">
                    <label htmlFor="card-exp" className="text-xs font-semibold text-[#241B35] block mb-1">
                      Expiry date
                    </label>
                    <input
                      id="card-exp"
                      type="text"
                      placeholder="MM / YY"
                      maxLength={5}
                      className="w-full p-2.5 border border-[#DCD5E8] rounded-lg text-sm font-mono text-center"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="card-cvc" className="text-xs font-semibold text-[#241B35] block mb-1">
                      Security code
                    </label>
                    <input
                      id="card-cvc"
                      type="text"
                      placeholder="CVC"
                      maxLength={4}
                      className="w-full p-2.5 border border-[#DCD5E8] rounded-lg text-sm font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Privacy Agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#241B35] select-none">
                <input
                  type="checkbox"
                  checked={state.termsAccepted}
                  onChange={(e) => onToggleTerms(e.target.checked)}
                  className="mt-0.5 accent-[#5730A1] rounded"
                />
                <span className="leading-relaxed">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-[#5730A1] hover:underline font-semibold bg-transparent border-0 p-0 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenTerms();
                    }}
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-[#5730A1] hover:underline font-semibold bg-transparent border-0 p-0 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenPrivacy();
                    }}
                  >
                    Privacy Policy
                  </button>
                  . I understand the ADJD court registration fee will be paid directly to the court later.
                </span>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#FFF2F1] border border-[#EDC8C5] rounded text-xs text-[#9F3431]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Pay Button Action */}
          <div className="mt-8 pt-4 border-t border-[#E1DDEB]">
            <button
              type="button"
              className="saas-pay-cta w-full flex items-center justify-center gap-2"
              onClick={onPay}
              disabled={loading || !state.termsAccepted}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay AED {feeAed.toLocaleString()} now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-[#625975] mt-2">
              Simulated sandbox checkout for prototype testing. No real card charge will occur.
            </p>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div>
        <button
          type="button"
          className="btn"
          onClick={onEditContact}
        >
          <ArrowLeft className="w-4 h-4 mr-1 inline" />
          <span>Back to review</span>
        </button>
      </div>
    </div>
  );
}
