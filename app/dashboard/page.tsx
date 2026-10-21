"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Shield,
  CreditCard,
  Building,
  ArrowRight,
  Eye,
  MessageSquare,
  Lock,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Check,
  User,
  ExternalLink,
  Users,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { ApplicationStatus } from "@prisma/client";
import { OwaSectionId } from "@/types/owa";

const CHECKLIST_SECTIONS: { id: OwaSectionId; title: string; subtitle: string }[] = [
  {
    id: "details",
    title: "Your details",
    subtitle: "Identity, documents and residential address",
  },
  {
    id: "children",
    title: "Children",
    subtitle: "Up to five children under 18",
  },
  {
    id: "executors",
    title: "Executors",
    subtitle: "The people who will carry out your wishes",
  },
  {
    id: "guardians",
    title: "Guardians",
    subtitle: "Permanent, substitute and optional temporary",
  },
  {
    id: "beneficiaries",
    title: "Beneficiaries",
    subtitle: "Primary shares and shared substitutes",
  },
  {
    id: "review",
    title: "Review & draft",
    subtitle: "Check your details and view your draft",
  },
];

const STAGE_LABELS: Record<ApplicationStatus, { label: string; desc: string; pillColor: string }> = {
  IN_PROGRESS: {
    label: "Make your wishes clear.",
    desc: "Add the people who matter, choose their roles, and review your draft. You can save and return whenever you need.",
    pillColor: "bg-[#F0EBF9] text-[#6243AD] border-[#DFD2EF]",
  },
  DRAFT_READY: {
    label: "Your draft is ready for submission.",
    desc: "Your draft has been generated. Ready to proceed to the court registry fee submission.",
    pillColor: "bg-[#FFF4E5] text-[#95652B] border-[#F2D7B2]",
  },
  COURT_FEE_PENDING: {
    label: "Court registration fee due.",
    desc: "Please settle Milestone 2 (AED 950/1,900) to submit your application for court verification.",
    pillColor: "bg-[#FFF4E5] text-[#95652B] border-[#F2D7B2]",
  },
  AWAITING_ADMIN_VERIFICATION: {
    label: "Awaiting court verification.",
    desc: "Court fee received. Your bilingual will is locked and undergoing legal review.",
    pillColor: "bg-[#F0EBF9] text-[#6243AD] border-[#DFD2EF]",
  },
  UNDER_ADMIN_REVIEW: {
    label: "Under legal review.",
    desc: "Our ADJD court specialists are verifying Arabic transliterations and attached documents.",
    pillColor: "bg-[#EEF2F6] text-[#29213F] border-[#D4DCE5]",
  },
  ACTION_REQUIRED: {
    label: "Action required on your application.",
    desc: "The court administrator has requested additional clarification or updated document scans.",
    pillColor: "bg-[#FDEAEA] text-[#BE4743] border-[#F5C2C0] font-bold",
  },
  READY_FOR_SUBMISSION: {
    label: "Ready for court filing.",
    desc: "All quality checks passed. Application is queued for direct Abu Dhabi Judicial Department filing.",
    pillColor: "bg-[#E7F0EB] text-[#366D58] border-[#BCD4C7]",
  },
  SUBMITTED_TO_ADJD: {
    label: "Submitted to ADJD Civil Court.",
    desc: "Officially lodged with the Abu Dhabi Civil Family Court registry.",
    pillColor: "bg-[#0B1528] text-white border-[#0B1528]",
  },
  REGISTRATION_COMPLETED: {
    label: "Court registration completed.",
    desc: "Your Non-Muslim Will is officially registered and attested under Abu Dhabi Law No. 14 of 2021.",
    pillColor: "bg-[#E7F0EB] text-[#366D58] border-[#BCD4C7] font-bold",
  },
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentNotification = searchParams.get("payment");

  const {
    application,
    applicationId,
    activeWillIndex,
    setActiveWillIndex,
    isSectionComplete,
    loadApplicationFromDb,
  } = useOwaStore();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);

  useEffect(() => {
    const appIdToLoad = searchParams.get("applicationId") || applicationId;
    if (appIdToLoad) {
      fetch(`/api/applications/${appIdToLoad}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.application) {
            setAppData(data.application);
          }
        })
        .catch((err) => console.error("Failed to load application:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [applicationId, searchParams]);

  const activeApp = appData || application;
  const stage = (activeApp?.status as ApplicationStatus) || "IN_PROGRESS";
  const stageInfo = STAGE_LABELS[stage] || STAGE_LABELS.IN_PROGRESS;

  const isCouples = activeApp?.packageType === "COUPLES";
  const currentWill = activeApp?.wills?.find((w: any) => w.willIndex === activeWillIndex) || activeApp?.wills?.[0];
  const primaryWill = activeApp?.wills?.[0];

  const testatorName = currentWill?.testatorPerson?.fullName || activeApp?.account?.fullName || "You";
  const partnerWill = activeApp?.wills?.find((w: any) => w.willIndex !== activeWillIndex);
  const partnerName = partnerWill?.testatorPerson?.fullName || "Partner";

  const payments = activeApp?.payments || [];
  const initialPayment = payments.find((p: any) => p.milestone === "INITIAL_SERVICE_FEE");
  const courtPayment = payments.find((p: any) => p.milestone === "COURT_FEE");
  const isCourtFeePaid = Boolean(
    courtPayment?.status === "COMPLETED" ||
    primaryWill?.courtPaymentVerified ||
    [
      "AWAITING_ADMIN_VERIFICATION",
      "UNDER_ADMIN_REVIEW",
      "READY_FOR_SUBMISSION",
      "SUBMITTED_TO_ADJD",
      "REGISTRATION_COMPLETED",
    ].includes(stage)
  );

  const isLocked = [
    "AWAITING_ADMIN_VERIFICATION",
    "UNDER_ADMIN_REVIEW",
    "READY_FOR_SUBMISSION",
    "SUBMITTED_TO_ADJD",
    "REGISTRATION_COMPLETED",
  ].includes(stage);

  // Calculate completed sections count
  const completedCount = useMemo(() => {
    let count = 0;
    for (const sec of CHECKLIST_SECTIONS) {
      if (sec.id === "review") {
        if (currentWill?.confirmedAt || stage !== "IN_PROGRESS") count++;
      } else if (isSectionComplete(sec.id)) {
        count++;
      }
    }
    return count;
  }, [currentWill, isSectionComplete, stage]);

  // Determine next incomplete section
  const nextSection = useMemo(() => {
    for (const sec of CHECKLIST_SECTIONS) {
      if (sec.id !== "review" && !isSectionComplete(sec.id)) {
        return sec.id;
      }
    }
    return "review";
  }, [isSectionComplete]);

  const queryParamStr = activeApp?.id ? `?applicationId=${activeApp.id}` : "";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#29213F]">
      {/* Test / Dev Status Bar */}
      <div className="bg-[#29213F] text-[#F0EAF9] py-1.5 px-4 sm:px-8 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium tracking-wide">
            ONLINE WILLS ADVISOR · Abu Dhabi Civil Family Court Registration Portal
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <span>Ref: {activeApp?.applicationNumber || "OWA-DEMO-001"}</span>
          <Link href="/admin" className="hover:text-white underline text-xs">
            Admin desk ↗
          </Link>
        </div>
      </div>

      {/* Top Application Header */}
      <header className="bg-[#FFFEFA] border-b border-[#E4DFEE] px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-baseline gap-2 text-inherit no-underline">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#29213F]">
                owa
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 border-l border-[#E4DFEE] pl-2.5">
                Online Wills Advisor
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none">
            <Link
              href="/dashboard"
              className="py-1.5 px-3 rounded-lg text-[#6243AD] bg-[#F0EBF9] font-bold"
            >
              Overview
            </Link>
            <Link
              href={`/wizard/${nextSection}${queryParamStr}`}
              className="py-1.5 px-3 rounded-lg text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC] transition-colors"
            >
              My questionnaire
            </Link>
            <Link
              href={`/checkout/court-fee${queryParamStr}`}
              className="py-1.5 px-3 rounded-lg text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC] transition-colors"
            >
              Court fee
            </Link>
            <Link
              href="/dashboard/support"
              className="py-1.5 px-3 rounded-lg text-gray-600 hover:text-[#6243AD] hover:bg-[#F7F4FC] transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Support
            </Link>
          </nav>

          {/* User Profile Info & Couples Switcher */}
          <div className="flex items-center gap-3">
            {isCouples && (
              <div className="flex items-center gap-1.5 bg-[#F7F4FC] border border-[#E4DFEE] p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveWillIndex(0)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeWillIndex === 0
                      ? "bg-[#6243AD] text-white font-bold shadow-2xs"
                      : "text-gray-600 hover:text-[#29213F]"
                  }`}
                >
                  Will 1: {primaryWill?.testatorPerson?.fullName?.split(" ")[0] || "Partner 1"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWillIndex(1)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeWillIndex === 1
                      ? "bg-[#6243AD] text-white font-bold shadow-2xs"
                      : "text-gray-600 hover:text-[#29213F]"
                  }`}
                >
                  Will 2: {partnerWill?.testatorPerson?.fullName?.split(" ")[0] || "Partner 2"}
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-[#E4DFEE]">
              <div className="w-8 h-8 rounded-full bg-[#F0EBF9] text-[#6243AD] font-bold text-xs flex items-center justify-center">
                {testatorName ? testatorName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-semibold text-gray-700 hidden md:inline">
                {testatorName.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Breadcrumb & Welcome Title */}
        <div>
          <div className="text-[11px] text-gray-400 font-medium mb-1">
            My application <span className="px-1.5 text-gray-300">/</span> Overview
          </div>
          <div className="text-[10px] tracking-widest uppercase font-bold text-[#6243AD] mb-1 font-mono">
            YOUR OWA WORKSPACE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#29213F]">
            Your Will, one step at a time.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
            Welcome back, {testatorName.split(" ")[0]}. Everything you need to prepare your{" "}
            {isCouples ? "two Wills" : "Will"} is here.
          </p>
        </div>

        {/* Payment Celebration Toast */}
        {paymentNotification === "court_fee_success" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-xs sm:text-sm">
                  Court Registration Fee Successfully Paid!
                </span>
                <p className="text-xs text-emerald-800/80">
                  Your application has transitioned to Stage 4: Awaiting Admin Verification.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-lg">
              AED {isCouples ? "1,900" : "950"} Settled
            </span>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column (Hero + Checklist + Draft Card) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card with Radial Ornament */}
            <div className="relative bg-[#F0EBF9] border border-[#DFD2EF] rounded-2xl p-6 sm:p-8 overflow-hidden shadow-card-soft">
              <div className="hero-ornament" />

              <div className="relative z-10 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EDF5F0] text-[#366D58]">
                    <Check className="w-3.5 h-3.5 text-[#366D58]" />
                    OWA fee paid
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {isCouples ? "Couples package" : "Individual package"}
                  </span>
                </div>

                {/* Main Heading */}
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#29213F]">
                    {stageInfo.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg leading-relaxed">
                    {stageInfo.desc}
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  {stage === "IN_PROGRESS" && (
                    <Link
                      href={`/wizard/${nextSection}${queryParamStr}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6243AD] hover:bg-[#443074] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      <span>
                        {completedCount === 6 ? "Review questionnaire" : "Continue your questionnaire"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {(stage === "COURT_FEE_PENDING" || stage === "DRAFT_READY") && (
                    <Link
                      href={`/checkout/court-fee${queryParamStr}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#BE4743] hover:bg-[#9E3431] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      <span>Pay Court Fee (AED {isCouples ? "1,900" : "950"}) & Submit</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {stage === "ACTION_REQUIRED" && (
                    <Link
                      href="/dashboard/support"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#BE4743] hover:bg-[#9E3431] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      <span>View OWA Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {isLocked && (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/80 border border-[#DFD2EF] text-[#6243AD] text-xs font-semibold">
                      <Lock className="w-4 h-4 text-[#6243AD]" />
                      <span>Application under judicial review</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar & Status */}
                <div className="pt-3 border-t border-[#DFD2EF]/60">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">
                      {completedCount} of 6 sections complete
                      {isCouples && ` · ${testatorName.split(" ")[0]}'s Will`}
                    </span>
                    <span className="text-[11px] text-[#366D58] font-semibold flex items-center gap-1">
                      ✓ Saved to Abu Dhabi Civil Registry
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E6DFED] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6243AD] transition-all duration-500 rounded-full"
                      style={{ width: `${(completedCount / 6) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Checklist Card */}
            <div className="bg-[#FFFEFA] border border-[#E4DFEE] rounded-2xl shadow-card-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4DFEE] flex items-center justify-between">
                <h3 className="font-semibold text-sm text-[#29213F]">
                  Your preparation checklist
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${stageInfo.pillColor}`}>
                  {stage.replace(/_/g, " ")}
                </span>
              </div>

              <div className="divide-y divide-[#EEE9F3]">
                {CHECKLIST_SECTIONS.map((sec, idx) => {
                  const isDone = sec.id === "review"
                    ? Boolean(currentWill?.confirmedAt || stage !== "IN_PROGRESS")
                    : isSectionComplete(sec.id);

                  return (
                    <div
                      key={sec.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF9FC] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                            isDone
                              ? "bg-[#E7F0EB] text-[#366D58]"
                              : "bg-[#F7F4FC] text-gray-500 border border-[#E4DFEE]"
                          }`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <div className="min-w-0">
                          <strong className="text-xs font-semibold text-[#29213F] block truncate">
                            {sec.title}
                          </strong>
                          <span className="text-[11px] text-gray-500 block truncate">
                            {sec.subtitle}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/wizard/${sec.id}${queryParamStr}`}
                        className="text-xs font-semibold text-[#6243AD] hover:underline shrink-0"
                      >
                        Open →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Draft Access Card */}
            <div className="bg-[#FFFEFA] border border-[#E4DFEE] rounded-2xl p-6 shadow-card-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] tracking-wider uppercase font-bold text-[#6243AD] font-mono">
                  LATEST DRAFT · VERSION {currentWill?.version || 1}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#29213F]">
                  Your bilingual court draft is ready
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                  View your choices formatted in the statutory Abu Dhabi Civil Family Court side-by-side template (English LTR / Arabic RTL).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {primaryWill && (
                  <Link
                    href={`/will/${primaryWill.id}`}
                    className="px-4 py-2.5 bg-white border border-[#E4DFEE] hover:border-[#6243AD] text-[#6243AD] text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View draft →</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column (What happens next + Payments + Support) */}
          <div className="space-y-6">
            {/* What Happens Next Card */}
            <div className="bg-[#FFFEFA] border border-[#E4DFEE] rounded-2xl p-6 shadow-card-soft space-y-4">
              <div className="text-[10px] tracking-wider uppercase font-bold text-gray-400 font-mono">
                WHAT HAPPENS NEXT
              </div>

              <div className="space-y-4 relative">
                {[
                  {
                    title: "Complete your questionnaire",
                    desc: "Your people, documents and wishes",
                  },
                  {
                    title: "OWA checks your application",
                    desc: "Manual review of all details and documents",
                  },
                  {
                    title: "Pay ADJD directly",
                    desc: "AED 950 per Will, when instructed",
                  },
                  {
                    title: "Court registration completed",
                    desc: "Court or admin delivers the registered Will",
                  },
                ].map((st, i) => (
                  <div key={st.title} className="flex items-start gap-3 relative">
                    <span className="w-5 h-5 rounded-full bg-[#F7F4FC] border border-[#E4DFEE] text-gray-600 text-[11px] font-bold flex items-center justify-center shrink-0 z-10">
                      {i + 1}
                    </span>
                    <div className="space-y-0.5">
                      <strong className="text-xs font-semibold text-[#29213F] block">
                        {st.title}
                      </strong>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Payments Card */}
            <div className="bg-[#FFFEFA] border border-[#E4DFEE] rounded-2xl p-6 shadow-card-soft space-y-3">
              <div className="text-[10px] tracking-wider uppercase font-bold text-gray-400 font-mono">
                YOUR PAYMENTS
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-600">OWA preparation fee</span>
                <strong className="font-bold text-[#29213F] font-mono">
                  AED {isCouples ? "1,799" : "999"}
                </strong>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF5F0] text-[#366D58]">
                ✓ Paid · receipt verified
              </span>

              <hr className="border-t border-[#E4DFEE] my-2" />

              <div className="space-y-1">
                <strong className="text-xs font-bold text-[#29213F] block">
                  Court fee paid separately
                </strong>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  AED {isCouples ? "1,900 for two Wills" : "950 for one Will"}, payable directly to ADJD. This amount is not collected by OWA.
                </p>
              </div>

              <Link
                href={`/checkout/court-fee${queryParamStr}`}
                className="text-xs font-semibold text-[#6243AD] hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>View court payment guidance →</span>
              </Link>
            </div>

            {/* In-App Support Callout Box */}
            <div className="bg-[#F7F4FC] border border-[#E4DFEE] rounded-2xl p-6 shadow-card-soft space-y-2">
              <div className="flex items-center gap-2 text-[#6243AD]">
                <MessageSquare className="w-4 h-4" />
                <strong className="text-xs font-bold text-[#29213F]">
                  A little help along the way
                </strong>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Questions or missing documents? Our Abu Dhabi legal specialists are here to guide you.
              </p>
              <Link
                href="/dashboard/support"
                className="text-xs font-bold text-[#6243AD] hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Raise a support ticket →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8 text-gray-400">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
