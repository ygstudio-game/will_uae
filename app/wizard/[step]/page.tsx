"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useOwaStore } from "@/store/useOwaStore";
import { useAuth } from "@/context/AuthContext";
import { OwaSectionId } from "@/types/owa";
import { OwaSidebar } from "@/components/owa-wizard/OwaSidebar";
import { OwaFooter } from "@/components/common/OwaFooter";
import { CustomerSubNav } from "@/components/navigation/CustomerSubNav";
import { SectionA_Details } from "@/components/owa-wizard/SectionA_Details";
import { SectionB_Children } from "@/components/owa-wizard/SectionB_Children";
import { SectionC_Executors } from "@/components/owa-wizard/SectionC_Executors";
import { SectionD_Guardians } from "@/components/owa-wizard/SectionD_Guardians";
import { SectionE_Beneficiaries } from "@/components/owa-wizard/SectionE_Beneficiaries";
import { SectionF_ReviewDraft } from "@/components/owa-wizard/SectionF_ReviewDraft";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const OWA_SECTIONS: OwaSectionId[] = [
  "details",
  "children",
  "executors",
  "guardians",
  "beneficiaries",
  "review",
];

const STEP_INFO: Record<OwaSectionId, { num: number; title: string; sub: string }> = {
  details: {
    num: 1,
    title: "Your details",
    sub: "Upload your documents, then check your personal details.",
  },
  children: {
    num: 2,
    title: "Children",
    sub: "Tell us about the children who need guardian appointments.",
  },
  executors: {
    num: 3,
    title: "Executors",
    sub: "Choose who will carry out the instructions in your Will.",
  },
  guardians: {
    num: 4,
    title: "Guardians",
    sub: "Choose one set of guardians for all your children under 18.",
  },
  beneficiaries: {
    num: 5,
    title: "Beneficiaries",
    sub: "Choose who receives your estate and how it is shared.",
  },
  review: {
    num: 6,
    title: "Review & draft",
    sub: "Check each section before your application goes to OWA.",
  },
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
    loadApplicationFromDb,
    saveCurrentSectionToDb,
    setCurrentSection,
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
    } else {
      router.replace(`/wizard/details${appIdQuery ? `?applicationId=${appIdQuery}` : ""}`);
    }
  }, [isOwa, rawStep, setCurrentSection, router, appIdQuery]);

  if (!isOwa) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8 text-gray-500">
        Redirecting to questionnaire...
      </div>
    );
  }

  const currentSectionId = rawStep as OwaSectionId;
  const currentStepInfo = STEP_INFO[currentSectionId] || STEP_INFO.details;
  const currentIdx = OWA_SECTIONS.indexOf(currentSectionId);
  const prevSection = currentIdx > 0 ? OWA_SECTIONS[currentIdx - 1] : null;
  const nextSection = currentIdx < OWA_SECTIONS.length - 1 ? OWA_SECTIONS[currentIdx + 1] : null;

  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user } = useAuth();
  const currentWill = application?.wills?.[activeWillIndex];
  const testatorName =
    (mounted && currentWill?.testatorPerson?.fullName?.trim()) ||
    application?.account?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Your Name";

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
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between">
      <div>
        <CustomerSubNav />
        {/* OWA Questionnaire Shell Layout */}
        <div className="owa-shell">
          {/* Left Sidebar */}
          <OwaSidebar currentSection={currentSectionId} />

          {/* Right Questionnaire Main Content */}
          <main className="owa-content" id="main">
            {/* Breadcrumb */}
            <div className="owa-breadcrumb">
              <Link href="/dashboard" className="text-[#797287] hover:underline">
                My application
              </Link>
              <span className="px-2">/</span>
              <span>STEP {currentStepInfo.num} OF 6</span>
              <span className="px-2">/</span>
              <span className="text-[#29213f] font-medium">{currentStepInfo.title}</span>
            </div>

            {/* Page Head */}
            <div className="owa-pagehead">
              <div suppressHydrationWarning className="text-[10px] tracking-[1.5px] uppercase font-semibold text-[#6243ad] mb-2">
                STEP {currentStepInfo.num} OF 6 · {testatorName.toUpperCase()}
              </div>
              <h1 className="font-serif text-[34px] sm:text-[38px] text-[#29213f] font-normal tracking-[-0.7px] leading-tight">
                {currentStepInfo.title}
              </h1>
              <p className="sub text-[14px] text-[#797287] max-w-[620px] mt-2 leading-relaxed">
                {currentStepInfo.sub}
              </p>
            </div>

            {/* Questionnaire Form Section */}
            <div className="mt-6">
              {renderOwaSection()}
            </div>

            {/* Action Navigation Controls (A through E) */}
            {rawStep !== "review" && (
              <div className="owa-actions flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[#e4dfee]">
                {prevSection ? (
                  <button
                    type="button"
                    onClick={() => handleNavigate(prevSection)}
                    className="owa-btn"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#797287]" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="owa-btn"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#797287]" />
                    <span>Back to overview</span>
                  </button>
                )}

                <div className="flex items-center gap-4">
                  <span className="owa-savehint text-[11.5px] text-[#797287] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#366d58] shrink-0" />
                    <span>Saved as you type</span>
                  </span>

                  {nextSection && (() => {
                    const isChildrenUnanswered =
                      currentSectionId === "children" &&
                      !currentWill?.childrenAnswered &&
                      (!currentWill?.roleAssignments ||
                        currentWill.roleAssignments.filter((ra) => ra.role === "CHILD").length === 0);

                    return (
                      <button
                        type="button"
                        disabled={isChildrenUnanswered}
                        onClick={() => {
                          if (isChildrenUnanswered) {
                            const q = document.querySelector("#children-question");
                            if (q) q.scrollIntoView({ behavior: "smooth" });
                            return;
                          }
                          handleNavigate(nextSection);
                        }}
                        className={`owa-btn primary ${isChildrenUnanswered ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={isChildrenUnanswered ? "Please choose Yes or No above" : ""}
                      >
                        <span>Save & continue</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer matching owa-platform-prototype.html */}
      <OwaFooter />
    </div>
  );
}

export default function WizardStepPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8 text-gray-400">Loading Questionnaire...</div>}>
      <WizardStepContent />
    </React.Suspense>
  );
}
