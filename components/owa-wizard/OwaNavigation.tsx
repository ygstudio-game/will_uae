"use client";

import React from "react";
import Link from "next/link";
import { Check, Shield, User, Users, FileText, HeartHandshake, Eye, AlertCircle, ArrowLeft } from "lucide-react";
import { OwaSectionId, OWA_SECTIONS } from "@/types/owa";
import { useOwaStore } from "@/store/useOwaStore";

interface OwaNavigationProps {
  currentSection?: OwaSectionId;
  onNext?: () => void;
  onPrev?: () => void;
  onOpenSupport?: () => void;
  isSaving?: boolean;
  canContinue?: boolean;
  saveError?: string | null;
}

const STEP_DEFINITIONS: { id: OwaSectionId; code: string; title: string }[] = [
  { id: "details", code: "A", title: "Your details" },
  { id: "children", code: "B", title: "Children" },
  { id: "executors", code: "C", title: "Executors" },
  { id: "guardians", code: "D", title: "Guardians" },
  { id: "beneficiaries", code: "E", title: "Beneficiaries" },
  { id: "review", code: "F", title: "Review and approve" },
];

export function OwaNavigation({
  currentSection: propSection,
  onNext,
  onPrev,
  onOpenSupport,
  isSaving: propSaving,
  canContinue = true,
  saveError,
}: OwaNavigationProps = {}) {
  const {
    currentSection: storeSection,
    application,
    activeWillIndex,
    setActiveWillIndex,
    isSaving: storeSaving,
    isSectionComplete,
  } = useOwaStore();

  const currentSection = propSection || storeSection;
  const isSaving = propSaving ?? storeSaving;
  const isCouples = application?.packageType === "COUPLES";
  const activeWill = application?.wills?.find((w) => w.willIndex === activeWillIndex) || application?.wills?.[0];
  const partnerWill = application?.wills?.find((w) => w.willIndex !== activeWillIndex);

  const testatorName = activeWill?.testatorPerson?.fullName?.split(" ")[0] || "You";
  const partnerName = partnerWill?.testatorPerson?.fullName?.split(" ")[0] || "Partner";

  const queryStr = application?.id ? `?applicationId=${application.id}` : "";

  return (
    <div className="bg-[#FFFEFA] border-b border-[#E4DFEE] sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 space-y-3">
        {/* Top Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-[#E4DFEE]/70 pb-2.5">
          {/* Will Label & Package Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-[#6243AD] flex items-center gap-1 font-semibold text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <span className="text-gray-300">|</span>

            <span className="font-serif font-bold text-sm text-[#29213F]">
              {isCouples
                ? `Will ${activeWillIndex + 1} of 2: ${testatorName}`
                : "Your Will: " + testatorName}
            </span>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0EBF9] text-[#6243AD] border border-[#DFD2EF]">
              {isCouples ? "Mirror Wills" : "Single Will"}
            </span>
          </div>

          {/* Couples Switcher & Auto-Save Indicator */}
          <div className="flex items-center gap-4">
            {isCouples && (
              <div className="flex items-center bg-[#F7F4FC] border border-[#E4DFEE] p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveWillIndex(0)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeWillIndex === 0
                      ? "bg-[#29213F] text-white shadow-2xs"
                      : "text-gray-600 hover:text-[#29213F]"
                  }`}
                >
                  Will 1: {application?.wills?.[0]?.testatorPerson?.fullName?.split(" ")[0] || "Partner 1"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWillIndex(1)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    activeWillIndex === 1
                      ? "bg-[#29213F] text-white shadow-2xs"
                      : "text-gray-600 hover:text-[#29213F]"
                  }`}
                >
                  Will 2: {partnerName}
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 text-[11px] text-[#366D58] font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving changes..." : "Saved as you type"}</span>
            </div>
          </div>
        </div>

        {/* 6 Step Pills Nav */}
        <nav aria-label="Will sections">
          <ol className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {STEP_DEFINITIONS.map((s) => {
              const isCur = s.id === currentSection;
              const isDone = isSectionComplete(s.id);

              return (
                <li key={s.id} className="shrink-0">
                  <Link
                    href={`/wizard/${s.id}${queryStr}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      isCur
                        ? "bg-[#29213F] text-white border-[#29213F] shadow-2xs font-bold"
                        : isDone
                        ? "bg-[#FFFEFA] text-gray-800 border-[#E4DFEE] hover:border-[#6243AD]"
                        : "bg-white text-gray-400 border-dashed border-[#DCD4E7] hover:text-gray-600"
                    }`}
                  >
                    {isDone && !isCur ? (
                      <span className="w-4 h-4 rounded-full bg-[#E7F0EB] text-[#366D58] flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-bold ${
                          isCur ? "text-[#D7B48B]" : "text-gray-400"
                        }`}
                      >
                        {s.code}
                      </span>
                    )}
                    <span>{s.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
