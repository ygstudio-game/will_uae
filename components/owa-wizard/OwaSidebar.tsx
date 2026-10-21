"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOwaStore } from "@/store/useOwaStore";
import { OwaSectionId } from "@/types/owa";
import { MessageSquare, FileText, Shield, Check } from "lucide-react";

interface OwaSidebarProps {
  currentSection: OwaSectionId;
}

const STEPS: { id: OwaSectionId; num: string; label: string }[] = [
  { id: "details", num: "01", label: "Your details" },
  { id: "children", num: "02", label: "Children" },
  { id: "executors", num: "03", label: "Executors" },
  { id: "guardians", num: "04", label: "Guardians" },
  { id: "beneficiaries", num: "05", label: "Beneficiaries" },
  { id: "review", num: "06", label: "Review & draft" },
];

export function OwaSidebar({ currentSection }: OwaSidebarProps) {
  const router = useRouter();
  const {
    application,
    activeWillIndex,
    setActiveWillIndex,
    isSectionComplete,
    saveCurrentSectionToDb,
  } = useOwaStore();

  const isCouples = application?.packageType === "COUPLES" || (application?.wills?.length || 0) > 1;
  const currentWill = application?.wills?.[activeWillIndex];
  const testatorName = currentWill?.testatorPerson?.fullName || "Daniel Reyes";

  const handleStepClick = async (targetSection: OwaSectionId) => {
    if (targetSection === currentSection) return;
    await saveCurrentSectionToDb();
    const queryStr = application?.id ? `?applicationId=${application.id}` : "";
    router.push(`/wizard/${targetSection}${queryStr}`);
  };

  return (
    <aside className="w-[247px] flex-shrink-0 border-r border-[#e4dfee] p-[30px_20px] bg-[#fcfbf8] flex flex-col gap-6 select-none hidden md:flex">
      {/* Top Package / Will Switcher */}
      {isCouples ? (
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-[#29213f]">
          <span className="text-[11px] text-[#797287]">Two Wills · one application</span>
          <select
            value={activeWillIndex}
            onChange={(e) => setActiveWillIndex(Number(e.target.value))}
            className="w-full bg-white border border-[#dcd4e7] rounded-[6px] px-2.5 py-2 text-[12px] text-[#29213f] focus:outline-none focus:border-[#6243ad]"
          >
            {application?.wills?.map((w, i) => (
              <option key={w.id || i} value={i}>
                Will {i + 1} · {w.testatorPerson?.fullName || `Partner ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="px-2.5">
          <div className="text-[10px] tracking-[1.5px] uppercase font-semibold text-[#6243ad] mb-1">
            Your individual Will
          </div>
          <strong className="block text-[13.5px] text-[#29213f] font-semibold truncate">
            {testatorName}
          </strong>
          <p className="text-[11px] text-[#797287] mt-0.5">
            {application?.id ? `OWA-${application.id.slice(-6).toUpperCase()}` : "OWA-DEMO-001"}
          </p>
        </div>
      )}

      {/* Questionnaire Navigation Section */}
      <div>
        <div className="px-2.5 text-[10px] tracking-[1.5px] uppercase font-semibold text-[#6243ad] mb-2.5">
          Your questionnaire
        </div>

        {/* 6 Steps List */}
        <div className="flex flex-col gap-1">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentSection;
            const isDone = isSectionComplete(step.id);

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={`w-full flex items-center gap-3 p-[10px_11px] rounded-[7px] text-left text-[13px] font-medium transition-colors border ${
                  isActive
                    ? "bg-[#f0ebf9] text-[#6243ad] border-[#dfd2ef]"
                    : "bg-transparent text-[#29213f] border-transparent hover:bg-[#f7f4fc]"
                }`}
              >
                {/* Step number badge / checkmark */}
                <span
                  className={`w-[22px] height-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] flex-shrink-0 border font-medium ${
                    isDone
                      ? "bg-[#e7f0eb] border-transparent text-[#366d58]"
                      : isActive
                      ? "bg-white border-[#6243ad] text-[#6243ad]"
                      : "bg-[#fffefa] border-[#e4dfee] text-[#797287]"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : step.num}
                </span>

                <span className="flex-1 truncate">{step.label}</span>

                {/* Right dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isActive ? "bg-[#6243ad]" : "bg-[#cabddd]"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Actions */}
      <div className="flex flex-col gap-1 pt-2 border-t border-[#e4dfee]">
        <button
          type="button"
          onClick={() => handleStepClick("review")}
          className="w-full flex items-center gap-3 p-[9px_11px] rounded-[7px] text-left text-[12.5px] text-[#29213f] hover:bg-[#f7f4fc] transition-colors"
        >
          <FileText className="w-4 h-4 text-[#797287]" />
          <span>View latest draft</span>
        </button>

        <Link
          href="/checkout/court-fee"
          className="w-full flex items-center gap-3 p-[9px_11px] rounded-[7px] text-left text-[12.5px] text-[#29213f] hover:bg-[#f7f4fc] transition-colors"
        >
          <Shield className="w-4 h-4 text-[#797287]" />
          <span>Court registration</span>
        </Link>
      </div>

      {/* Help Box at bottom */}
      <div className="mt-auto bg-[#f7f4fc] border border-[#e4dfee] p-3.5 rounded-[8px] flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#29213f]">
          <MessageSquare className="w-4 h-4 text-[#6243ad]" />
          <strong className="text-[12px] font-semibold">A little help along the way</strong>
        </div>
        <p className="text-[11px] text-[#797287] leading-relaxed">
          Questions or missing documents? Your OWA team can help.
        </p>
        <Link
          href="/dashboard/support"
          className="text-[11.5px] font-semibold text-[#6243ad] hover:underline inline-block mt-0.5"
        >
          Raise a support ticket →
        </Link>
      </div>
    </aside>
  );
}
