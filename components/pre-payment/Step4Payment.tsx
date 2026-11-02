"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { PrePaymentJourneyState } from "@/types/pre-payment";

interface Step4PaymentProps {
  state: PrePaymentJourneyState;
  onOpenSample: () => void;
  onOpenHelp: () => void;
  onEditPackage: () => void;
  onEditContact: () => void;
  onPay: () => Promise<any>;
  onPaymentConfirmed?: (data: any) => void;
  loading: boolean;
  error: string | null;
}

const NOMOD_LINKS = {
  INDIVIDUAL: process.env.NEXT_PUBLIC_NOMOD_URL_INDIVIDUAL || "https://pay.nomodapp.com/en/l/3de8ba889b5942b8",
  COUPLES: process.env.NEXT_PUBLIC_NOMOD_URL_COUPLES || "https://pay.nomodapp.com/en/l/d5c977670ef34c97",
  TEST_1_AED: process.env.NEXT_PUBLIC_NOMOD_URL_TEST || "https://pay.nomodapp.com/en/l/a45add7431954cf8",
};

export function Step4Payment({
  state,
  onOpenSample,
  onOpenHelp,
  onEditPackage,
  onEditContact,
  onPay,
  onPaymentConfirmed,
  loading,
  error,
}: Step4PaymentProps) {
  const isCouples = state.packageType === "COUPLES";
  const serviceFee = isCouples ? 1799 : 999;
  const courtFee = isCouples ? 1900 : 950;
  const packageTitle = isCouples ? "Wills for Couples" : "Individual Will";
  const standardNomodUrl = isCouples ? NOMOD_LINKS.COUPLES : NOMOD_LINKS.INDIVIDUAL;

  const [is1AedTestMode, setIs1AedTestMode] = useState<boolean>(true); // Default to true for testing with Biswa's 1 AED link
  const payableAmount = is1AedTestMode ? 1 : serviceFee;
  const nomodUrl = is1AedTestMode ? NOMOD_LINKS.TEST_1_AED : standardNomodUrl;

  const [activeAppId, setActiveAppId] = useState<string | null>(state.applicationId || null);
  const [hasOpenedNomod, setHasOpenedNomod] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollStatusText, setPollStatusText] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep activeAppId in sync if state.applicationId updates
  useEffect(() => {
    if (state.applicationId && state.applicationId !== activeAppId) {
      setActiveAppId(state.applicationId);
    }
  }, [state.applicationId, activeAppId]);

  // Poll for payment completion ONLY when Nomod checkout is opened AND we have activeAppId
  useEffect(() => {
    if (!hasOpenedNomod || !activeAppId) return;

    let attempts = 0;
    const maxAttempts = 60; // 3 minutes (every 3 seconds)

    const checkStatus = async () => {
      try {
        attempts++;
        const res = await fetch(
          `/api/checkout/status?applicationId=${encodeURIComponent(activeAppId)}`
        );
        const data = await res.json();
        if (data.success && data.paid) {
          setIsPolling(false);
          setPollStatusText("Payment confirmed! Loading your questionnaire...");
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          if (onPaymentConfirmed) {
            onPaymentConfirmed(data);
          }
          return;
        }

        if (attempts >= maxAttempts) {
          setIsPolling(false);
          setPollStatusText("Waiting for payment. If you already completed checkout, click 'Check status'.");
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        console.warn("Status poll error:", err);
      }
    };

    setIsPolling(true);
    pollTimerRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [hasOpenedNomod, activeAppId, onPaymentConfirmed]);

  const handleNomodHandoff = async () => {
    setHasOpenedNomod(true);
    setPollStatusText("Nomod checkout opened. Waiting for payment...");
    // Initialize or save application intent in background and capture applicationId
    if (onPay) {
      try {
        const initRes = await onPay();
        if (initRes?.applicationId) {
          setActiveAppId(initRes.applicationId);
        }
      } catch (e) {
        console.warn("Could not pre-init application intent:", e);
      }
    }
  };

  const handleManualCheckStatus = async () => {
    if (!activeAppId) {
      setPollStatusText("Please click the 'Pay AED ...' button above to open Nomod checkout first.");
      setTimeout(() => setPollStatusText(null), 4000);
      return;
    }
    setIsPolling(true);
    setPollStatusText("Checking status with Nomod...");
    try {
      const res = await fetch(
        `/api/checkout/status?applicationId=${encodeURIComponent(activeAppId)}`
      );
      const data = await res.json();
      if (data.success && data.paid) {
        setPollStatusText("Payment confirmed! Loading your questionnaire...");
        if (onPaymentConfirmed) {
          onPaymentConfirmed(data);
        }
      } else {
        setPollStatusText("No completed payment received for this session yet. Complete checkout on Nomod.");
        setTimeout(() => setPollStatusText(null), 4000);
      }
    } catch {
      setPollStatusText("Could not verify status right now. Please try again.");
    } finally {
      setIsPolling(false);
    }
  };

  // Local simulation mode as specified in Developer Handbook Section 1 & 12
  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      // 1. Ensure initial checkout application exists
      let appId = activeAppId;
      if (!appId) {
        const initRes = await onPay();
        appId = initRes?.applicationId;
        if (appId) {
          setActiveAppId(appId);
        }
      }

      if (!appId) {
        throw new Error("Could not initialize application for simulation.");
      }

      // 2. Trigger webhook for this specific application
      const webhookRes = await fetch("/api/webhooks/nomod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment.succeeded",
          data: {
            id: `SIM-NOMOD-${Date.now().toString(36).toUpperCase()}`,
            amount: payableAmount,
            currency: "AED",
            status: "paid",
            customer: {
              email: state.email.trim().toLowerCase(),
              name: state.fullName,
            },
            metadata: {
              applicationId: appId,
            },
          },
        }),
      });

      const webhookData = await webhookRes.json();
      if (webhookData.success && onPaymentConfirmed) {
        onPaymentConfirmed(webhookData);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="pre-step-4">
      {/* Pagehead */}
      <div className="pagehead saas-checkout-head">
        <span className="eyebrow">STEP 4 OF 4 · PAYMENT</span>
        <h1>Complete your checkout</h1>
        <p className="sub">Your Will preparation with Online Wills Advisor.</p>
      </div>

      <div className="saas-checkout">
        {/* Left Section: Order Summary */}
        <section className="saas-order" aria-label="Order summary">
          <div className="saas-order-top">
            <span className="saas-label">YOUR ORDER</span>
            <button type="button" onClick={onEditPackage}>
              Change
            </button>
          </div>
          <div className="saas-product">
            <span className="saas-product-icon" aria-hidden="true">
              <svg viewBox="0 0 40 44" fill="none">
                <path
                  d="M9 4h16l8 8v28H9zM25 4v9h8M15 21h12M15 27h12M15 33h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <div>
              <h2>{packageTitle}</h2>
              <p>{isCouples ? "Two separate Wills" : "One Will"} · English & Arabic</p>
            </div>
          </div>
          <div className="saas-order-name">
            Prepared for <strong>{state.fullName || "you"}{isCouples ? " and your partner" : ""}</strong>
          </div>
          <div className="saas-price-block">
            <span>Payable now to OWA</span>
            <div className="saas-price">
              <span>AED</span>
              <strong>{serviceFee.toLocaleString("en-US")}</strong>
            </div>
            <p>OWA service fee</p>
          </div>
          <div className="saas-inclusions">
            <h3>Your package includes</h3>
            <ul>
              <li>Six-section questionnaire with auto-save</li>
              <li>English and Arabic Will draft</li>
              <li>Document assistance and in-app support</li>
              <li>Application review and ADJD submission</li>
            </ul>
          </div>
          <button type="button" className="saas-sample" onClick={onOpenSample}>
            View a sample Will <ArrowRight className="icon inline w-3.5 h-3.5 ml-1" aria-hidden="true" />
          </button>
          <p className="saas-court">
            ADJD court fee: <strong>AED {courtFee.toLocaleString("en-US")}{isCouples ? " for two Wills" : " per Will"}</strong>, paid directly to ADJD later (not charged by OWA).
          </p>
          <details className="saas-mobile-included">
            <summary>View package inclusions</summary>
            <ul>
              <li>Six-section questionnaire with auto-save</li>
              <li>English and Arabic Will draft</li>
              <li>Document assistance and in-app support</li>
              <li>Application review and ADJD submission</li>
            </ul>
            <button type="button" className="saas-sample" onClick={onOpenSample}>
              View a sample Will
            </button>
          </details>
        </section>

        {/* Right Section: Payment Details */}
        <section className="saas-pay" aria-label="Payment">
          <div className="saas-pay-heading">
            <h2>Payment details</h2>
            <span className="saas-test-tag">NOMOD CHECKOUT</span>
          </div>
          <div className="saas-customer">
            <div className="saas-customer-top">
              <span>Contact details</span>
              <button type="button" className="link" onClick={onEditContact}>
                Edit
              </button>
            </div>
            <strong>{state.email || "Your email"}</strong>
            <span>{state.phoneNumber || "Your phone number"}</span>
          </div>
          <div className="saas-method-label">Payment method</div>
          <div className="saas-method">
            <span className="saas-method-check" aria-hidden="true">
              ✓
            </span>
            <svg viewBox="0 0 32 24" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 8h30M6 17h7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div>
              <strong>Pay securely with Nomod</strong>
              <span>Choose your payment method on the next page</span>
            </div>
          </div>
          <p className="saas-demo-info">
            Your payment opens in a new tab on Nomod. Card details are entered there, not on this page.
          </p>
          {error && (
            <div className="saas-error" role="status">
              <strong>Payment wasn’t completed.</strong>
              <span>Your answers are saved. You can try again below.</span>
            </div>
          )}
          {/* 1 AED Testing Mode Toggle */}
          <div className="flex items-center justify-between p-2.5 mb-3 rounded-lg bg-[#F8F5FC] border border-[#E2D7ED] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-[#4A2D7A]">Testing Mode (1 AED)</span>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#6243AD] font-medium hover:text-[#392750]">
              <input
                type="checkbox"
                checked={is1AedTestMode}
                onChange={(e) => setIs1AedTestMode(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#6243AD] cursor-pointer"
              />
              <span>Use 1 AED Test Link</span>
            </label>
          </div>

          <div className="saas-total">
            <span>Payable now {is1AedTestMode && <span className="text-xs font-normal text-emerald-700">(Test Mode)</span>}</span>
            <strong>AED {payableAmount.toLocaleString("en-US")}</strong>
          </div>

          <a
            className="btn primary saas-pay-cta"
            href={nomodUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleNomodHandoff}
          >
            <span>Pay AED {payableAmount.toLocaleString("en-US")}{is1AedTestMode ? " (Live Test)" : ""}</span>
            <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
          </a>

          <p className="saas-nocharge">
            Payment is collected on Nomod by Juris Zone Corporate Services Provider (CSP) CO. LLC.
          </p>

          {/* Polling / Status feedback */}
          {hasOpenedNomod && (
            <div className="p-3 bg-[#FAF7F3] border border-[#E4D8C7] rounded-xl text-xs mt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[#27173B] flex items-center gap-1.5">
                  {isPolling && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C6D41]" />}
                  {pollStatusText || "Nomod checkout opened. Waiting for payment..."}
                </span>
                <button
                  type="button"
                  className="link text-xs font-semibold text-[#8C6D41] hover:underline"
                  onClick={handleManualCheckStatus}
                  disabled={isPolling}
                >
                  Check status
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <p className="small muted nomod-handoff-note">
        Already paid? Keep your Nomod receipt. This preview cannot verify payment or unlock your application automatically.
      </p>

      {/* Developer Test Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 my-4">
        <a
          href={NOMOD_LINKS.TEST_1_AED}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNomodHandoff}
          className="text-xs text-[#6243AD] hover:text-[#392750] underline font-medium cursor-pointer"
        >
          🧪 Open 1 AED Nomod Test Checkout directly
        </a>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={simulating}
          className="text-xs text-[#8C6D41] hover:text-[#5A3F1A] underline font-medium cursor-pointer bg-transparent border-0"
        >
          {simulating ? "Simulating payment..." : "⚡ Simulate test payment (Bypass Nomod)"}
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="saas-checkout-foot">
        <button type="button" className="link" onClick={onEditContact}>
          ← Back to review
        </button>
        <button type="button" className="link" onClick={onOpenHelp}>
          Questions before paying?
        </button>
      </div>

      {/* FAQs */}
      <div className="saas-questions">
        <details>
          <summary>What happens after I pay?</summary>
          <p>
            Verify your email to open your paid application. Add documents and complete the six sections{isCouples ? " for both Wills" : ""}, then review your bilingual draft. OWA reviews your completed application before submission to ADJD.
          </p>
        </details>
        <details>
          <summary>Do I need my documents now?</summary>
          <p>
            No. Upload your identity documents in the questionnaire after payment. You can save your progress and return later.
          </p>
        </details>
        <details>
          <summary>Does this complete court registration?</summary>
          <p>
            No. This payment starts Will preparation. The court fee is paid directly to ADJD later. OWA submits your completed application after review and court payment; ADJD decides registration.
          </p>
        </details>
      </div>

      {/* Mobile Sticky Pay Bar */}
      <div className="saas-mobile-pay">
        <span>
          <small>OWA service fee{is1AedTestMode ? " (Test 1 AED)" : ""}</small>
          <strong>AED {payableAmount.toLocaleString("en-US")}</strong>
        </span>
        <a
          className="btn primary"
          href={nomodUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNomodHandoff}
        >
          <span>Pay AED {payableAmount.toLocaleString("en-US")} on Nomod</span>
          <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
