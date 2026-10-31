"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { PrePaymentModalType } from "@/types/pre-payment";

interface PrePaymentModalsProps {
  activeModal: PrePaymentModalType;
  onClose: () => void;
  onResumeEmail: (email: string) => void;
}

export function PrePaymentModals({
  activeModal,
  onClose,
  onResumeEmail,
}: PrePaymentModalsProps) {
  const [resumeEmailInput, setResumeEmailInput] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  if (!activeModal) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeEmailInput.trim() || !resumeEmailInput.includes("@")) {
      setOtpError("Enter a valid email address.");
      return;
    }
    setOtpError("");
    setCodeSent(true);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === "123456") {
      onResumeEmail(resumeEmailInput.trim().toLowerCase());
      onClose();
    } else {
      setOtpError("Enter the 6-digit test code (123456).");
    }
  };

  return (
    <div
      className="modalback"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true">
        {/* Modal 1: Sample Bilingual Will */}
        {activeModal === "sample" && (
          <>
            <div className="modalhead">
              <h2>Sample — not your personalised draft</h2>
              <button
                type="button"
                className="close"
                aria-label="Close dialog"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="modalbody">
              <div className="callout">
                <span>
                  This illustrates the bilingual layout. Your personalised draft becomes available after the required questionnaire and uploads are complete.
                </span>
              </div>
              <div className="pre-paper-cols pre-gap">
                <div>
                  <h3>Distribution of my estate</h3>
                  <p>Primary beneficiary 1: <mark>60%</mark></p>
                  <p>Primary beneficiary 2: <mark>40%</mark></p>
                  <p className="small muted">Fictional sample choices only.</p>
                </div>
                <div lang="ar" dir="rtl">
                  <h3>توزيع تركتي</h3>
                  <p>المستفيد الأول: <mark>٦٠٪</mark></p>
                  <p>المستفيد الثاني: <mark>٤٠٪</mark></p>
                  <p>نموذج توضيحي فقط</p>
                </div>
              </div>
              <hr className="divider" />
              <p className="small muted">
                Full legal clauses and translation require the approved bilingual template. This sample cannot be used as a Will.
              </p>
              <button
                type="button"
                className="btn primary pre-gap"
                onClick={onClose}
              >
                Back to where I was
              </button>
            </div>
          </>
        )}

        {/* Modal 2: Before you pay (Help) */}
        {activeModal === "help" && (
          <>
            <div className="modalhead">
              <h2>Before you pay</h2>
              <button
                type="button"
                className="close"
                aria-label="Close dialog"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="modalbody">
              <p>Get clarity on your package and documents before starting.</p>
              <div className="pre-faq">
                <details open>
                  <summary>Not sure about a scope question?</summary>
                  <p>
                    The OWA team should check your situation before payment if you answer No to age, nationality or UAE assets.
                  </p>
                </details>
                <details>
                  <summary>Missing a passport?</summary>
                  <p>
                    Passports are needed for everyone named in the Will. After payment you can raise a ticket to discuss missing documents; support does not waive the requirement automatically.
                  </p>
                </details>
              </div>
              <div className="callout pre-gap">
                <span>
                  The website chatbot will be integrated later. This sample does not send a message. Support tickets unlock only after OWA payment.
                </span>
              </div>
              <button
                type="button"
                className="btn primary pre-gap"
                onClick={onClose}
              >
                Return to application
              </button>
            </div>
          </>
        )}

        {/* Modal 3: Service Terms */}
        {activeModal === "terms" && (
          <>
            <div className="modalhead">
              <h2>Service Terms · preview information</h2>
              <button
                type="button"
                className="close"
                aria-label="Close dialog"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="modalbody">
              <p>
                This application preview links to a live Nomod payment page. Payment can be completed there, but this file cannot verify the result or activate an account.
              </p>
              <p className="pre-gap">
                Approved service, cancellation and refund terms have not been supplied in this preview. Review the applicable terms with OWA before paying.
              </p>
              <button
                type="button"
                className="btn primary pre-gap"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* Modal 4: Privacy Policy */}
        {activeModal === "privacy" && (
          <>
            <div className="modalhead">
              <h2>Privacy Policy · preview information</h2>
              <button
                type="button"
                className="close"
                aria-label="Close dialog"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="modalbody">
              <p>
                This application preview links to a live Nomod payment page. Payment can be completed there, but this file cannot verify the result or activate an account.
              </p>
              <p className="pre-gap">
                This preview stores entered text in this browser. No personal details are appended to the Nomod link. Production privacy and retention terms still need to be supplied.
              </p>
              <button
                type="button"
                className="btn primary pre-gap"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* Modal 5: Resume saved application */}
        {activeModal === "resume" && (
          <>
            <div className="modalhead">
              <h2>Resume your application.</h2>
              <button
                type="button"
                className="close"
                aria-label="Close dialog"
                onClick={onClose}
              >
                ×
              </button>
            </div>
            <div className="modalbody">
              <div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
              <p className="sub">
                Use the email entered at checkout. This file can resume one saved test application on this browser.
              </p>
              <div className="card pre-gap">
                <div className="cardbody">
                  {!codeSent ? (
                    <form onSubmit={handleSendCode}>
                      <label className="field">
                        Email address
                        <input
                          type="email"
                          autoComplete="email"
                          value={resumeEmailInput}
                          onChange={(e) => setResumeEmailInput(e.target.value)}
                        />
                      </label>
                      <button type="submit" className="btn primary pre-gap">
                        Send test code
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode}>
                      <p className="small muted">
                        Test verification code sent to <strong>{resumeEmailInput}</strong>. Use demo OTP: <strong>123456</strong>.
                      </p>
                      <label className="field pre-gap">
                        6-digit code
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                        />
                      </label>
                      <button type="submit" className="btn primary pre-gap">
                        Verify and resume
                      </button>
                    </form>
                  )}
                  {otpError && (
                    <div className="errorbox show pre-gap" role="alert">
                      {otpError}
                    </div>
                  )}
                </div>
              </div>
              <p className="small muted">
                Demo verification only; no real authentication or email delivery.
              </p>
              <button
                type="button"
                className="link"
                onClick={onClose}
              >
                Back to application start →
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
