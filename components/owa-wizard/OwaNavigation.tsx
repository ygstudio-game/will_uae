"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Shield, User, Users, FileText, HeartHandshake, Eye, AlertCircle } from "lucide-react";
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
    isSaving: storeSaving,
    isSectionComplete,
  } = useOwaStore();

  const currentSection = propSection || storeSection;
  const isSaving = propSaving ?? storeSaving;
  const isCouples = application?.packageType === "COUPLES";
  const activeWill = application?.wills?.find((w) => w.willIndex === activeWillIndex);

  const getSectionIcon = (id: OwaSectionId) => {
    switch (id) {
      case "details":
        return <User className="w-3.5 h-3.5" />;
      case "children":
        return <Users className="w-3.5 h-3.5" />;
      case "executors":
        return <Shield className="w-3.5 h-3.5" />;
      case "guardians":
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case "beneficiaries":
        return <FileText className="w-3.5 h-3.5" />;
      case "review":
        return <Eye className="w-3.5 h-3.5" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white border-b border-[#E5E0D8] sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3">
        {/* Top Header: Will index & Package badge */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E0D8]/60">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#0B1528]">
              Abu Dhabi Civil Court Non-Muslim Will
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#A37E44]/10 text-[#A37E44]">
              {application?.packageType || "INDIVIDUAL"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCouples && (
              <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                Active: Will #{activeWillIndex} ({activeWill?.testatorPerson?.fullName || "Partner"})
              </span>
            )}
            <span className="text-[11px] text-gray-400 font-mono hidden sm:inline-block">
              {isSaving ? "Saving changes..." : "Auto-saved"}
            </span>
          </div>
        </div>

        {/* 6-Section Stepper Pills */}
        <div className="pt-3 overflow-x-auto scrollbar-none flex items-center gap-2 sm:gap-3">
          {OWA_SECTIONS.map((sec, idx) => {
            const isCurrent = sec.id === currentSection;
            const isCompleted = isSectionComplete(sec.id);
            const queryStr = application?.id ? `?applicationId=${application.id}` : "";

            return (
              <Link
                key={sec.id}
                href={`/wizard/${sec.id}${queryStr}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isCurrent
                    ? "bg-[#0B1528] text-white border-[#0B1528] shadow-sm"
                    : isCompleted
                    ? "bg-[#FAF7F2] text-gray-800 border-[#E5E0D8] hover:border-gray-400"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="opacity-70 font-mono text-[10px]">0{idx + 1}.</span>
                {getSectionIcon(sec.id)}
                <span>{sec.label}</span>
                {isCompleted && !isCurrent && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
