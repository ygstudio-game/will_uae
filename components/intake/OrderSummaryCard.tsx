"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Lock } from "lucide-react";
import { QualificationData } from "./QualificationForm";

interface OrderSummaryCardProps {
  qualifications: QualificationData;
  onBack: () => void;
  onSuccess: (data: any) => void;
}

export function OrderSummaryCard({ qualifications, onBack, onSuccess }: OrderSummaryCardProps) {
  const isCouples = qualifications.packageType === "COUPLES";
  const initialFee = isCouples ? 1799 : 999;
  const courtFee = isCouples ? 1900 : 950;
  const totalCost = initialFee + courtFee;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the terms of service to proceed.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/initial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: qualifications.fullName,
          email,
          phoneNumber: phone,
          packageType: qualifications.packageType,
          qualifications: {
            testatorAge21: qualifications.testatorAge21,
            nonUaeNational: qualifications.nonUaeNational,
            uaeAssets: qualifications.uaeAssets,
            married: qualifications.married,
            childrenUnder18: qualifications.childrenUnder18,
            partnerAge21: qualifications.partnerAge21,
            partnerNonUae: qualifications.partnerNonUae,
            partnerAssets: qualifications.partnerAssets,
            partnerMarried: qualifications.partnerMarried,
            partnerChildrenUnder18: qualifications.partnerChildrenUnder18,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Payment processing failed.");
      }

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E5E0D8] shadow-sm max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-all font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Intake Form</span>
        </button>
        <span className="text-[11px] font-mono font-bold text-[#A37E44] bg-[#FAF7F2] px-2.5 py-1 rounded">
          Milestone 1 of 2
        </span>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528]">
          Order Summary & Checkout
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your selected package and two-stage pricing schedule before initial payment.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Package & Pricing Card */}
      <div className="rounded-xl border border-[#E5E0D8] overflow-hidden bg-[#FAF7F2]/50">
        <div className="p-5 border-b border-[#E5E0D8] bg-[#FAF7F2]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-[#A37E44] tracking-wider">
                Selected Package
              </span>
              <h3 className="text-base font-bold text-[#0B1528] mt-0.5">
                {isCouples ? "Wills for Couples (2 Wills)" : "Individual Will (1 Will)"}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Payable Now</span>
              <div className="text-lg font-bold text-[#0B1528] font-mono">
                AED {initialFee.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="p-5 space-y-3 text-xs">
          <div className="flex justify-between items-center text-gray-700">
            <span>Stage 1: OWA Initial Preparation Fee (Pay Now)</span>
            <span className="font-semibold font-mono">AED {initialFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>Stage 2: ADJD Court Registration Fee (Pay After Review)</span>
            <span className="font-semibold font-mono">AED {courtFee.toLocaleString()}</span>
          </div>
          <div className="pt-3 border-t border-[#E5E0D8] flex justify-between items-center text-sm font-bold text-[#0B1528]">
            <span>Total Disclosed Investment (No VAT)</span>
            <span className="font-mono text-base text-[#A37E44]">AED {totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Inclusions */}
      <div className="space-y-2 text-xs text-gray-600 bg-white p-4 rounded-xl border border-[#E5E0D8]">
        <p className="font-bold text-[#0B1528] mb-1">What is included:</p>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
          <span>Full 6-section guided questionnaire with auto-save</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
          <span>Court-ready bilingual (English & Arabic) template ADJD-NM0723-07-03</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
          <span>Dedicated in-app support ticketing & document assistance</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" />
          <span>Manual legal team review within 2–3 working days after court fee payment</span>
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handlePay} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Phone
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#A37E44] focus:ring-[#A37E44]"
          />
          <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
            I confirm that I am preparing this Will for UAE assets under the Abu Dhabi Civil Family Court jurisdiction. I agree to the service terms and understand that the initial OWA service fee is non-refundable upon successful payment.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#0B1528] hover:bg-[#111C33] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4 text-[#A37E44]" />
              <span>Pay AED {initialFee.toLocaleString()} (Instant Simulator)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-gray-400 mt-2">
          🔒 Secure 256-bit encrypted simulated checkout for staging evaluation.
        </p>
      </form>
    </div>
  );
}
