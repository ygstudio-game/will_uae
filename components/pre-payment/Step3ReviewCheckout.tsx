"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  PrePaymentJourneyState,
  PrePaymentInclusionTab,
} from "@/types/pre-payment";

interface Step3ReviewCheckoutProps {
  state: PrePaymentJourneyState;
  onUpdateEmail: (email: string) => void;
  onUpdatePhone: (phone: string) => void;
  onVerifyEmail?: (verified: boolean) => void;
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
  onUpdateInclusionTab,
  onEditDetails,
  onEditPackage,
  onOpenSample,
  onOpenHelp,
  onNext,
}: Step3ReviewCheckoutProps) {
  const isCouples = state.packageType === "COUPLES";
  const serviceFee = isCouples ? 1799 : 999;
  const courtFee = isCouples ? 1900 : 950;
  const packageTitle = isCouples ? "Wills for Couples" : "Individual Will";

  const [errors, setErrors] = useState<string[]>([]);

  const phoneKey = (p: string) => String(p || "").replace(/\D/g, "").replace(/^00/, "");

  const getContactErrors = (): string[] => {
    const e: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      e.push("Enter a valid email address.");
    }
    const cleanPhone = "+" + phoneKey(state.phoneNumber);
    if (!/^\+[1-9]\d{6,14}$/.test(cleanPhone)) {
      e.push("Enter your phone number with country code, for example +971 50 000 0001.");
    }
    return e;
  };

  const handleCheckoutAction = () => {
    const errs = getContactErrors();
    if (errs.length > 0) {
      setErrors(errs);
      const errBox = document.getElementById("pre-errors");
      if (errBox) {
        errBox.scrollIntoView({ behavior: "smooth", block: "center" });
        errBox.focus();
      }
      return;
    }
    setErrors([]);
    onNext();
  };

  return (
    <div className="pre-step-3">
      {/* Pagehead */}
      <div className="pagehead cro-checkout-head">
        <div className="eyebrow">STEP 3 OF 4 · REVIEW</div>
        <h1>Review {isCouples ? "your two Wills." : "your Will."}</h1>
        <p className="sub">
          Check your package and contact details. You’ll pay only the OWA service fee at checkout.
        </p>
        <div className="cro-mobile-price">
          <strong>AED {serviceFee.toLocaleString("en-US")} payable to OWA</strong>
          <button
            id="mobile-checkout-action"
            className="btn primary small"
            onClick={handleCheckoutAction}
          >
            Continue to payment →
          </button>
        </div>
        <div className="cro-assurance">
          <span>✓ No documents needed at checkout</span>
          <span>✓ Save and return to your questionnaire</span>
        </div>
      </div>

      <div className="pre-checkout cro-checkout">
        {/* Package Inclusions Card */}
        <section className="card cro-included">
          <div className="cardbody">
            <div className="cro-application">
              <div>
                <span className="eyebrow">
                  {isCouples ? "TWO SEPARATE WILLS" : "ONE INDIVIDUAL WILL"}
                </span>
                <h2>{packageTitle}</h2>
                <p className="small muted">
                  Prepared for {state.fullName || "you"}{isCouples ? " and your partner" : ""}
                </p>
              </div>
              <button className="link small" onClick={onEditDetails}>
                Edit details
              </button>
            </div>
            <hr className="divider" />
            <h3>What is included:</h3>

            {/* Inclusion Explorer Tabs & Stage */}
            <div className="cro-benefits">
              <div className="cro-benefit-tabs" role="tablist" aria-label="Package inclusions">
                <button
                  type="button"
                  className={state.activeInclusionTab === "guided" ? "active" : ""}
                  aria-pressed={state.activeInclusionTab === "guided"}
                  onClick={() => onUpdateInclusionTab("guided")}
                >
                  <span className="cro-tab-number">01</span>
                  <span>Guided questions</span>
                </button>
                <button
                  type="button"
                  className={state.activeInclusionTab === "bilingual" ? "active" : ""}
                  aria-pressed={state.activeInclusionTab === "bilingual"}
                  onClick={() => onUpdateInclusionTab("bilingual")}
                >
                  <span className="cro-tab-number">02</span>
                  <span>Bilingual draft</span>
                </button>
                <button
                  type="button"
                  className={state.activeInclusionTab === "support" ? "active" : ""}
                  aria-pressed={state.activeInclusionTab === "support"}
                  onClick={() => onUpdateInclusionTab("support")}
                >
                  <span className="cro-tab-number">03</span>
                  <span>In-app support</span>
                </button>
                <button
                  type="button"
                  className={state.activeInclusionTab === "court" ? "active" : ""}
                  aria-pressed={state.activeInclusionTab === "court"}
                  onClick={() => onUpdateInclusionTab("court")}
                >
                  <span className="cro-tab-number">04</span>
                  <span>Court filing</span>
                </button>
              </div>

              <div className="cro-benefit-stage">
                {state.activeInclusionTab === "guided" && (
                  <section className="cro-benefit-panel">
                    <svg viewBox="0 0 250 158" role="img" aria-label="Illustration of step-by-step guided questionnaire">
                      <rect width="250" height="158" rx="12" fill="#efe9f7" />
                      <rect x="24" y="24" width="202" height="110" rx="6" fill="white" stroke="#d4c7e4" />
                      <rect x="42" y="44" width="72" height="9" rx="4.5" fill="#3c2a58" />
                      <rect x="42" y="66" width="166" height="6" rx="3" fill="#cfc2df" />
                      <rect x="42" y="79" width="138" height="6" rx="3" fill="#e5ddf0" />
                      <circle cx="51" cy="108" r="9" fill="#1b8574" />
                      <path d="m47 108 3 3 6-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="81" cy="108" r="9" fill="#4d2786" />
                      <circle cx="111" cy="108" r="9" fill="#eae1f5" />
                      <circle cx="141" cy="108" r="9" fill="#eae1f5" />
                    </svg>
                    <div>
                      <span className="eyebrow">QUESTIONNAIRE</span>
                      <strong>Step-by-step questions</strong>
                      <p>A structured questionnaire with auto-save. Answer questions about your family, executors and how your estate should be distributed.</p>
                    </div>
                  </section>
                )}

                {state.activeInclusionTab === "bilingual" && (
                  <section className="cro-benefit-panel">
                    <svg viewBox="0 0 250 158" role="img" aria-label="Illustration of an English and Arabic draft side by side">
                      <rect width="250" height="158" rx="12" fill="#efe9f7" />
                      <rect x="36" y="14" width="178" height="132" rx="5" fill="white" stroke="#d4c7e4" />
                      <rect x="53" y="27" width="68" height="8" rx="4" fill="#3c2a58" />
                      <rect x="128" y="27" width="68" height="8" rx="4" fill="#3c2a58" />
                      <path d="M125 44v86" stroke="#ddd2e9" />
                      <path d="M53 50h58M53 63h57M53 76h48M53 89h57M53 102h52M53 115h40M139 50h57M139 63h57M147 76h49M139 89h57M143 102h53M156 115h40" stroke="#b6a8ca" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div>
                      <span className="eyebrow">ENGLISH + ARABIC</span>
                      <strong>Your Will in English and Arabic</strong>
                      <p>A bilingual draft prepared using the ADJD Will template, with your details and choices. You can review the generated draft after completing the questionnaire.</p>
                    </div>
                  </section>
                )}

                {state.activeInclusionTab === "support" && (
                  <section className="cro-benefit-panel">
                    <svg viewBox="0 0 250 158" role="img" aria-label="Illustration of a document and in-app support conversation">
                      <rect width="250" height="158" rx="12" fill="#efe9f7" />
                      <rect x="28" y="20" width="112" height="116" rx="7" fill="white" stroke="#d4c7e4" />
                      <path d="M45 47h69M45 61h69M45 75h50M45 90h63" stroke="#c3b4d6" strokeWidth="5" strokeLinecap="round" />
                      <rect x="117" y="64" width="100" height="52" rx="10" fill="#38254d" />
                      <path d="m134 116-13 13 2-14" fill="#38254d" />
                      <circle cx="146" cy="90" r="4" fill="#efe3fd" />
                      <circle cx="167" cy="90" r="4" fill="#efe3fd" />
                      <circle cx="188" cy="90" r="4" fill="#efe3fd" />
                    </svg>
                    <div>
                      <span className="eyebrow">HELP AFTER PAYMENT</span>
                      <strong>Help with documents and questions</strong>
                      <p>In-app support tickets and document assistance are included after payment.</p>
                    </div>
                  </section>
                )}

                {state.activeInclusionTab === "court" && (
                  <section className="cro-benefit-panel">
                    <svg viewBox="0 0 250 158" role="img" aria-label="Document reviewed and submitted to ADJD">
                      <rect x="42" y="12" width="164" height="134" rx="3" fill="#fff" stroke="#b9c1cd" />
                      <path d="M64 39h121M64 52h97M64 69h121M64 82h107M64 99h82" stroke="#c8ced6" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="174" cy="111" r="19" fill="#e7ecea" />
                      <path d="m165 111 6 6 12-14" fill="none" stroke="#245c4a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                      <span className="eyebrow">AFTER REVIEW AND COURT PAYMENT</span>
                      <strong>ADJD court submission</strong>
                      <p>OWA prepares and submits your completed application to ADJD after review and direct payment of the court fee. ADJD handles the registration decision.</p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <button
              type="button"
              className="link draft-preview-link"
              onClick={onOpenSample}
            >
              See a sample bilingual Will <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Contact Details Card */}
        <section id="checkout-contact" className="card cro-contact">
          <div className="cardhead">
            <div>
              <span className="eyebrow">YOUR CONTACT DETAILS</span>
              <h3>Where should we send your receipt?</h3>
            </div>
          </div>
          <div className="cardbody">
            <p className="small muted cro-contact-intro">
              Enter your email and phone number for your receipt and application. You can verify your email when you return to the paid questionnaire.
            </p>
            <div className="grid2">
              <label className="field">
                Email address *
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  aria-required="true"
                  placeholder="you@example.com"
                  value={state.email}
                  onChange={(e) => {
                    onUpdateEmail(e.target.value);
                    if (errors.length > 0) setErrors([]);
                  }}
                />
              </label>
              <label className="field">
                Phone number *
                <input
                  type="tel"
                  autoComplete="tel"
                  aria-required="true"
                  placeholder="+971 50 000 0001"
                  value={state.phoneNumber}
                  onChange={(e) => {
                    onUpdatePhone(e.target.value);
                    if (errors.length > 0) setErrors([]);
                  }}
                />
                <span className="hint">Include your country code. OWA may contact you about your application.</span>
              </label>
            </div>
          </div>
        </section>

        {/* Order Wrap Aside */}
        <aside className="cro-order-wrap">
          <div className="card cro-order">
            <div className="cardbody">
              <div className="spread">
                <span className="eyebrow">PAYABLE TO OWA TODAY</span>
                <button className="link small" onClick={onEditPackage}>
                  Change package
                </button>
              </div>
              <div className="pre-price premium-price">
                <span className="premium-price__currency">AED</span>
                <strong>{serviceFee.toLocaleString("en-US")}</strong>
              </div>
              <p className="cro-package-label">
                {packageTitle} · {isCouples ? "two Wills" : "one Will"}
              </p>
              <div id="checkout-action-slot">
                <button
                  id="checkout-action"
                  className="btn primary pre-pay-button"
                  onClick={handleCheckoutAction}
                >
                  <span>Continue to payment</span>
                  <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
                </button>
                <p id="checkout-action-hint" className="cro-cta-hint">
                  Continue to the payment screen; no card details are collected here.
                </p>
              </div>
              <div className="cro-payment-steps">
                <span>1 Review details</span>
                <span>2 Payment</span>
                <span>3 Questionnaire</span>
              </div>
              <p className="cro-demo-note">Payment is completed on Nomod. Only the OWA service fee is collected.</p>
              <details className="cro-prototype-terms">
                <summary>About this test</summary>
                <p>
                  This preview links to live Nomod checkout. Application access is not activated automatically. Service and refund terms must be finalized for production.
                </p>
              </details>
            </div>
          </div>
          <p className="cro-court-line">
            ADJD court fee: AED {courtFee.toLocaleString("en-US")}{isCouples ? " for two Wills" : " per Will"}, paid directly to ADJD later (not charged by OWA).
          </p>
        </aside>

        {/* Questions FAQ */}
        <section className="cro-questions">
          <h3>Before you continue</h3>
          <div className="pre-faq">
            <details>
              <summary>Do I need my documents now?</summary>
              <p>
                No uploads are needed at checkout. You’ll add identity documents and addresses in the questionnaire. Required details and documents must be complete before your draft can be generated.
              </p>
            </details>
            <details>
              <summary>Can I finish the questionnaire later?</summary>
              <p>
                Yes. Save your progress and return through email sign-in. This testing file stores intake only on this browser.
              </p>
            </details>
            <details>
              <summary>What happens after I pay?</summary>
              <p>
                Your questionnaire and in-app support become available. Complete the required details and documents to generate your draft{isCouples ? "; both Wills must be complete" : ""}. OWA then reviews the application before submission.
              </p>
            </details>
          </div>
          <button className="link small pre-gap" onClick={onOpenHelp}>
            Still have a question? Get help →
          </button>
        </section>
      </div>

      {/* Error alert box */}
      {errors.length > 0 && (
        <div
          id="pre-errors"
          className="errorbox show pre-gap"
          role="alert"
          tabIndex={-1}
        >
          <strong>Please check:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="actions">
        <button className="link small" onClick={onEditDetails}>
          ← Back to your details
        </button>
        <span className="savehint">Saved on this browser</span>
      </div>
    </div>
  );
}
