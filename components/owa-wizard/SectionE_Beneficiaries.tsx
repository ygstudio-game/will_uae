"use client";

import React, { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  PieChart,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info,
  Edit2,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { useRouter } from "next/navigation";

export function SectionE_Beneficiaries() {
  const router = useRouter();
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
    removeRoleAssignment,
    saveCurrentSectionToDb,
  } = useOwaStore();

  const [subPage, setSubPage] = useState<0 | 1 | 2>(0); // 0: Primaries, 1: Substitutes, 2: Review

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const existingPersons = application?.persons || [];
  const testatorId = activeWill?.testatorPersonId;

  // Extract Primaries and Substitutes
  const primaryAssignments = (activeWill?.roleAssignments || [])
    .filter((ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY")
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  const substituteAssignments = (activeWill?.roleAssignments || [])
    .filter((ra) => ra.role === "BENEFICIARY_SUBSTITUTE")
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  // Calculations: Primaries
  const primaryTotal = primaryAssignments.reduce(
    (sum, ra) => sum + (Number(ra.sharePercentage) || 0),
    0
  );
  const primaryRemaining = Math.round((100 - primaryTotal) * 100) / 100;
  const isPrimaryValid =
    primaryAssignments.length >= 1 &&
    primaryAssignments.length <= 3 &&
    Math.abs(primaryTotal - 100) < 0.01 &&
    primaryAssignments.every((ra) => ra.personId && (Number(ra.sharePercentage) || 0) > 0) &&
    new Set(primaryAssignments.map((ra) => ra.personId)).size === primaryAssignments.length;

  // Calculations: Substitutes
  const substituteTotal = substituteAssignments.reduce(
    (sum, ra) => sum + (Number(ra.sharePercentage) || 0),
    0
  );
  const substituteRemaining = Math.round((100 - substituteTotal) * 100) / 100;
  const hasPrimaryAsSubstitute = substituteAssignments.some((sub) =>
    primaryAssignments.some((pri) => pri.personId === sub.personId)
  );
  const isSubstituteValid =
    substituteAssignments.length >= 1 &&
    substituteAssignments.length <= 2 &&
    Math.abs(substituteTotal - 100) < 0.01 &&
    substituteAssignments.every((ra) => ra.personId && (Number(ra.sharePercentage) || 0) > 0) &&
    new Set(substituteAssignments.map((ra) => ra.personId)).size === substituteAssignments.length &&
    !hasPrimaryAsSubstitute;

  // Handlers: Primaries
  const handleAddPrimary = async () => {
    if (primaryAssignments.length >= 3) return;

    // Default share for 1st is 100; for subsequent entries, do not auto-rebalance existing
    const defaultShare = primaryAssignments.length === 0 ? 100 : Math.max(0, primaryRemaining);
    const newPerson = await addOrUpdatePerson({
      fullName: `Primary Beneficiary ${primaryAssignments.length + 1}`,
      relationship: "Beneficiary",
      nationality: "British",
    });

    if (newPerson) {
      assignPersonToRole(
        newPerson.id,
        "BENEFICIARY_PRIMARY",
        primaryAssignments.length + 1,
        defaultShare
      );
    }
  };

  const handleUpdatePrimaryShare = (assignmentId: string, share: number) => {
    const assignment = primaryAssignments.find((ra) => ra.id === assignmentId);
    if (!assignment) return;
    assignPersonToRole(
      assignment.personId,
      "BENEFICIARY_PRIMARY",
      assignment.appointmentOrder,
      share
    );
  };

  const handleSelectExistingPrimary = (assignmentId: string, personId: string) => {
    const assignment = primaryAssignments.find((ra) => ra.id === assignmentId);
    if (!assignment) return;
    assignPersonToRole(
      personId,
      "BENEFICIARY_PRIMARY",
      assignment.appointmentOrder,
      assignment.sharePercentage || undefined
    );
  };

  // Handlers: Substitutes
  const handleAddSubstitute = async () => {
    if (substituteAssignments.length >= 2) return;

    const slotLabel = substituteAssignments.length === 0 ? "A" : "B";
    const defaultShare = substituteAssignments.length === 0 ? 100 : Math.max(0, substituteRemaining);
    const newPerson = await addOrUpdatePerson({
      fullName: `Substitute Beneficiary ${slotLabel}`,
      relationship: "Substitute Beneficiary",
      nationality: "British",
    });

    if (newPerson) {
      assignPersonToRole(
        newPerson.id,
        "BENEFICIARY_SUBSTITUTE",
        substituteAssignments.length + 1,
        defaultShare
      );
    }
  };

  const handleRemoveSubstitute = (assignmentId: string) => {
    removeRoleAssignment(assignmentId);
    // If B is removed, revert remaining A to 100%
    const remainingSubs = substituteAssignments.filter((ra) => ra.id !== assignmentId);
    if (remainingSubs.length === 1) {
      assignPersonToRole(
        remainingSubs[0].personId,
        "BENEFICIARY_SUBSTITUTE",
        1,
        100
      );
    }
  };

  const handleUpdateSubstituteShare = (assignmentId: string, share: number) => {
    const assignment = substituteAssignments.find((ra) => ra.id === assignmentId);
    if (!assignment) return;
    assignPersonToRole(
      assignment.personId,
      "BENEFICIARY_SUBSTITUTE",
      assignment.appointmentOrder,
      share
    );
  };

  const handleSelectExistingSubstitute = (assignmentId: string, personId: string) => {
    const assignment = substituteAssignments.find((ra) => ra.id === assignmentId);
    if (!assignment) return;
    assignPersonToRole(
      personId,
      "BENEFICIARY_SUBSTITUTE",
      assignment.appointmentOrder,
      assignment.sharePercentage || undefined
    );
  };

  const handleUpdatePersonDetails = async (personId: string, updates: Record<string, any>) => {
    await addOrUpdatePerson({
      id: personId,
      ...updates,
    });
  };

  const handleFinalSaveAndContinue = async () => {
    await saveCurrentSectionToDb();
    router.push(`/wizard/review?applicationId=${application?.id}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section E · Statutory Estate Distribution
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Estate Beneficiaries (Clause 7)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Allocate your UAE estate residue to primary beneficiaries, and define the shared substitute group if none survives you.
        </p>
      </div>

      {/* Stepped Sub-Navigation Pills (Matching Prototype) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setSubPage(0)}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            subPage === 0
              ? "bg-[#0B1528] text-white border-[#0B1528] shadow-sm"
              : isPrimaryValid
              ? "bg-white text-gray-800 border-emerald-200 hover:border-gray-300"
              : "bg-white text-gray-800 border-[#E5E0D8] hover:border-gray-300"
          }`}
        >
          <div className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-75">
            Step 1 of 3
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-between">
            <span>1 · Primary Beneficiaries</span>
            {isPrimaryValid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-[11px] opacity-75 mt-0.5">
            1 to 3 people · Total 100%
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubPage(1)}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            subPage === 1
              ? "bg-[#0B1528] text-white border-[#0B1528] shadow-sm"
              : isSubstituteValid
              ? "bg-white text-gray-800 border-emerald-200 hover:border-gray-300"
              : "bg-white text-gray-800 border-[#E5E0D8] hover:border-gray-300"
          }`}
        >
          <div className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-75">
            Step 2 of 3
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-between">
            <span>2 · Shared Substitutes</span>
            {isSubstituteValid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div className="text-[11px] opacity-75 mt-0.5">
            A alone or A & B · Total 100%
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSubPage(2)}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            subPage === 2
              ? "bg-[#0B1528] text-white border-[#0B1528] shadow-sm"
              : "bg-white text-gray-800 border-[#E5E0D8] hover:border-gray-300"
          }`}
        >
          <div className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-75">
            Step 3 of 3
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-between">
            <span>3 · Review Beneficiaries</span>
            {isPrimaryValid && isSubstituteValid && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div className="text-[11px] opacity-75 mt-0.5">
            Two distinct allocations
          </div>
        </button>
      </div>

      {/* =========================================================================
          SUB-PAGE 0: PRIMARY BENEFICIARIES
      ========================================================================== */}
      {subPage === 0 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#0B1528]">
                  Primary Beneficiaries
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Who should receive your estate, and what percentage should each receive?
                </p>
              </div>

              {/* Allocation badge */}
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
                  Math.abs(primaryTotal - 100) < 0.01
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <PieChart className="w-3.5 h-3.5 text-[#A37E44]" />
                <span>
                  Primary allocation: {primaryTotal.toFixed(1)}% of 100% ·{" "}
                  {Math.abs(primaryTotal - 100) < 0.01
                    ? "Fully allocated"
                    : primaryRemaining > 0
                    ? `${primaryRemaining}% remaining`
                    : `${Math.abs(primaryRemaining)}% overallocated`}
                </span>
              </div>
            </div>

            {/* Explanatory Legal Notice */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border-l-4 border-[#A37E44] text-xs text-gray-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#A37E44] shrink-0 mt-0.5" />
              <span>
                <strong>Proportional redistribution rule:</strong> If a primary beneficiary does not survive you, their share will be divided among your surviving primary beneficiaries in proportion to their original shares. If only one survives, they receive the whole estate residue.
              </span>
            </div>

            {/* List of Primaries */}
            <div className="space-y-5 pt-2">
              {primaryAssignments.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-[#E5E0D8] rounded-xl text-gray-500 text-xs">
                  No primary beneficiary added yet. Click below to add your primary sole beneficiary (100%).
                </div>
              )}

              {primaryAssignments.map((assignment, index) => {
                const person = assignment.person;
                const personId = assignment.personId;
                const isTestatorSelected = testatorId && personId === testatorId;

                return (
                  <div
                    key={assignment.id}
                    className="p-5 sm:p-6 rounded-xl border border-[#E5E0D8] bg-[#FBF9F5]/40 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[#0B1528]">
                          Primary Beneficiary {index + 1}
                        </h4>
                      </div>

                      {primaryAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoleAssignment(assignment.id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Safeguard warnings */}
                    {isTestatorSelected && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Safeguard: You (the Testator) cannot be designated as your own beneficiary.</span>
                      </div>
                    )}

                    {/* Existing Person Selector */}
                    {existingPersons.length > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#A37E44]" />
                          <span>Select an existing person:</span>
                        </div>
                        <select
                          value={personId || ""}
                          onChange={(e) => handleSelectExistingPrimary(assignment.id, e.target.value)}
                          className="px-2 py-1 rounded border border-[#E5E0D8] bg-white text-xs text-[#0B1528] font-medium max-w-[240px]"
                        >
                          <option value="">Choose a person</option>
                          {existingPersons
                            .filter((p) => p.id !== testatorId)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} ({p.relationship || p.nationality || "Person"})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Full Legal Name (English) *
                        </label>
                        <input
                          type="text"
                          defaultValue={person?.fullName || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { fullName: e.target.value })
                          }
                          placeholder="e.g. Emma Claire Carter"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs text-[#0B1528] font-medium focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Share Percentage (%) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0.01"
                            max="100"
                            step="0.01"
                            value={assignment.sharePercentage || ""}
                            onChange={(e) =>
                              handleUpdatePrimaryShare(assignment.id, parseFloat(e.target.value) || 0)
                            }
                            placeholder="100"
                            className="w-full px-3 py-2 pr-7 rounded-lg border border-[#E5E0D8] bg-white text-xs font-bold text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                          />
                          <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Arabic Script Name
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          defaultValue={person?.arabicName || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { arabicName: e.target.value })
                          }
                          placeholder="إيما كلير كارتر"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-arabic text-right text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          defaultValue={person?.passportNumber || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { passportNumber: e.target.value })
                          }
                          placeholder="e.g. GB98765432"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-mono font-medium text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          defaultValue={person?.relationship || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { relationship: e.target.value })
                          }
                          placeholder="e.g. Spouse, Son, Daughter"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Primary button (Cap at 3) */}
              <button
                type="button"
                onClick={handleAddPrimary}
                disabled={primaryAssignments.length >= 3}
                className="w-full py-3.5 border-2 border-dashed border-[#A37E44]/40 hover:border-[#A37E44] bg-[#FBF9F5] hover:bg-[#A37E44]/5 disabled:opacity-40 disabled:cursor-not-allowed text-[#A37E44] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add primary beneficiary ({primaryAssignments.length}/3)</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setSubPage(1)}
              disabled={!isPrimaryValid}
              className="px-6 py-2.5 bg-[#0B1528] hover:bg-[#101c30] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Continue to substitute beneficiaries</span>
              <ArrowRight className="w-4 h-4 text-[#A37E44]" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PAGE 1: SHARED SUBSTITUTES
      ========================================================================== */}
      {subPage === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#0B1528]">
                  If none of your primary beneficiaries survives you
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose who should receive your estate residue if none of your primary beneficiaries survives you. Give 100% to A, or divide 100% between A and B.
                </p>
              </div>

              {/* Allocation badge */}
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
                  Math.abs(substituteTotal - 100) < 0.01
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <PieChart className="w-3.5 h-3.5 text-[#A37E44]" />
                <span>
                  Substitute allocation: {substituteTotal.toFixed(1)}% of 100% ·{" "}
                  {Math.abs(substituteTotal - 100) < 0.01
                    ? "Fully allocated"
                    : substituteRemaining > 0
                    ? `${substituteRemaining}% remaining`
                    : `${Math.abs(substituteRemaining)}% overallocated`}
                </span>
              </div>
            </div>

            {/* Cross-group safeguard alert */}
            {hasPrimaryAsSubstitute && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Safeguard violation: A primary beneficiary cannot be chosen as an A or B substitute (they cannot survive a condition where all primaries have failed).</span>
              </div>
            )}

            {/* Substitute cards */}
            <div className="space-y-5 pt-2">
              {substituteAssignments.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-[#E5E0D8] rounded-xl text-gray-500 text-xs">
                  Substitute A is required. Click below to add Substitute Beneficiary A (100%).
                </div>
              )}

              {substituteAssignments.map((assignment, index) => {
                const slotLabel = index === 0 ? "A" : "B";
                const person = assignment.person;
                const personId = assignment.personId;

                return (
                  <div
                    key={assignment.id}
                    className="p-5 sm:p-6 rounded-xl border border-[#E5E0D8] bg-[#FBF9F5]/40 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#A37E44] text-white flex items-center justify-center text-xs font-bold">
                          {slotLabel}
                        </span>
                        <h4 className="text-sm font-bold text-[#0B1528]">
                          Substitute Beneficiary {slotLabel} {index === 0 ? "(Mandatory)" : "(Optional)"}
                        </h4>
                      </div>

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubstitute(assignment.id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Fallback notice exclusively under A */}
                    {index === 0 && (
                      <div className="p-3 rounded-xl bg-[#FAF7F2] border-l-4 border-[#A37E44] text-xs text-gray-700 leading-relaxed flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-[#A37E44] shrink-0 mt-0.5" />
                        <span>
                          <strong>A's children fallback clause:</strong> If this substitute distribution applies and A does not survive you or fails to take a vested interest, A's share passes to A's surviving children equally.
                        </span>
                      </div>
                    )}

                    {/* Existing Person Selector */}
                    {existingPersons.length > 0 && (
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E5E0D8] text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#A37E44]" />
                          <span>Select an existing person:</span>
                        </div>
                        <select
                          value={personId || ""}
                          onChange={(e) => handleSelectExistingSubstitute(assignment.id, e.target.value)}
                          className="px-2 py-1 rounded border border-[#E5E0D8] bg-white text-xs text-[#0B1528] font-medium max-w-[240px]"
                        >
                          <option value="">Choose a person</option>
                          {existingPersons
                            .filter(
                              (p) =>
                                p.id !== testatorId &&
                                !primaryAssignments.some((pri) => pri.personId === p.id)
                            )
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} ({p.relationship || p.nationality || "Person"})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Full Legal Name (English) *
                        </label>
                        <input
                          type="text"
                          defaultValue={person?.fullName || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { fullName: e.target.value })
                          }
                          placeholder={`e.g. David Alan Whitfield`}
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs text-[#0B1528] font-medium focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Share Percentage (%) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0.01"
                            max="100"
                            step="0.01"
                            value={assignment.sharePercentage || ""}
                            onChange={(e) =>
                              handleUpdateSubstituteShare(assignment.id, parseFloat(e.target.value) || 0)
                            }
                            placeholder="100"
                            className="w-full px-3 py-2 pr-7 rounded-lg border border-[#E5E0D8] bg-white text-xs font-bold text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                          />
                          <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Arabic Script Name
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          defaultValue={person?.arabicName || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { arabicName: e.target.value })
                          }
                          placeholder="ديفيد ألان ويتفيلد"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-arabic text-right text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          defaultValue={person?.passportNumber || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { passportNumber: e.target.value })
                          }
                          placeholder="e.g. GB12345678"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-mono font-medium text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          defaultValue={person?.relationship || ""}
                          onBlur={(e) =>
                            handleUpdatePersonDetails(personId, { relationship: e.target.value })
                          }
                          placeholder="e.g. Brother, Sister, Friend"
                          className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Substitute B button (Cap at 2) */}
              {substituteAssignments.length < 2 && (
                <button
                  type="button"
                  onClick={handleAddSubstitute}
                  className="w-full py-3.5 border-2 border-dashed border-[#A37E44]/40 hover:border-[#A37E44] bg-[#FBF9F5] hover:bg-[#A37E44]/5 text-[#A37E44] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add substitute beneficiary B ({substituteAssignments.length}/2)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSubPage(0)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to primaries</span>
            </button>

            <button
              type="button"
              onClick={() => setSubPage(2)}
              disabled={!isSubstituteValid}
              className="px-6 py-2.5 bg-[#0B1528] hover:bg-[#101c30] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Review beneficiaries</span>
              <ArrowRight className="w-4 h-4 text-[#A37E44]" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PAGE 2: REVIEW BENEFICIARIES (MATCHING PROTOTYPE)
      ========================================================================== */}
      {subPage === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
            <div className="border-b border-[#E5E0D8] pb-4">
              <span className="text-[10px] font-mono uppercase font-bold text-[#A37E44] tracking-wider">
                Step 3 of 3 · Final Allocation Verification
              </span>
              <h3 className="text-lg font-serif font-bold text-[#0B1528] mt-0.5">
                Review your beneficiaries
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                These are two alternative distributions, not a combined allocation.
              </p>
            </div>

            {/* Table 1: Primary Beneficiaries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0B1528] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B1528]"></span>
                  Primary Beneficiaries
                </h4>
                <button
                  type="button"
                  onClick={() => setSubPage(0)}
                  className="text-xs text-[#A37E44] hover:underline font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit primaries
                </button>
              </div>

              <div className="border border-[#E5E0D8] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F5] text-gray-500 font-mono uppercase text-[10px] border-b border-[#E5E0D8]">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">Person</th>
                      <th className="px-4 py-2.5 font-bold text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {primaryAssignments.map((ra) => (
                      <tr key={ra.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {ra.person?.fullName || "Not selected"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#0B1528]">
                          {ra.sharePercentage}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FAF7F2]/60 font-bold">
                      <td className="px-4 py-2.5 text-gray-700">Total Primary Allocation</td>
                      <td className="px-4 py-2.5 text-right text-[#A37E44]">
                        {primaryTotal}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-[#FBF9F5] text-xs text-gray-600 leading-relaxed border border-[#E5E0D8]/60">
                If some primary beneficiaries do not survive you, the surviving primaries share proportionally. A sole surviving primary receives 100%.
              </div>
            </div>

            {/* Table 2: Substitute Beneficiaries */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0B1528] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A37E44]"></span>
                  Shared Substitute Group
                </h4>
                <button
                  type="button"
                  onClick={() => setSubPage(1)}
                  className="text-xs text-[#A37E44] hover:underline font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit substitutes
                </button>
              </div>

              <div className="border border-[#E5E0D8] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F5] text-gray-500 font-mono uppercase text-[10px] border-b border-[#E5E0D8]">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">Person</th>
                      <th className="px-4 py-2.5 font-bold text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {substituteAssignments.map((ra, idx) => (
                      <tr key={ra.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <span className="font-bold text-[#A37E44] mr-1.5">
                            {idx === 0 ? "A ·" : "B ·"}
                          </span>
                          {ra.person?.fullName || "Not selected"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#0B1528]">
                          {ra.sharePercentage}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FAF7F2]/60 font-bold">
                      <td className="px-4 py-2.5 text-gray-700">Total Substitute Allocation</td>
                      <td className="px-4 py-2.5 text-right text-[#A37E44]">
                        {substituteTotal}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-[#FBF9F5] text-xs text-gray-600 leading-relaxed border border-[#E5E0D8]/60">
                This substitute group applies only if none of your primary beneficiaries survives you. A's surviving-children clause remains attached to A.
              </div>
            </div>

            {/* Validation errors */}
            {(!isPrimaryValid || !isSubstituteValid) && (
              <p className="text-xs text-red-600 font-semibold">
                Please complete both allocations (each strictly 100%) before proceeding to the draft review.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSubPage(1)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to substitutes</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSaveAndContinue}
              disabled={!isPrimaryValid || !isSubstituteValid}
              className="px-6 py-2.5 bg-[#0B1528] hover:bg-[#101c30] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Save and continue to draft review</span>
              <ArrowRight className="w-4 h-4 text-[#A37E44]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
