"use client";

import React, { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWillStore } from "@/store/useWillStore";
import { WizardStepper } from "@/components/wizard/WizardStepper";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";

// Steps 1 to 16 components
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

export default function WizardStepPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepNumber = parseInt(params.step as string, 10) || 1;
  const willIdParam = searchParams.get("id");
  const { isStepValid, setCurrentStep, activeWillId, loadWillFromDatabase } = useWillStore();

  useEffect(() => {
    if (willIdParam && willIdParam !== activeWillId) {
      loadWillFromDatabase(willIdParam);
    }
  }, [willIdParam, activeWillId, loadWillFromDatabase]);

  useEffect(() => {
    if (stepNumber >= 1 && stepNumber <= 16) {
      setCurrentStep(stepNumber);
    }
  }, [stepNumber, setCurrentStep]);

  const isValid = isStepValid(stepNumber);

  const renderStep = () => {
    switch (stepNumber) {
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
      <WizardStepper currentStep={stepNumber} />

      <div className="flex-1 container mx-auto px-4 sm:px-6 max-w-4xl py-8 sm:py-10">
        {renderStep()}
      </div>

      <WizardNavigation
        currentStep={stepNumber}
        isValid={isValid}
        validationMessage={!isValid ? "Please complete all required fields above" : undefined}
      />
    </div>
  );
}
