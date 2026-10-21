"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  ExternalLink,
  Clock,
  Video,
  FileText,
  MessageSquare,
  ChevronRight,
  Check,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { OwaFooter } from "@/components/common/OwaFooter";

function CourtFeeCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { application, applicationId, loadApplicationFromDb } = useOwaStore();

  const appId = searchParams.get("applicationId") || applicationId;

  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appId) {
      fetch(`/api/applications/${appId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.application) {
            setAppData(data.application);
          }
        })
        .catch((err) => console.error("Failed to load application:", err));
    }
  }, [appId]);

  const activeApp = appData || application;
  const isCouples = activeApp?.packageType === "COUPLES";
  const feePerWill = 950;
  const feeAmount = isCouples ? feePerWill * 2 : feePerWill;
  const initialFeePaid = isCouples ? 1799 : 999;
  const stage = activeApp?.status || "DRAFT_READY";

  const payments = activeApp?.payments || [];
  const courtPayment = payments.find((p: any) => p.milestone === "COURT_FEE");
  const isPaid = Boolean(
    courtPayment?.status === "COMPLETED" ||
    activeApp?.wills?.[0]?.courtPaymentVerified ||
    [
      "AWAITING_ADMIN_VERIFICATION",
      "UNDER_ADMIN_REVIEW",
      "READY_FOR_SUBMISSION",
      "SUBMITTED_TO_ADJD",
      "REGISTRATION_COMPLETED",
    ].includes(stage)
  );

  // Stepper current state
  // 0: ADJD approved (Done)
  // 1: Pay AED 950 (Current or Done)
  // 2: We book notarisation
  // 3: Attend video call
  // 4: ADJD registers
  const currentStep = isPaid ? 2 : 1;

  const handlePayCourtFee = async (method = "DIRECT_PORTAL_CONFIRMATION") => {
    if (!appId) {
      setError("No application ID found. Please access this page from your dashboard.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/court-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          paymentMethod: method,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard?payment=court_fee_success&applicationId=${appId}`);
        }, 1500);
      } else {
        setError(data.error || "Payment record update failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "ADJD approved your application",
      desc: "We file your Will, ADJD reviews it, and our legal team completes any corrections ADJD requests.",
    },
    {
      title: `Pay AED ${feeAmount.toLocaleString()} on ADJD's portal`,
      desc: "Mandatory court registry fee paid directly on the Abu Dhabi Judicial Department e-services portal.",
    },
    {
      title: "We book your video notarisation",
      desc: "We take the first appointment ADJD offers and send you the scheduled date and Microsoft Teams link.",
    },
    {
      title: "Attend the video call",
      desc: "An ADJD notary checks your identity and reads your Will back to you. You need to be in the UAE, on a residence or visit visa. ADJD does not need witnesses.",
    },
    {
      title: "ADJD registers your Will",
      desc: "ADJD issues your registered Will as an attested PDF with its official court stamp and barcoded reference. A copy appears in your account.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#29213F]">
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Header Breadcrumbs */}
        <div className="space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">
            <Link href="/dashboard" className="hover:underline">
              My application
            </Link>{" "}
            <span className="px-1.5 text-gray-300">/</span> Court fee
          </div>
          <div className="text-[10px] tracking-widest uppercase font-bold text-[#8A6233] font-mono">
            {isCouples ? "TWO WILLS · ONE APPLICATION" : "INDIVIDUAL WILL · ADJD"}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#29213F]">
            Court Fee and Notarisation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
            {isPaid
              ? "Court fee confirmed. Your official video notarisation booking is being arranged."
              : `ADJD approved your application. Pay the AED ${feeAmount.toLocaleString()} court fee on ADJD's portal, and our legal team will schedule your video notarisation.`}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paymentSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">
              Court fee confirmed! Updating your dashboard status...
            </span>
          </div>
        )}

        {/* 2-Column Split: Progression Rail (Left) vs. Breakdown/Support (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: 5-Step Vertical Progression Rail */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#FFFEFA] border border-[#E4DFEE] rounded-2xl p-6 sm:p-8 shadow-card-soft">
              <h2 className="text-sm font-bold text-[#29213F] uppercase tracking-wider mb-6 pb-2 border-b border-[#E4DFEE]">
                Steps to Court Registration
              </h2>

              <ol className="space-y-6 relative">
                {steps.map((st, i) => {
                  const isDone = i < currentStep;
                  const isCur = i === currentStep;

                  return (
                    <li key={st.title} className="flex items-start gap-4 relative">
                      {/* Left Rail & Dot */}
                      <div className="flex flex-col items-center shrink-0">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? "bg-[#2F7A55] text-white"
                              : isCur
                              ? "bg-[#6243AD] text-white shadow-2xs"
                              : "bg-[#FFFFFF] border-2 border-[#E4DFEE] text-gray-400"
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </span>
                        {i < steps.length - 1 && (
                          <div
                            className={`w-0.5 h-16 sm:h-20 my-1 ${
                              isDone ? "bg-[#2F7A55]" : "bg-[#E4DFEE]"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <span
                          className={`text-sm font-semibold block ${
                            isCur ? "text-[#29213F] font-bold" : isDone ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {st.title}
                        </span>

                        {/* Special Interactive Box for Step 2 (Fee Settlement) */}
                        {i === 1 && !isPaid ? (
                          <div className="mt-3 bg-[#FFFDF9] border border-[#D7B48B] rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#8A6233] uppercase tracking-wider font-mono">
                                Action Required Now
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4E5] text-[#95652B] border border-[#F2D7B2]">
                                Due: AED {feeAmount.toLocaleString()}
                              </span>
                            </div>

                            <ol className="space-y-2 text-xs text-gray-700 list-decimal pl-4">
                              <li>
                                Sign in to <strong>ADJD e-services</strong> with your <strong>UAE Pass</strong>.
                              </li>
                              <li>
                                Open your Will application. Your platform reference is{" "}
                                <strong className="font-mono text-[#29213F]">
                                  {activeApp?.applicationNumber || "OWA-0148"}
                                </strong>
                                .
                              </li>
                              <li>
                                Pay the mandatory court fee (AED {feeAmount.toLocaleString()}) via your credit/debit card on ADJD&apos;s gateway.
                              </li>
                            </ol>

                            <div className="pt-2 flex flex-wrap items-center gap-3">
                              <a
                                href="https://www.adjd.gov.ae/EN/Pages/EServiceDirectory.aspx"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C73A30] hover:bg-[#AD3128] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                              >
                                <span>Open ADJD e-services portal</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={() => handlePayCourtFee("DIRECT_PORTAL_CONFIRMATION")}
                                disabled={loading}
                                className="px-4 py-2 bg-white border border-[#6243AD] hover:bg-[#F0EBF9] text-[#6243AD] text-xs font-bold rounded-lg transition-all"
                              >
                                {loading ? "Updating..." : "I have paid: notify OWA"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePayCourtFee("TEST_CARD_SIMULATION")}
                                disabled={loading}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg"
                              >
                                [Demo: Simulate Card Payment]
                              </button>
                            </div>

                            <p className="text-[11px] text-gray-500">
                              ADJD collects this fee directly on its government portal. Online Wills Advisor does not charge any margin or card processing fee on court charges.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {i === 1 && isPaid ? (
                              <span className="text-[#2F7A55] font-semibold flex items-center gap-1 mt-1">
                                <Check className="w-3.5 h-3.5" />
                                Paid on ADJD portal. Thank you for confirming.
                              </span>
                            ) : (
                              st.desc
                            )}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Right Column: Who you pay & Support Card */}
          <div className="space-y-6">
            {/* Who You Pay Breakdown */}
            <div className="bg-[#FFFEFA] border border-[#E4DFEE] rounded-2xl p-6 shadow-card-soft space-y-4">
              <div className="text-[10px] tracking-wider uppercase font-bold text-gray-400 font-mono">
                WHO YOU PAY
              </div>

              <div className="space-y-3 pt-1">
                {/* OWA Fee */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E4DFEE]">
                  <div>
                    <strong className="text-xs font-bold text-[#29213F] block">
                      Online Wills Advisor
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      {isCouples ? "Mirror Wills preparation fee" : "Single Will preparation fee"}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className="text-xs font-bold text-[#29213F] block font-mono">
                      AED {initialFeePaid.toLocaleString()}
                    </strong>
                    <span className="text-[10px] font-bold text-[#2F7A55]">
                      Paid
                    </span>
                  </div>
                </div>

                {/* ADJD Court Fee */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <strong className="text-xs font-bold text-[#29213F] block">
                      Abu Dhabi Judicial Dept.
                    </strong>
                    <span className="text-[11px] text-gray-500">
                      Direct court registry fee
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className="text-xs font-bold text-[#29213F] block font-mono">
                      AED {feeAmount.toLocaleString()}
                    </strong>
                    <span
                      className={`text-[10px] font-bold ${
                        isPaid ? "text-[#2F7A55]" : "text-[#95652B]"
                      }`}
                    >
                      {isPaid ? "Paid to ADJD" : "Due on ADJD portal"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4DFEE] flex items-center justify-between text-xs font-bold text-[#29213F]">
                <span>Total Statutory Cost:</span>
                <span className="font-mono">
                  AED {(initialFeePaid + feeAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Support Callout Box */}
            <div className="bg-[#F0EBF9] border border-[#DFD2EF] rounded-2xl p-6 shadow-card-soft space-y-3">
              <div className="flex items-center gap-2 text-[#6243AD]">
                <MessageSquare className="w-4 h-4" />
                <h3 className="font-serif text-base font-bold text-[#29213F]">
                  Trouble paying on ADJD&apos;s portal?
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                If you encounter any issues accessing your UAE Pass account or finding your application reference on the ADJD e-services portal, our legal coordinators will walk you through step by step.
              </p>
              <Link
                href="/dashboard/support"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-white border border-[#6243AD] hover:bg-[#F7F4FC] text-[#6243AD] text-xs font-bold rounded-lg shadow-2xs transition-all"
              >
                <span>Message Support Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching owa-platform-prototype.html */}
      <OwaFooter />
    </div>
  );
}

export default function CourtFeePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8 text-gray-400">
          Loading Court Fee Portal...
        </div>
      }
    >
      <CourtFeeCheckoutContent />
    </React.Suspense>
  );
}
