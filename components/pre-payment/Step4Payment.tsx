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
  FileText,
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
      <div className="pre-pagehead">
        <span className="pre-eyebrow">STEP 4 OF 4 · PAYMENT</span>
        <h1>Complete your checkout</h1>
        <p className="sub">
          Review your order details and confirm payment to start your Will preparation.
        </p>
      </div>

      {/* Two-Column Checkout Layout */}
      <div className="saas-checkout mt-6">
        {/* Left Column: Order Summary */}
        <section className="pre-card p-6 sm:p-8" aria-label="Order summary">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
            <span className="pre-eyebrow text-[10px]">YOUR ORDER</span>
            <button
              type="button"
              className="pre-link text-xs text-[#A37E44] hover:underline"
              onClick={onEditPackage}
            >
              Change
            </button>
          </div>

          <div className="py-5">
            <h2 className="text-xl font-serif font-bold text-[#0B1528]">
              {isCouples ? "Wills for Couples" : "Individual Will"}
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              {isCouples ? "Two separate or mirror Wills" : "One Will"} · English & Arabic
            </p>
            <div className="text-xs text-[#0B1528] mt-3 font-medium bg-[#FBF9F5] p-3 rounded border border-[#E5E0D8]">
              Prepared for: <strong>{state.fullName}</strong>
              {isCouples ? " and your partner" : ""}
            </div>
          </div>

          <div className="py-4 border-t border-[#E5E0D8]">
            <span className="text-xs text-[#64748B] block">Payable now to OWA</span>
            <div className="pre-price my-2">
              AED {feeAed.toLocaleString()}
              <span className="text-xs text-[#64748B]">OWA service fee</span>
            </div>
          </div>

          <div className="py-4 border-t border-[#E5E0D8]">
            <h3 className="text-xs font-bold text-[#0B1528] uppercase tracking-wider mb-3">
              Your package includes
            </h3>
            <ul className="space-y-2 text-xs text-[#0B1528]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E6B4A] flex-shrink-0" />
                <span>Six-section questionnaire with real-time auto-save</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E6B4A] flex-shrink-0" />
                <span>Certified English and Arabic court draft</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E6B4A] flex-shrink-0" />
                <span>Document assistance and in-app support ticketing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#1E6B4A] flex-shrink-0" />
                <span>Application legal review and direct ADJD court submission</span>
              </li>
            </ul>

            <button
              type="button"
              className="pre-link text-xs text-[#A37E44] hover:underline mt-4 inline-flex items-center gap-1 font-semibold"
              onClick={onOpenSample}
            >
              <span>View a sample bilingual Will</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pre-court-line mt-4">
            ADJD court fee: <strong>AED {courtFeeAed.toLocaleString()}{isCouples ? " for two Wills" : " per Will"}</strong>,
            paid directly to ADJD later (not charged by OWA).
          </div>
        </section>

        {/* Right Column: Payment Details */}
        <section className="pre-card p-6 sm:p-8" aria-label="Payment details">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8]">
            <h2 className="text-base font-bold text-[#0B1528]">Payment Details</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#1E6B4A] bg-[#EDF5F0] px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              SECURE CHECKOUT
            </span>
          </div>

          {/* Contact Verification Box */}
          <div className="my-5 p-3.5 bg-[#FBF9F5] border border-[#E5E0D8] rounded-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#64748B] font-medium">Your contact details:</span>
              <button
                type="button"
                className="pre-link text-xs text-[#A37E44] hover:underline"
                onClick={onEditContact}
              >
                Edit
              </button>
            </div>
            <div className="text-xs font-semibold text-[#0B1528]">{state.email}</div>
            <div className="text-xs text-[#64748B] mt-0.5">{state.phoneNumber}</div>
          </div>

          {/* Payment Method Option */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-[#0B1528] mb-2">Payment method</div>
            <div className="flex items-center gap-3 p-3.5 border-2 border-[#0B1528] rounded-md bg-[#FFFDFB]">
              <div className="p-2 bg-[#FAF7F2] rounded border border-[#E5E0D8]">
                <CreditCard className="w-5 h-5 text-[#0B1528]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#0B1528]">Card Payment</div>
                <div className="text-[11px] text-[#64748B]">Visa, Mastercard, or Apple Pay</div>
              </div>
              <span className="text-xs font-semibold text-[#1E6B4A]">Active</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-2 leading-relaxed">
              Instant verification mode. Submitting establishes your official application record in
              our database.
            </p>
          </div>

          {/* Total Payable */}
          <div className="py-4 border-t border-b border-[#E5E0D8] my-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#0B1528]">Payable now</span>
            <span className="text-xl font-bold font-serif text-[#0B1528]">
              AED {feeAed.toLocaleString()}
            </span>
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#0B1528]">
              <input
                type="checkbox"
                checked={state.termsAccepted}
                onChange={(e) => onToggleTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#E5E0D8] text-[#0B1528] focus:ring-[#0B1528]"
              />
              <span className="leading-relaxed">
                I agree to the OWA Service Terms and confirm my understanding that the ADJD court
                registration fee is paid separately.
              </span>
            </label>

            <div className="flex items-center gap-2 text-xs text-[#A37E44]">
              <button
                type="button"
                className="hover:underline font-semibold"
                onClick={onOpenTerms}
              >
                Service Terms
              </button>
              <span>·</span>
              <button
                type="button"
                className="hover:underline font-semibold"
                onClick={onOpenPrivacy}
              >
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#FFF2F1] border border-[#EDC8C5] rounded text-xs text-[#9F3431] mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="button"
            className="pre-btn primary w-full justify-center py-3 min-h-[48px] text-sm"
            disabled={!state.termsAccepted || loading}
            onClick={onPay}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing payment & setting up application...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span>Pay AED {feeAed.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

          <p className="text-[11px] text-[#64748B] text-center mt-3">
            Encrypted 256-bit SSL transaction. Official receipt generated upon completion.
          </p>

          <div className="mt-5 p-3.5 bg-[#FAF7F2] border border-[#E5E0D8] rounded-md text-xs text-[#0B1528] flex items-start gap-2.5">
            <span className="text-[#A37E44] font-bold text-sm">→</span>
            <div>
              <strong>Next: your guided questionnaire</strong>
              <p className="text-[#64748B] mt-0.5 leading-relaxed">
                Your application will immediately open on your dashboard. Complete the sections to
                generate your bilingual ADJD draft.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Back Link */}
      <div className="mt-8 pt-6 border-t border-[#E5E0D8]">
        <button
          type="button"
          className="pre-link text-xs text-[#64748B] hover:text-[#0B1528]"
          onClick={onEditContact}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to review details</span>
        </button>
      </div>
    </div>
  );
}
