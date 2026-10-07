"use client";

import React, { useState } from "react";
import { ApplicationStatus } from "@prisma/client";
import { CheckCircle2, ArrowRight, AlertTriangle, ShieldCheck, Clock, Building } from "lucide-react";

interface StatusPipelineControllerProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  onStatusUpdated: (newStatus: ApplicationStatus) => void;
}

const STAGES: { key: ApplicationStatus; label: string; order: number }[] = [
  { key: "IN_PROGRESS", label: "Questionnaire In Progress", order: 1 },
  { key: "DRAFT_READY", label: "Draft Generated", order: 2 },
  { key: "COURT_FEE_PENDING", label: "Court Fee Pending", order: 3 },
  { key: "AWAITING_ADMIN_VERIFICATION", label: "Awaiting Verification", order: 4 },
  { key: "UNDER_ADMIN_REVIEW", label: "Under Legal Review", order: 5 },
  { key: "ACTION_REQUIRED", label: "Action Required", order: 6 },
  { key: "READY_FOR_SUBMISSION", label: "Ready for ADJD Filing", order: 7 },
  { key: "SUBMITTED_TO_ADJD", label: "Submitted to Court", order: 8 },
  { key: "REGISTRATION_COMPLETED", label: "Registration Completed", order: 9 },
];

export function StatusPipelineController({
  applicationId,
  currentStatus,
  onStatusUpdated,
}: StatusPipelineControllerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(currentStatus);

  const currentStageObj = STAGES.find((s) => s.key === currentStatus) || STAGES[0];
  const nextStageObj = STAGES.find((s) => s.order === currentStageObj.order + 1);

  const handleUpdateStatus = async (statusToSet: ApplicationStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusToSet }),
      });
      const data = await res.json();
      if (data.success) {
        onStatusUpdated(statusToSet);
        setSelectedStatus(statusToSet);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A37E44] font-mono">
            Pipeline Management · ADJD Judicial Department Process
          </span>
          <h3 className="text-base font-serif font-bold text-[#0B1528] flex items-center gap-2 mt-0.5">
            <Building className="w-4 h-4 text-[#A37E44]" />
            Official 9-Stage Status Lifecycle
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Current Stage:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0B1528] text-white">
            Stage {currentStageObj.order}: {currentStageObj.label}
          </span>
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center">
        {STAGES.map((s) => {
          const isPassed = s.order < currentStageObj.order;
          const isCurrent = s.key === currentStatus;

          return (
            <div
              key={s.key}
              onClick={() => handleUpdateStatus(s.key)}
              className={`p-2 rounded-xl text-left cursor-pointer transition-all border ${
                isCurrent
                  ? "bg-[#0B1528] text-white border-[#0B1528] shadow-sm ring-2 ring-[#A37E44]"
                  : isPassed
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                <span>#{s.order}</span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </div>
              <p className="text-[11px] font-semibold leading-tight line-clamp-2">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Admin Fast Actions */}
      <div className="pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {nextStageObj && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus(nextStageObj.key)}
              className="px-4 py-2 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>Advance to: {nextStageObj.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A37E44]" />
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdateStatus("ACTION_REQUIRED")}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Flag Action Required (Notify Client)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Jump to:</label>
          <select
            value={currentStatus}
            onChange={(e) => handleUpdateStatus(e.target.value as ApplicationStatus)}
            className="px-3 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#A37E44]"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                Stage {s.order}: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
