"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "@/components/pre-payment/pre-payment.css";

import {
  PrePaymentJourneyState,
  PrePaymentPackageType,
  PrePaymentApplicant,
  PrePaymentInclusionTab,
  PrePaymentModalType,
  DEFAULT_PREPAYMENT_STATE,
} from "@/types/pre-payment";

import { PrePaymentHeader } from "./PrePaymentHeader";
import { PrePaymentProgress } from "./PrePaymentProgress";
import { Step1ChoosePackage } from "./Step1ChoosePackage";
import { Step2AboutYou } from "./Step2AboutYou";
import { Step3ReviewCheckout } from "./Step3ReviewCheckout";
import { Step4Payment } from "./Step4Payment";
import { PrePaymentModals } from "./PrePaymentModals";

const DRAFT_STORAGE_KEY = "owa_prepayment_draft_v1";

interface PrePaymentFlowProps {
  onSuccess?: (data: any) => void;
}

export function PrePaymentFlow({ onSuccess }: PrePaymentFlowProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [state, setState] = useState<PrePaymentJourneyState>(DEFAULT_PREPAYMENT_STATE);
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Restore draft from localStorage on mount (hydration safety)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.step === "number") {
          setState((prev) => ({
            ...prev,
            ...parsed,
            activeModal: null, // Always close modal on load
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to restore saved pre-payment draft from localStorage", e);
    }
  }, []);

  // Save to localStorage whenever meaningful state changes
  const saveDraft = useCallback((nextState: PrePaymentJourneyState) => {
    setState(nextState);
    try {
      const { activeModal, ...persistentData } = nextState;
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(persistentData));
    } catch (e) {
      console.warn("Failed to persist pre-payment draft to localStorage", e);
    }
  }, []);

  const handleUpdatePackage = (pkg: PrePaymentPackageType) => {
    saveDraft({
      ...state,
      packageType: pkg,
    });
  };

  const handleUpdateApplicantEligibility = (
    isPartner: boolean,
    field: keyof PrePaymentApplicant,
    value: boolean
  ) => {
    if (isPartner) {
      saveDraft({
        ...state,
        partnerApplicant: {
          ...state.partnerApplicant,
          [field]: value,
        },
      });
    } else {
      saveDraft({
        ...state,
        primaryApplicant: {
          ...state.primaryApplicant,
          [field]: value,
        },
      });
    }
  };

  const handleUpdateFullName = (fullName: string) => {
    saveDraft({
      ...state,
      fullName,
    });
  };

  const handleUpdateApplicantDetails = (
    isPartner: boolean,
    field: "married" | "children",
    value: boolean
  ) => {
    if (isPartner) {
      saveDraft({
        ...state,
        partnerApplicant: {
          ...state.partnerApplicant,
          [field]: value,
        },
      });
    } else {
      saveDraft({
        ...state,
        primaryApplicant: {
          ...state.primaryApplicant,
          [field]: value,
        },
      });
    }
  };

  const handleUpdateEmail = (email: string) => {
    saveDraft({
      ...state,
      email,
      isEmailVerified: false,
    });
  };

  const handleVerifyEmail = (isEmailVerified: boolean) => {
    saveDraft({
      ...state,
      isEmailVerified,
    });
  };

  const handleUpdatePhone = (phoneNumber: string) => {
    saveDraft({
      ...state,
      phoneNumber,
    });
  };

  const handleUpdateInclusionTab = (activeInclusionTab: PrePaymentInclusionTab) => {
    saveDraft({
      ...state,
      activeInclusionTab,
    });
  };

  const handleToggleTerms = (termsAccepted: boolean) => {
    saveDraft({
      ...state,
      termsAccepted,
    });
  };

  const handleOpenModal = (modal: PrePaymentModalType) => {
    setState((prev) => ({ ...prev, activeModal: modal }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({ ...prev, activeModal: null }));
  };

  const handleGoToStep = (step: 1 | 2 | 3 | 4) => {
    saveDraft({
      ...state,
      step,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResumeEmail = (lookupEmail: string) => {
    // If the lookup matches the saved email or state, populate and jump to review
    if (state.email && state.email.toLowerCase() === lookupEmail) {
      handleCloseModal();
      handleGoToStep(3);
    } else {
      saveDraft({
        ...state,
        email: lookupEmail,
        step: 1,
      });
      handleCloseModal();
    }
  };

  const handlePay = async () => {
    if (!state.fullName.trim() || !state.email.trim()) {
      setPayError("Full name and email address are required to finalize checkout.");
      return;
    }

    if (!state.termsAccepted) {
      setPayError("You must accept the service terms to proceed.");
      return;
    }

    setPayError(null);
    setLoading(true);

    try {
      const isCouples = state.packageType === "COUPLES";
      const res = await fetch("/api/checkout/initial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: state.fullName.trim(),
          email: state.email.trim().toLowerCase(),
          phoneNumber: state.phoneNumber.trim(),
          packageType: state.packageType,
          qualifications: {
            testatorAge21: state.primaryApplicant.age21 ?? true,
            nonUaeNational: state.primaryApplicant.nonUae ?? true,
            uaeAssets: state.primaryApplicant.uaeAssets ?? true,
            married: state.primaryApplicant.married ?? false,
            childrenUnder18: state.primaryApplicant.children ?? false,
            partnerAge21: isCouples ? (state.partnerApplicant.age21 ?? true) : null,
            partnerNonUae: isCouples ? (state.partnerApplicant.nonUae ?? true) : null,
            partnerAssets: isCouples ? (state.partnerApplicant.uaeAssets ?? true) : null,
            partnerMarried: isCouples ? (state.partnerApplicant.married ?? true) : null,
            partnerChildrenUnder18: isCouples ? (state.partnerApplicant.children ?? false) : null,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Payment verification failed. Please try again.");
      }

      // Clear draft upon successful payment & database creation
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        // ignore
      }

      await refreshUser();

      if (onSuccess) {
        onSuccess(data);
      } else {
        router.push(`/dashboard?appId=${data.applicationId}`);
      }
    } catch (err: any) {
      setPayError(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pre-wrapper">
      {/* Brand Header */}
      <PrePaymentHeader
        onOpenHelp={() => handleOpenModal("help")}
        onOpenResume={() => handleOpenModal("resume")}
        onGoToStart={() => handleGoToStep(1)}
      />

      {/* Main Container */}
      <main id="main" className="pre-main">
        {/* 4-Step Stepper */}
        <PrePaymentProgress
          currentStep={state.step}
          onStepClick={(step) => handleGoToStep(step)}
        />

        {/* Dynamic Step View */}
        {state.step === 1 && (
          <Step1ChoosePackage
            state={state}
            onUpdatePackage={handleUpdatePackage}
            onUpdateApplicantEligibility={handleUpdateApplicantEligibility}
            onOpenHelp={() => handleOpenModal("help")}
            onNext={() => handleGoToStep(2)}
          />
        )}

        {state.step === 2 && (
          <Step2AboutYou
            state={state}
            onUpdateFullName={handleUpdateFullName}
            onUpdateApplicantDetails={handleUpdateApplicantDetails}
            onBack={() => handleGoToStep(1)}
            onNext={() => handleGoToStep(3)}
          />
        )}

        {state.step === 3 && (
          <Step3ReviewCheckout
            state={state}
            onUpdateEmail={handleUpdateEmail}
            onUpdatePhone={handleUpdatePhone}
            onVerifyEmail={handleVerifyEmail}
            onUpdateInclusionTab={handleUpdateInclusionTab}
            onEditDetails={() => handleGoToStep(2)}
            onEditPackage={() => handleGoToStep(1)}
            onOpenSample={() => handleOpenModal("sample")}
            onOpenHelp={() => handleOpenModal("help")}
            onNext={() => handleGoToStep(4)}
          />
        )}

        {state.step === 4 && (
          <Step4Payment
            state={state}
            onToggleTerms={handleToggleTerms}
            onOpenTerms={() => handleOpenModal("terms")}
            onOpenPrivacy={() => handleOpenModal("privacy")}
            onOpenSample={() => handleOpenModal("sample")}
            onEditPackage={() => handleGoToStep(1)}
            onEditContact={() => handleGoToStep(3)}
            onPay={handlePay}
            loading={loading}
            error={payError}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] py-6 px-8 text-center text-xs text-[#64748B] bg-white">
        <div className="max-w-[1160px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Online Wills Advisor · Non-Muslim Will Preparation Platform</span>
          <span>Official ADJD Civil Family Court statutory template ADJD-NM1221-06-01</span>
        </div>
      </footer>

      {/* Interactive Modals */}
      <PrePaymentModals
        activeModal={state.activeModal}
        onClose={handleCloseModal}
        onResumeEmail={handleResumeEmail}
      />
    </div>
  );
}
