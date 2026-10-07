"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QualificationForm, QualificationData } from "@/components/intake/QualificationForm";
import { OrderSummaryCard } from "@/components/intake/OrderSummaryCard";

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState<"INTAKE" | "SUMMARY">("INTAKE");
  const [qualifications, setQualifications] = useState<QualificationData | null>(null);

  const handleIntakeComplete = (data: QualificationData) => {
    setQualifications(data);
    setStep("SUMMARY");
  };

  const handleCheckoutSuccess = (resData: any) => {
    // Redirect to dashboard with active application
    router.push(`/dashboard?appId=${resData.applicationId}`);
  };

  return (
    <div className="flex-1 bg-[#FBF9F5] py-12 px-4 sm:px-6 flex flex-col justify-center">
      {step === "INTAKE" || !qualifications ? (
        <QualificationForm
          onComplete={handleIntakeComplete}
          initialData={qualifications || undefined}
        />
      ) : (
        <OrderSummaryCard
          qualifications={qualifications}
          onBack={() => setStep("INTAKE")}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
