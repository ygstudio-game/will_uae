"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PrePaymentJourneyState } from "@/types/pre-payment";

interface Step2AboutYouProps {
  state: PrePaymentJourneyState;
  onUpdateFullName: (name: string) => void;
  onUpdateApplicantDetails: (
    isPartner: boolean,
    field: "married" | "children",
    value: boolean
  ) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step2AboutYou({
  state,
  onUpdateFullName,
  onUpdateApplicantDetails,
  onBack,
  onNext,
}: Step2AboutYouProps) {
  const isCouples = state.packageType === "COUPLES";
  const [errors, setErrors] = useState<string[]>([]);

  // For couples or individual, determine whether children question has been answered
  const childrenVal = isCouples
    ? state.primaryApplicant.children ?? state.partnerApplicant.children
    : state.primaryApplicant.children;

  const handleChildrenChange = (val: boolean) => {
    onUpdateApplicantDetails(false, "children", val);
    if (isCouples) {
      onUpdateApplicantDetails(true, "children", val);
      // Auto-set married for couples
      onUpdateApplicantDetails(false, "married", true);
      onUpdateApplicantDetails(true, "married", true);
    }
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const getAboutErrors = (): string[] => {
    const e: string[] = [];
    if (!state.fullName.trim()) {
      e.push("Enter your full name as shown on your passport.");
    }
    if (childrenVal === null) {
      e.push(
        isCouples
          ? "Please answer whether either of you has children under 18."
          : "Please answer whether you have any children under 18."
      );
    }
    return e;
  };

  const handleNextClick = () => {
    const errs = getAboutErrors();
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
    <div className="pre-step-2">
      {/* Pagehead matching screenshot 1 */}
      <div className="pagehead" style={{ marginBottom: "26px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "38px", color: "#160826", margin: "0 0 8px 0", fontWeight: 400 }}>
          A little about you and your family.
        </h1>
        <p className="sub" style={{ fontSize: "14.5px", color: "#6C6478", margin: 0, lineHeight: 1.6 }}>
          These details help us prepare your questionnaire. No document uploads are needed yet.
        </p>
      </div>

      <div className="cols" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 285px", gap: "24px", alignItems: "start" }}>
        {/* Left Card: Form Inputs (Matching Screenshot 1) */}
        <div
          className="card pre-details-card"
          style={{
            borderRadius: "16px",
            border: "1px solid #E5E0D8",
            background: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div className="cardbody" style={{ padding: "28px" }}>
            <label className="field" style={{ display: "block", marginBottom: "20px" }}>
              <span style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#29213F", marginBottom: "8px" }}>
                Your full name *
              </span>
              <input
                type="text"
                autoComplete="name"
                aria-required="true"
                value={state.fullName}
                placeholder=""
                onChange={(e) => {
                  onUpdateFullName(e.target.value);
                  if (errors.length > 0) setErrors([]);
                }}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "8px",
                  border: "1px solid #D5CFC7",
                  padding: "0 14px",
                  fontSize: "15px",
                  color: "#160826",
                  background: "#FFFFFF",
                  outline: "none",
                }}
              />
              <span className="hint" style={{ marginTop: "6px", display: "block", color: "#797287", fontSize: "12.5px" }}>
                Use your name as shown on your passport.
              </span>
            </label>

            {/* Single Children Sub-Card (matching Screenshot 1) */}
            <div
              style={{
                background: "#FAF7FC",
                border: "1px solid #ECE6F3",
                borderRadius: "10px",
                padding: "20px 22px",
                marginTop: "16px",
              }}
            >
              <fieldset className="pre-question" style={{ margin: 0, padding: 0, border: 0 }}>
                <legend style={{ fontSize: "14px", fontWeight: 600, color: "#1D1929", marginBottom: "12px" }}>
                  {isCouples
                    ? "Do either of you have children under 18? *"
                    : "Do you have any children under 18? *"}
                </legend>
                <div className="pre-options" style={{ display: "flex", gap: "12px" }}>
                  <label
                    className={`pre-radio ${childrenVal === true ? "selected" : ""}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: childrenVal === true ? "1.5px solid #6243AD" : "1px solid #D5CFC7",
                      background: childrenVal === true ? "#F0EBF9" : "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 500,
                      minWidth: "85px",
                    }}
                  >
                    <input
                      type="radio"
                      name="has-children"
                      value="true"
                      checked={childrenVal === true}
                      onChange={() => handleChildrenChange(true)}
                      style={{ accentColor: "#6243AD", width: "15px", height: "15px" }}
                    />
                    Yes
                  </label>
                  <label
                    className={`pre-radio ${childrenVal === false ? "selected" : ""}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: childrenVal === false ? "1.5px solid #6243AD" : "1px solid #D5CFC7",
                      background: childrenVal === false ? "#F0EBF9" : "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 500,
                      minWidth: "85px",
                    }}
                  >
                    <input
                      type="radio"
                      name="has-children"
                      value="false"
                      checked={childrenVal === false}
                      onChange={() => handleChildrenChange(false)}
                      style={{ accentColor: "#6243AD", width: "15px", height: "15px" }}
                    />
                    No
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* Right Aside: Callout Reassurance (Matching Screenshot 1) */}
        <aside
          className="callout pre-about-note"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "16px",
            padding: "26px 22px",
            background: "radial-gradient(ellipse at 85% 15%, #2a8b73 0%, #115747 65%, #093f33 100%)",
            color: "#FFFFFF",
            boxShadow: "0 8px 24px rgba(17, 87, 71, 0.16)",
          }}
        >
          {/* Subtle Watermark 02 in top right corner */}
          <span
            style={{
              position: "absolute",
              top: "-12px",
              right: "8px",
              fontSize: "96px",
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              color: "rgba(255, 255, 255, 0.08)",
              userSelect: "none",
              pointerEvents: "none",
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            02
          </span>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "21px",
                fontWeight: 400,
                color: "#FFFFFF",
                margin: "0 0 10px 0",
                letterSpacing: "-0.01em",
              }}
            >
              {isCouples ? "After payment" : "After payment"}
            </h3>
            <p style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#E0F7F0", margin: 0 }}>
              {isCouples
                ? "You’ll enter your partner’s identity and contact details. Each Will can list different children and appointments."
                : "You’ll enter your full identity and contact details in the questionnaire. Each Will can list your beneficiaries and appointments."}
            </p>
          </div>
        </aside>
      </div>

      {/* Error alert box */}
      {errors.length > 0 && (
        <div
          id="pre-errors"
          className="errorbox show pre-gap"
          role="alert"
          tabIndex={-1}
          style={{ marginTop: "20px" }}
        >
          <strong>Please check:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons matching Screenshot 1 */}
      <div
        className="actions"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid #E5E0D8",
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={onBack}
          style={{
            padding: "10px 22px",
            borderRadius: "6px",
            border: "1px solid #D5CFC7",
            background: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 500,
            color: "#29213F",
            display: "inline-flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span>← Back</span>
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={handleNextClick}
          style={{
            padding: "12px 26px",
            borderRadius: "8px",
            background: "#B83A38",
            border: "1px solid #B83A38",
            color: "#FFFFFF",
            fontSize: "13.5px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(184, 58, 56, 0.25)",
            cursor: "pointer",
          }}
        >
          <span>Review your package</span>
          <ArrowRight className="icon inline w-4 h-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
