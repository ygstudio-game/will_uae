"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWillStore } from "@/store/useWillStore";
import { useOwaStore } from "@/store/useOwaStore";
import { OwaSectionId } from "@/types/owa";
import { OwaNavigation } from "@/components/owa-wizard/OwaNavigation";
import { SectionA_Details } from "@/components/owa-wizard/SectionA_Details";
import { SectionB_Children } from "@/components/owa-wizard/SectionB_Children";
import { SectionC_Executors } from "@/components/owa-wizard/SectionC_Executors";
import { SectionD_Guardians } from "@/components/owa-wizard/SectionD_Guardians";
import { SectionE_Beneficiaries } from "@/components/owa-wizard/SectionE_Beneficiaries";
import { SectionF_ReviewDraft } from "@/components/owa-wizard/SectionF_ReviewDraft";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, AlertCircle } from "lucide-react";

// Legacy 1-16 steps
import { WizardStepper } from "@/components/wizard/WizardStepper";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { Step1Documents } from "@/components/wizard/steps/Step1Documents";
import { Step2YourDetails } from "@/components/wizard/steps/Step2YourDetails";
import { Step3Declaration } from "@/components/wizard/steps/Step3Declaration";
import { Step4Executors } from "@/components/wizard/steps/Step4Executors";
import { Step5Debts } from "@/components/wizard/steps/Step5Debts";
import { Step6Wishes } from "@/components/wizard/steps/Step6Wishes";
import { Step7Jurisdiction } from "@/components/wizard/steps/Step7Jurisdiction";
import { Step8Insurance } from "@/components/wizard/steps/Step8Insurance";
import { Step9Beneficiaries } from "@/components/wizard/steps/Step9Beneficiaries";
import { Step10Property } from "@/components/wizard/steps/Step10Property";
import { Step11Minors } from "@/components/wizard/steps/Step11Minors";
import { Step12Powers } from "@/components/wizard/steps/Step12Powers";
import { Step13Guardianship } from "@/components/wizard/steps/Step13Guardianship";
import { Step14Execution } from "@/components/wizard/steps/Step14Execution";
import { Step15Review } from "@/components/wizard/steps/Step15Review";
import { Step16Generate } from "@/components/wizard/steps/Step16Generate";

const OWA_SECTIONS: OwaSectionId[] = [
  "details",
  "children",
  "executors",
  "guardians",
  "beneficiaries",
  "review",
];

const SECTION_NAMES: Record<OwaSectionId, string> = {
  details: "Section A: Details",
  children: "Section B: Children",
  executors: "Section C: Executors",
  guardians: "Section D: Guardians",
  beneficiaries: "Section E: Beneficiaries",
  review: "Section F: Review and approve",
};

function WizardStepContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawStep = (params.step as string) || "details";

  const isOwa = OWA_SECTIONS.includes(rawStep as OwaSectionId);

  // OWA Store integration
  const {
    application,
    applicationId,
    activeWillIndex,
    isSaving,
    loadApplicationFromDb,
    saveCurrentSectionToDb,
    setCurrentSection,
    isSectionComplete,
  } = useOwaStore();

  const appIdQuery = searchParams.get("applicationId");

  useEffect(() => {
    if (appIdQuery && appIdQuery !== applicationId) {
      loadApplicationFromDb(appIdQuery);
    }
  }, [appIdQuery, applicationId, loadApplicationFromDb]);

  useEffect(() => {
    if (isOwa) {
      setCurrentSection(rawStep as OwaSectionId);
    }
  }, [isOwa, rawStep, setCurrentSection]);

  // Handle Legacy 1-16 Steps
  const legacyStepNumber = parseInt(rawStep, 10);
  const isLegacy = !isNaN(legacyStepNumber) && legacyStepNumber >= 1 && legacyStepNumber <= 16;
  const willIdParam = searchParams.get("id");
  const {
    isStepValid,
    setCurrentStep: setLegacyStep,
    activeWillId,
    loadWillFromDatabase,
  } = useWillStore();

  useEffect(() => {
    if (isLegacy) {
      if (willIdParam && willIdParam !== activeWillId) {
        loadWillFromDatabase(willIdParam);
      }
      setLegacyStep(legacyStepNumber);
    }
  }, [isLegacy, legacyStepNumber, willIdParam, activeWillId, loadWillFromDatabase, setLegacyStep]);

  if (isOwa) {
    const currentIdx = OWA_SECTIONS.indexOf(rawStep as OwaSectionId);
    const prevSection = currentIdx > 0 ? OWA_SECTIONS[currentIdx - 1] : null;
    const nextSection = currentIdx < OWA_SECTIONS.length - 1 ? OWA_SECTIONS[currentIdx + 1] : null;

    const canProceed = isSectionComplete(rawStep as OwaSectionId);

    const handleNavigate = async (targetSection: OwaSectionId) => {
      await saveCurrentSectionToDb();
      const queryStr = application?.id ? `?applicationId=${application.id}` : "";
      router.push(`/wizard/${targetSection}${queryStr}`);
    };

    const renderOwaSection = () => {
      switch (rawStep) {
        case "details":
          return <SectionA_Details />;
        case "children":
          return <SectionB_Children />;
        case "executors":
          return <SectionC_Executors />;
        case "guardians":
          return <SectionD_Guardians />;
        case "beneficiaries":
          return <SectionE_Beneficiaries />;
        case "review":
          return <SectionF_ReviewDraft />;
        default:
          return <SectionA_Details />;
      }
    };

    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between">
        <div>
          {/* Top Wizard Navigation */}
          <OwaNavigation />

          {/* Section Body */}
          <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {renderOwaSection()}
          </main>
        </div>

        {/* Wizard Bottom Controls (Only on sections A through E) */}
        {rawStep !== "review" && (
          <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#e4dfe9] py-3.5 px-4 sm:px-8 shadow-sm z-20">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <div>
                {prevSection ? (
                  <button
                    type="button"
                    onClick={() => handleNavigate(prevSection)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-[#231a30] bg-white border border-[#cfc6da] hover:border-[#382852] rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#6c6478]" />
                    <span>Back to {SECTION_NAMES[prevSection]}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold text-[#231a30] bg-white border border-[#cfc6da] hover:border-[#382852] rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#6c6478]" />
                    <span>Back to Dashboard</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[12px] font-medium text-[#2f7a55] hidden sm:inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved as you type
                </span>

                {nextSection && (
                  <button
                    type="button"
                    onClick={() => handleNavigate(nextSection)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c73a30] hover:bg-[#ad3128] text-white text-[14px] font-semibold rounded-full shadow-sm transition-colors"
                  >
                    <span>Save and continue to {SECTION_NAMES[nextSection]}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          </footer>
        )}
      </div>
    );
  }

  // Fallback to legacy 1-16 step wizard
  const isValid = isStepValid(legacyStepNumber);
  const renderLegacyStep = () => {
    switch (legacyStepNumber) {
      case 1:
        return <Step1Documents />;
      case 2:
        return <Step2YourDetails />;
      case 3:
        return <Step3Declaration />;
      case 4:
        return <Step4Executors />;
      case 5:
        return <Step5Debts />;
      case 6:
        return <Step6Wishes />;
      case 7:
        return <Step7Jurisdiction />;
      case 8:
        return <Step8Insurance />;
      case 9:
        return <Step9Beneficiaries />;
      case 10:
        return <Step10Property />;
      case 11:
        return <Step11Minors />;
      case 12:
        return <Step12Powers />;
      case 13:
        return <Step13Guardianship />;
      case 14:
        return <Step14Execution />;
      case 15:
        return <Step15Review />;
      case 16:
        return <Step16Generate />;
      default:
        return <Step1Documents />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-alabaster">
      <WizardStepper currentStep={legacyStepNumber} />

      <div className="flex-1 container mx-auto px-4 sm:px-6 max-w-4xl py-8 sm:py-10">
        {renderLegacyStep()}
      </div>

      <WizardNavigation
        currentStep={legacyStepNumber}
        isValid={isValid}
        validationMessage={!isValid ? "Please complete all required fields above" : undefined}
      />
    </div>
  );
}

export default function WizardStepPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-8 text-gray-400">Loading Wizard...</div>}>
      <WizardStepContent />
    </React.Suspense>
  );
}
