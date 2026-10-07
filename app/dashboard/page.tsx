"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { ApplicationStatus } from "@prisma/client";

const STAGE_LABELS: Record<ApplicationStatus, { label: string; desc: string; color: string }> = {
  IN_PROGRESS: {
    label: "Questionnaire In Progress",
    desc: "Complete the 6 consolidated questionnaire sections to generate your court draft.",
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  DRAFT_READY: {
    label: "Draft Generated & Reviewed",
    desc: "Your draft has been generated. Ready to proceed to court registry fee submission.",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  COURT_FEE_PENDING: {
    label: "Court Registration Fee Due",
    desc: "Please settle Milestone 2 (AED 950/1,900) to submit your application for court verification.",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  AWAITING_ADMIN_VERIFICATION: {
    label: "Awaiting Court Verification",
    desc: "Court fee received. Your bilingual will is locked and undergoing legal review.",
    color: "bg-purple-50 text-purple-800 border-purple-200",
  },
  UNDER_ADMIN_REVIEW: {
    label: "Under Legal Review",
    desc: "Our ADJD court specialists are verifying Arabic transliterations and attached documents.",
    color: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  ACTION_REQUIRED: {
    label: "Action Required",
    desc: "The court administrator has requested additional clarification or updated document scans.",
    color: "bg-red-50 text-red-800 border-red-300 font-bold",
  },
  READY_FOR_SUBMISSION: {
    label: "Ready for Court Filing",
    desc: "All quality checks passed. Application is queued for direct ADJD Judicial Department filing.",
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
  SUBMITTED_TO_ADJD: {
    label: "Submitted to ADJD Civil Court",
    desc: "Officially lodged with the Abu Dhabi Civil Family Court registry.",
    color: "bg-[#0B1528] text-white border-[#0B1528]",
  },
  REGISTRATION_COMPLETED: {
    label: "Court Registration Completed",
    desc: "Your Non-Muslim Will is officially registered and attested under Abu Dhabi Law No. 14 of 2021.",
    color: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
  },
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentNotification = searchParams.get("payment");

  const { application, applicationId, loadApplicationFromDb } = useOwaStore();
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);

  useEffect(() => {
    // If applicationId exists in store or query, load from database
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
  const primaryWill = activeApp?.wills?.[0];

  const payments = activeApp?.payments || [];
  const initialPayment = payments.find((p: any) => p.milestone === "INITIAL_SERVICE_FEE");
  const courtPayment = payments.find((p: any) => p.milestone === "COURT_FEE");

  const isEditingLocked = [
    "AWAITING_ADMIN_VERIFICATION",
    "UNDER_ADMIN_REVIEW",
    "READY_FOR_SUBMISSION",
    "SUBMITTED_TO_ADJD",
    "REGISTRATION_COMPLETED",
  ].includes(stage);

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Payment Celebration Toast */}
        {paymentNotification === "court_fee_success" && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-sm">
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

        {/* Dashboard Header */}
        <div className="bg-[#0B1528] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#E5E0D8]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#A37E44] text-xs font-semibold uppercase tracking-wider font-mono">
              <Building className="w-3.5 h-3.5" />
              Abu Dhabi Judicial Department (ADJD) Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Your UAE Will Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              Manage your court-ready bilingual will, track administrative verification stages, and communicate with our legal support specialists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/support"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/10"
            >
              <MessageSquare className="w-4 h-4 text-[#A37E44]" />
              Support Tickets
            </Link>

            <Link
              href="/admin"
              className="px-4 py-2 bg-[#A37E44] hover:bg-[#B38D48] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          </div>
        </div>

        {activeApp ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Application Status, Will Draft, Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lifecycle Stage Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A37E44] font-mono">
                      Current ADJD Stage
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#0B1528] mt-0.5">
                      {stageInfo.label}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stageInfo.color}`}>
                    {activeApp.packageType} PACKAGE
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {stageInfo.desc}
                </p>

                {/* Status action CTA */}
                <div className="pt-2">
                  {!isEditingLocked && stage !== "COURT_FEE_PENDING" && (
                    <Link
                      href={`/wizard/details?applicationId=${activeApp.id}`}
                      className="w-full sm:w-auto px-6 py-3 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Continue Questionnaire</span>
                      <ArrowRight className="w-4 h-4 text-[#A37E44]" />
                    </Link>
                  )}

                  {(stage === "COURT_FEE_PENDING" || stage === "DRAFT_READY") && (
                    <Link
                      href={`/checkout/court-fee?applicationId=${activeApp.id}`}
                      className="w-full sm:w-auto px-6 py-3 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Pay Court Fee (AED {isCouples ? "1,900" : "950"}) & Submit</span>
                      <ArrowRight className="w-4 h-4 text-[#A37E44]" />
                    </Link>
                  )}

                  {isEditingLocked && (
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>
                        Questionnaire is locked for administrative review. If you require amendments, please use the in-app support desk.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Will Draft Access Card (View-Only per PM Spec) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#A37E44]" />
                    <h3 className="text-base font-serif font-bold text-[#0B1528]">
                      Official Bilingual Will Document
                    </h3>
                  </div>
                  <span className="text-[10px] bg-[#FBF9F5] border border-[#E5E0D8] px-2.5 py-1 rounded-md text-gray-500 font-mono">
                    ADJD-NM0723-07-03
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Your will is generated in the statutory side-by-side bilingual format (English LTR / Arabic RTL) adhering strictly to Abu Dhabi Civil Family Court standards.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {primaryWill && (
                    <Link
                      href={`/will/${primaryWill.id}`}
                      className="px-4 py-2.5 bg-white border border-[#E5E0D8] hover:border-[#A37E44] text-[#0B1528] rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-4 h-4 text-[#A37E44]" />
                      View Court Document Draft (View-Only)
                    </Link>
                  )}

                  <Link
                    href={`/wizard/review?applicationId=${activeApp.id}`}
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                  >
                    <span>Audit Checklist & Verification</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Two-Stage Milestone Billing & Direct Support */}
            <div className="space-y-6">
              {/* Milestone Billing Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#A37E44]" />
                  Two-Stage Milestone Billing
                </h4>

                <div className="space-y-3 pt-1">
                  {/* Milestone 1 */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Stage 1: Preparation Fee
                      </div>
                      <p className="text-[11px] text-emerald-800/80 mt-0.5">
                        Platform draft generation
                      </p>
                    </div>
                    <span className="font-bold text-emerald-900 font-mono">
                      AED {isCouples ? "1,799" : "999"} (Paid)
                    </span>
                  </div>

                  {/* Milestone 2 */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                      courtPayment
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : "bg-amber-50/70 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        {courtPayment ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        Stage 2: ADJD Court Registry Fee
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Filing & Attestation
                      </p>
                    </div>
                    <span className="font-bold font-mono">
                      AED {isCouples ? "1,900" : "950"}{" "}
                      {courtPayment ? "(Paid)" : "(Pending)"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-between text-xs font-bold text-[#0B1528]">
                    <span>Total Fixed Cost:</span>
                    <span>AED {isCouples ? "3,699" : "1,949"}</span>
                  </div>
                </div>
              </div>

              {/* Direct Support Callout */}
              <div className="bg-[#0B1528] text-white p-6 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#A37E44]" />
                  <h4 className="text-sm font-semibold">Need Legal Help?</h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Have questions about consular passport documentation or court video attestations?
                </p>
                <Link
                  href="/dashboard/support"
                  className="w-full py-2.5 bg-[#A37E44] hover:bg-[#B38D48] text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open In-App Support Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-[#E5E0D8] text-center space-y-4 max-w-lg mx-auto">
            <FileText className="w-12 h-12 text-[#A37E44] mx-auto" />
            <h2 className="text-xl font-serif font-bold text-[#0B1528]">
              Ready to Prepare Your UAE Will?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Complete our 7-question qualification intake and start your bilingual Abu Dhabi Non-Muslim Will.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <span>Begin Qualification Intake</span>
              <ArrowRight className="w-4 h-4 text-[#A37E44]" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-8 text-gray-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </React.Suspense>
  );
}
