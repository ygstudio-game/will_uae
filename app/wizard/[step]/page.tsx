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
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";

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
    isSaving,
    isNavigatingSection,
    navigatingTarget,
    isLoadingData,
    loadingMessage,
    loadApplicationFromDb,
    syncWithDbAccount,
    saveCurrentSectionToDb,
    setCurrentSection,
    setNavigatingSection,
  } = useOwaStore();

  const appIdQuery = searchParams.get("applicationId");

  const syncedRef = React.useRef(false);

  useEffect(() => {
    if (appIdQuery) {
      if (appIdQuery !== applicationId) {
        loadApplicationFromDb(appIdQuery);
      }
    } else if (!syncedRef.current) {
      syncedRef.current = true;
      syncWithDbAccount();
    }
  }, [appIdQuery, applicationId, loadApplicationFromDb, syncWithDbAccount]);

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
  const [isNavigating, setIsNavigating] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBusy = isNavigating || isNavigatingSection || isLoadingData;
  const activeLoadingText =
    loadingMessage ||
    (navigatingTarget && STEP_INFO[navigatingTarget as OwaSectionId]?.title
      ? `Opening ${STEP_INFO[navigatingTarget as OwaSectionId].title}... Please wait a moment`
      : "Loading court application... Please wait a moment");

  const { user } = useAuth();
  const currentWill =
    application?.wills?.find((w) => w.willIndex === activeWillIndex) ||
    application?.wills?.[0];
  const testatorName =
    (mounted && currentWill?.testatorPerson?.fullName?.trim()) ||
    application?.account?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Your Name";

  const scrollToField = (fieldId?: string) => {
    if (!fieldId || typeof document === "undefined") return;
    const el = document.getElementById(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
      el.classList.add("ring-4", "ring-[#c73a30]/30", "border-[#c73a30]");
      setTimeout(() => {
        el.classList.remove("ring-4", "ring-[#c73a30]/30", "border-[#c73a30]");
      }, 2500);
    }
  };

  const handleNavigate = async (targetSection: OwaSectionId) => {
    if (isBusy) return;
    setIsNavigating(true);
    const targetTitle = STEP_INFO[targetSection]?.title || targetSection;
    setNavigatingSection(true, targetSection, `Saving & opening ${targetTitle}... Please wait a moment`);
    try {
      await saveCurrentSectionToDb();
      const queryStr = application?.id ? `?applicationId=${application.id}` : "";
      router.push(`/wizard/${targetSection}${queryStr}`);
    } catch (err) {
      console.error("Navigation error:", err);
      setIsNavigating(false);
      setNavigatingSection(false, null);
    }
  };

  const handleBack = async (targetSection?: OwaSectionId) => {
    if (isBusy) return;
    setIsNavigating(true);
    if (targetSection) {
      const targetTitle = STEP_INFO[targetSection]?.title || targetSection;
      setNavigatingSection(true, targetSection, `Opening ${targetTitle}... Please wait a moment`);
    } else {
      setNavigatingSection(true, null, "Saving & exiting to Overview... Please wait a moment");
    }
    try {
      await saveCurrentSectionToDb();
      if (targetSection) {
        const queryStr = application?.id ? `?applicationId=${application.id}` : "";
        router.push(`/wizard/${targetSection}${queryStr}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Back navigation error:", err);
      setIsNavigating(false);
      setNavigatingSection(false, null);
    }
  };

  // Section validation for "Save & continue"
  const getSectionValidation = (): { isValid: boolean; reason?: string; fieldId?: string } => {
    if (currentSectionId === "details") {
      const p = currentWill?.testatorPerson;
      if (!p?.fullName?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your full name in English.",
          fieldId: "field-fullName",
        };
      }
      if (!p?.dob) {
        return {
          isValid: false,
          reason: "Please select your date of birth.",
          fieldId: "field-dob",
        };
      }
      if (!p?.nationality?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your nationality.",
          fieldId: "field-nationality",
        };
      }
      if (!p?.passportNumber?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your passport number.",
          fieldId: "field-passportNumber",
        };
      }
      if (!p?.address?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your current home address in the UAE.",
          fieldId: "field-address",
        };
      }
      if (!currentWill?.domicileCountry?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your country of domicile.",
          fieldId: "field-domicileCountry",
        };
      }
      if (!p?.phone?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your mobile phone number.",
          fieldId: "field-phone",
        };
      }
      if (!p?.email?.trim()) {
        return {
          isValid: false,
          reason: "Please enter your email address.",
          fieldId: "field-email",
        };
      }
      return { isValid: true };
    }

    if (currentSectionId === "children") {
      const isChildrenUnanswered =
        !currentWill?.childrenAnswered &&
        (!currentWill?.roleAssignments ||
          currentWill.roleAssignments.filter((ra) => ra.role === "CHILD").length === 0);
      if (isChildrenUnanswered) {
        return { isValid: false, reason: "Please indicate whether you have children." };
      }
      return { isValid: true };
    }

    if (currentSectionId === "executors") {
      const hasPrimary = currentWill?.roleAssignments?.some((ra) => ra.role === "EXECUTOR_PRIMARY");
      if (!hasPrimary) {
        return { isValid: false, reason: "Please choose a primary executor before continuing." };
      }
      return { isValid: true };
    }

    if (currentSectionId === "guardians") {
      const children = currentWill?.roleAssignments?.filter((ra) => ra.role === "CHILD") || [];
      const hasKids = children.length > 0 || currentWill?.hasChildrenUnder18;
      if (hasKids) {
        const hasPerm = currentWill?.roleAssignments?.some((ra) => ra.role === "GUARDIAN_PERMANENT");
        if (!hasPerm) {
          return { isValid: false, reason: "Please choose a permanent guardian for children under 18." };
        }
      }
      return { isValid: true };
    }

    if (currentSectionId === "beneficiaries") {
      const primaries = (currentWill?.roleAssignments || []).filter(
        (ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY"
      );
      if (primaries.length === 0) {
        return { isValid: false, reason: "Please add at least one primary beneficiary." };
      }
      const primaryTotal = Math.round(
        primaries.reduce((sum, ra) => sum + (Number(ra.sharePercentage) || 0), 0) * 100
      ) / 100;

      if (primaryTotal > 100) {
        const excess = Math.round((primaryTotal - 100) * 100) / 100;
        return {
          isValid: false,
          reason: `Primary shares total ${primaryTotal}%. Reduce by ${excess}% before continuing.`,
        };
      }
      if (primaryTotal < 100) {
        const remaining = Math.round((100 - primaryTotal) * 100) / 100;
        return {
          isValid: false,
          reason: `Primary shares total ${primaryTotal}%. Allocate remaining ${remaining}% before continuing.`,
        };
      }

      const substitutes = (currentWill?.roleAssignments || []).filter(
        (ra) => ra.role === "BENEFICIARY_SUBSTITUTE"
      );
      if (substitutes.length === 0) {
        return { isValid: false, reason: "Please appoint Substitute A before continuing." };
      }
      const substituteTotal = Math.round(
        substitutes.reduce((sum, ra) => sum + (Number(ra.sharePercentage) || 0), 0) * 100
      ) / 100;

      if (substituteTotal !== 100) {
        return {
          isValid: false,
          reason: `Substitute shares total ${substituteTotal}%. They must total 100% before continuing.`,
        };
      }

      return { isValid: true };
    }

    return { isValid: true };
  };

  const validation = getSectionValidation();

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
      {/* Top slide-in progress indicator (Emil Kowalski feedback design) */}
      {isBusy && (
        <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center pointer-events-none transition-all duration-200">
          <div className="w-full h-1 bg-[#f0ebf9] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#8A6233] via-[#5b3fb0] to-[#8A6233] animate-pulse" />
          </div>
          <div className="mt-3 px-4 py-2 rounded-full bg-[#1b1425]/95 text-white text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-200 animate-in fade-in slide-in-from-top-2 border border-[#382852]/40">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d7b48b]" />
            <span>{activeLoadingText}</span>
          </div>
        </div>
      )}

      <div>
        {/* OWA Questionnaire Shell Layout */}
        <div className="owa-shell">
          {/* Left Sidebar */}
          <OwaSidebar currentSection={currentSectionId} />

          {/* Right Questionnaire Main Content */}
          <main className="owa-content" id="main">
            {/* Breadcrumb & Cloud Sync Status */}
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="owa-breadcrumb m-0 p-0">
                <Link href="/dashboard" className="text-[#797287] hover:underline">
                  My application
                </Link>
                <span className="px-2">/</span>
                <span>STEP {currentStepInfo.num} OF 6</span>
                <span className="px-2">/</span>
                <span className="text-[#29213f] font-medium">{currentStepInfo.title}</span>
              </div>

              {/* Real-time DB Sync Badge */}
              <div className="flex items-center gap-2 text-xs">
                {isSaving || isBusy ? (
                  <span className="flex items-center gap-1.5 text-[#6243ad] font-medium bg-[#f0ebf9] px-2.5 py-1 rounded-full border border-[#dfd2ef]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6243ad] animate-ping" />
                    Saving to database...
                  </span>
                ) : applicationId && !applicationId.startsWith("draft-") ? (
                  <span className="flex items-center gap-1.5 text-[#1f5a3d] font-medium bg-[#e8f4ee] px-2.5 py-1 rounded-full border border-[#b9dcc9]">
                    <Check className="w-3.5 h-3.5 text-[#1f5a3d]" />
                    <span>Synced with account (Database)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#797287] bg-white px-2.5 py-1 rounded-full border border-[#e4dfe9]">
                    <Check className="w-3.5 h-3.5 text-[#797287]" />
                    <span>Saved locally</span>
                  </span>
                )}
              </div>
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
            <div className="mt-6 relative min-h-[300px]">
              <div
                className={`transition-all duration-200 ease-out ${
                  isBusy
                    ? "opacity-50 filter blur-[2px] pointer-events-none select-none"
                    : "opacity-100 filter blur-0"
                }`}
              >
                {renderOwaSection()}
              </div>

              {/* Centered Loading & Wait Overlay (Emil Kowalski perceived performance) */}
              {isBusy && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-in fade-in duration-200">
                  <div className="bg-white/95 backdrop-blur-md border border-[#e5e0d8] px-6 py-5 rounded-2xl shadow-xl flex items-center gap-4 max-w-md mx-4 transition-all duration-200 animate-in zoom-in-[0.98]">
                    <div className="w-10 h-10 rounded-full bg-[#f8f5ee] border border-[#e2d8c3] flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-5 h-5 text-[#8A6233] animate-spin" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[13.5px] font-semibold text-[#1b1425]">
                        {activeLoadingText}
                      </p>
                      <p className="text-[11.5px] text-[#797287]">
                        Fetching court registry data & synchronizing records...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Navigation Controls (A through E) */}
            {rawStep !== "review" && (
              <div className="actionbar bg-white border border-[#e4dfe9] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs mt-8">
                {prevSection ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleBack(prevSection)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#cfc6da] bg-white text-[#231a30] hover:border-[#382852] font-semibold text-[14.5px] min-h-[46px] transition-transform active:scale-[0.97] duration-150 ease-out cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#6c6478]" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleBack()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#cfc6da] bg-white text-[#231a30] hover:border-[#382852] font-semibold text-[14.5px] min-h-[46px] transition-transform active:scale-[0.97] duration-150 ease-out cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#6c6478]" />
                    <span>Save and exit to Overview</span>
                  </button>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  {/* Validation Warning Alert if section requirements not met */}
                  {!validation.isValid && validation.reason && (
                    <button
                      type="button"
                      onClick={() => scrollToField(validation.fieldId)}
                      className="flex items-center gap-2 text-xs font-semibold text-[#b42318] bg-[#fef3f2] border border-[#fecdca] px-3.5 py-2 rounded-xl transition-all hover:bg-[#fee4e2] cursor-pointer text-left group"
                      title={validation.fieldId ? "Click to jump to this field" : undefined}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#b42318]" />
                      <span>{validation.reason}</span>
                      {validation.fieldId && (
                        <span className="ml-1 text-[11px] underline text-[#912018] group-hover:text-[#7a1b14] whitespace-nowrap">
                          Fix field &rarr;
                        </span>
                      )}
                    </button>
                  )}

                  {validation.isValid && (
                    <span className="text-[13px] text-[#2f7a55] font-medium hidden sm:flex items-center gap-1.5 self-center">
                      <Check className="w-4 h-4 text-[#2f7a55] shrink-0" />
                      <span>Ready to continue</span>
                    </span>
                  )}

                  {nextSection && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        if (!validation.isValid) {
                          if (validation.fieldId) {
                            scrollToField(validation.fieldId);
                          }
                          return;
                        }
                        handleNavigate(nextSection);
                      }}
                      className={`inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full font-semibold text-[14.5px] min-h-[46px] shadow-sm transition-transform active:scale-[0.97] duration-150 ease-out cursor-pointer ${
                        !validation.isValid
                          ? "bg-[#c73a30]/75 hover:bg-[#c73a30] text-white"
                          : "bg-[#c73a30] hover:bg-[#ad3128] text-white"
                      } ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={validation.reason || "Save and continue to next section"}
                    >
                      {isBusy ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Saving & continuing...</span>
                        </>
                      ) : (
                        <>
                          <span>Save & continue</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                  )}
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
