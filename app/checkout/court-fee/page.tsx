"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Building,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function CourtFeeCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get("applicationId");

  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    fetch(`/api/applications/${applicationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAppData(data.application);
        }
      })
      .catch((err) => console.error("Failed to load application:", err));
  }, [applicationId]);

  const isCouples = appData?.packageType === "COUPLES";
  const feeAmount = isCouples ? 1900 : 950;
  const initialFeePaid = isCouples ? 1799 : 999;
  const totalCost = initialFeePaid + feeAmount;

  const handlePayCourtFee = async (method = "TEST_CARD") => {
    if (!applicationId) {
      setError("No application ID found. Please access this page from your questionnaire.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/court-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          paymentMethod: method,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard?payment=court_fee_success&applicationId=${applicationId}`);
        }, 2000);
      } else {
        setError(data.error || "Payment failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A37E44]/10 text-[#A37E44] text-xs font-semibold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            Milestone 2 of 2 · Official Court Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B1528]">
            Abu Dhabi Civil Family Court Filing Fee
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            Your Non-Muslim Will draft has been prepared and confirmed. Settle the mandatory ADJD registration fee to transmit your application for court verification.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paymentSuccess ? (
          <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#0B1528]">
              Court Fee Successfully Settled
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Your application has transitioned to <strong>Awaiting Admin Verification</strong>. All questionnaire sections are now locked to preserve legal integrity. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Fee Breakdown & Court Notice */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider border-b border-[#E5E0D8] pb-3">
                  Court Registration Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Selected Package:</span>
                    <span className="font-semibold text-[#0B1528]">
                      {isCouples ? "Couples Mirror Will Package" : "Individual Non-Muslim Will"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Stage 1 Service Preparation Fee:</span>
                    <span className="text-emerald-700 font-semibold">
                      AED {initialFeePaid.toLocaleString()} (Paid)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">
                      Stage 2 ADJD Court Registry & Attestation Fee:
                    </span>
                    <span className="font-bold text-[#A37E44]">
                      AED {feeAmount.toLocaleString()} (Due Now)
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-sm sm:text-base font-bold text-[#0B1528]">
                    <span>Total Fixed Cost for Entire Will:</span>
                    <span>AED {totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B1528]">
                    <ShieldCheck className="w-4 h-4 text-[#A37E44]" />
                    Official Court Guarantee
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Under Abu Dhabi Law No. 14 of 2021 on Civil Marriage and its Effects, the registered Will covers all UAE movable and immovable assets. Official court stamps and certificate numbers will be issued following administrative verification.
                  </p>
                </div>
              </div>

              {/* Payment Processing Form */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#A37E44]" />
                  Secure Payment Processing
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      defaultValue={appData?.account?.fullName || "Alexander David Croft"}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        defaultValue="•••• •••• •••• 4242"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Expiry / CVV
                      </label>
                      <input
                        type="text"
                        defaultValue="12/28 · 888"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handlePayCourtFee("CREDIT_CARD")}
                      className="w-full py-4 bg-[#0B1528] hover:bg-[#1a2844] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Transmitting to ADJD Registry...</span>
                      ) : (
                        <>
                          <span>Pay AED {feeAmount.toLocaleString()} & Submit to Court</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* 1-Click Reviewer Bypass */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handlePayCourtFee("PM_DEMO_BYPASS")}
                      className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#A37E44]" />
                      PM / Reviewer Instant Simulation (Pay AED {feeAmount})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Security & Workflow Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#0B1528]">
                  Post-Payment Document Lock
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Upon payment, the draft is immediately locked to prevent unauthorized alterations during administrative legal review and translation certification.
                </p>

                <div className="pt-3 border-t border-[#E5E0D8] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Side-by-side bilingual compliance</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Phonetic transliteration audit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% estate balance check</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1528] text-white space-y-2 text-xs">
                <div className="text-[#A37E44] font-bold uppercase tracking-wider text-[10px]">
                  Direct Support
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Have questions about court procedures or embassy attestations? Our legal support desk is available via in-app tickets.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourtFeeCheckoutPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-8 text-gray-400">Loading Checkout...</div>}>
      <CourtFeeCheckoutContent />
    </React.Suspense>
  );
}
