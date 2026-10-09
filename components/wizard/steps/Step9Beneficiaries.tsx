"use client";

import React, { useState } from "react";
import { useWillStore } from "@/store/useWillStore";
import { Party } from "@/types/will";
import {
  Users,
  Plus,
  Trash2,
  PieChart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Info,
  Edit2,
} from "lucide-react";

export function Step9Beneficiaries() {
  const { parties, addParty, updateParty, removeParty, testator } = useWillStore();

  const [subPage, setSubPage] = useState<0 | 1 | 2>(0); // 0: Primaries, 1: Substitutes, 2: Review

  // Extract Primaries and Substitutes
  const primaryBens = parties.filter((p) => p.role === "PRIMARY_BENEFICIARY");
  const substituteBens = parties.filter((p) => p.role === "SUBSTITUTE_BENEFICIARY");

  // Calculations: Primaries
  const primaryTotal = primaryBens.reduce(
    (acc, curr) => acc + (curr.sharePercentage || 0),
    0
  );
  const primaryRemaining = Math.round((100 - primaryTotal) * 100) / 100;
  const isPrimaryValid =
    primaryBens.length >= 1 &&
    primaryBens.length <= 3 &&
    Math.abs(primaryTotal - 100) < 0.01 &&
    primaryBens.every((p) => p.fullName?.trim() && (p.sharePercentage || 0) > 0);

  // Calculations: Substitutes
  const substituteTotal = substituteBens.reduce(
    (acc, curr) => acc + (curr.sharePercentage || 0),
    0
  );
  const substituteRemaining = Math.round((100 - substituteTotal) * 100) / 100;
  const hasPrimaryAsSubstitute = substituteBens.some((sub) =>
    primaryBens.some(
      (pri) =>
        pri.fullName?.trim().toLowerCase() === sub.fullName?.trim().toLowerCase() &&
        pri.fullName?.trim() !== ""
    )
  );
  const isSubstituteValid =
    substituteBens.length >= 1 &&
    substituteBens.length <= 2 &&
    Math.abs(substituteTotal - 100) < 0.01 &&
    substituteBens.every((p) => p.fullName?.trim() && (p.sharePercentage || 0) > 0) &&
    !hasPrimaryAsSubstitute;

  // Handlers: Primaries
  const handleAddPrimary = () => {
    if (primaryBens.length >= 3) return;
    const defaultShare = primaryBens.length === 0 ? 100 : Math.max(0, primaryRemaining);
    addParty({
      id: `ben-primary-${Date.now()}`,
      role: "PRIMARY_BENEFICIARY",
      fullName: "",
      arabicName: "",
      isArabicApproved: false,
      isUaeResident: true,
      sharePercentage: defaultShare,
    });
  };

  const handleUpdatePrimary = (id: string, field: keyof Party, value: any) => {
    updateParty(id, { [field]: value });
  };

  // Handlers: Substitutes
  const handleAddSubstitute = () => {
    if (substituteBens.length >= 2) return;
    const defaultShare = substituteBens.length === 0 ? 100 : Math.max(0, substituteRemaining);
    addParty({
      id: `ben-sub-${Date.now()}`,
      role: "SUBSTITUTE_BENEFICIARY",
      fullName: "",
      arabicName: "",
      isArabicApproved: false,
      isUaeResident: true,
      sharePercentage: defaultShare,
    });
  };

  const handleRemoveSubstitute = (id: string) => {
    removeParty(id);
    // If B is removed, revert remaining A to 100%
    const remainingSubs = substituteBens.filter((p) => p.id !== id);
    if (remainingSubs.length === 1) {
      updateParty(remainingSubs[0].id, { sharePercentage: 100 });
    }
  };

  const handleUpdateSubstitute = (id: string, field: keyof Party, value: any) => {
    updateParty(id, { [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section SEVEN
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Distribution of Estate (Beneficiaries)
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
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
              : "bg-white text-gray-800 border-court-border hover:border-gray-300"
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
              : "bg-white text-gray-800 border-court-border hover:border-gray-300"
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
              : "bg-white text-gray-800 border-court-border hover:border-gray-300"
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
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-obsidian">
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
                <PieChart className="w-3.5 h-3.5 text-court-bronze" />
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
            <div className="p-3.5 rounded-xl bg-court-tan/15 border-l-4 border-court-bronze text-xs text-gray-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-court-bronze shrink-0 mt-0.5" />
              <span>
                <strong>Proportional redistribution rule:</strong> If a primary beneficiary does not survive you, their share will be divided among your surviving primary beneficiaries in proportion to their original shares. If only one survives, they receive the whole estate residue.
              </span>
            </div>

            {/* List of Primaries */}
            <div className="space-y-5 pt-2">
              {primaryBens.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-court-border rounded-xl text-gray-500 text-xs">
                  No primary beneficiary added yet. Click below to add your primary sole beneficiary (100%).
                </div>
              )}

              {primaryBens.map((ben, index) => {
                const isTestatorSelected =
                  testator.fullName?.trim() &&
                  ben.fullName?.trim().toLowerCase() === testator.fullName.trim().toLowerCase();

                return (
                  <div
                    key={ben.id}
                    className="p-5 sm:p-6 rounded-xl border border-court-border bg-alabaster/30 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-obsidian text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-obsidian">
                          Primary Beneficiary {index + 1}
                        </h4>
                      </div>

                      {primaryBens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParty(ben.id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {isTestatorSelected && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Safeguard: You (the Testator) cannot be designated as your own beneficiary.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Full Legal Name (English) *
                        </label>
                        <input
                          type="text"
                          value={ben.fullName || ""}
                          onChange={(e) => handleUpdatePrimary(ben.id, "fullName", e.target.value)}
                          placeholder="e.g. Emma Claire Carter"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs text-obsidian font-medium focus:outline-none focus:ring-1 focus:ring-court-bronze"
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
                            value={ben.sharePercentage || ""}
                            onChange={(e) =>
                              handleUpdatePrimary(ben.id, "sharePercentage", parseFloat(e.target.value) || 0)
                            }
                            placeholder="100"
                            className="w-full px-3 py-2 pr-7 rounded-lg border border-court-border bg-white text-xs font-bold text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
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
                          value={ben.arabicName || ""}
                          onChange={(e) => handleUpdatePrimary(ben.id, "arabicName", e.target.value)}
                          placeholder="إيما كلير كارتر"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs font-arabic text-right text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          value={ben.passportNumber || ""}
                          onChange={(e) => handleUpdatePrimary(ben.id, "passportNumber", e.target.value)}
                          placeholder="e.g. GB98765432"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs font-mono font-medium text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={ben.relationship || ""}
                          onChange={(e) => handleUpdatePrimary(ben.id, "relationship", e.target.value)}
                          placeholder="e.g. Spouse, Son, Daughter"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
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
                disabled={primaryBens.length >= 3}
                className="w-full py-3.5 border-2 border-dashed border-court-bronze/40 hover:border-court-bronze bg-alabaster/50 hover:bg-court-bronze/5 disabled:opacity-40 disabled:cursor-not-allowed text-court-bronze rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add primary beneficiary ({primaryBens.length}/3)</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setSubPage(1)}
              disabled={!isPrimaryValid}
              className="px-6 py-2.5 bg-obsidian hover:bg-[#101c30] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Continue to substitute beneficiaries</span>
              <ArrowRight className="w-4 h-4 text-court-bronze" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PAGE 1: SHARED SUBSTITUTES
      ========================================================================== */}
      {subPage === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-obsidian">
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
                <PieChart className="w-3.5 h-3.5 text-court-bronze" />
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

            {hasPrimaryAsSubstitute && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Safeguard violation: A primary beneficiary cannot be chosen as an A or B substitute (they cannot survive a condition where all primaries have failed).</span>
              </div>
            )}

            <div className="space-y-5 pt-2">
              {substituteBens.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-court-border rounded-xl text-gray-500 text-xs">
                  Substitute A is required. Click below to add Substitute Beneficiary A (100%).
                </div>
              )}

              {substituteBens.map((ben, index) => {
                const slotLabel = index === 0 ? "A" : "B";

                return (
                  <div
                    key={ben.id}
                    className="p-5 sm:p-6 rounded-xl border border-court-border bg-alabaster/30 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-court-bronze text-white flex items-center justify-center text-xs font-bold">
                          {slotLabel}
                        </span>
                        <h4 className="text-sm font-bold text-obsidian">
                          Substitute Beneficiary {slotLabel} {index === 0 ? "(Mandatory)" : "(Optional)"}
                        </h4>
                      </div>

                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubstitute(ben.id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {index === 0 && (
                      <div className="p-3 rounded-xl bg-court-tan/15 border-l-4 border-court-bronze text-xs text-gray-700 leading-relaxed flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-court-bronze shrink-0 mt-0.5" />
                        <span>
                          <strong>A's children fallback clause:</strong> If this substitute distribution applies and A does not survive you or fails to take a vested interest, A's share passes to A's surviving children equally.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Full Legal Name (English) *
                        </label>
                        <input
                          type="text"
                          value={ben.fullName || ""}
                          onChange={(e) => handleUpdateSubstitute(ben.id, "fullName", e.target.value)}
                          placeholder="e.g. David Alan Whitfield"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs text-obsidian font-medium focus:outline-none focus:ring-1 focus:ring-court-bronze"
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
                            value={ben.sharePercentage || ""}
                            onChange={(e) =>
                              handleUpdateSubstitute(ben.id, "sharePercentage", parseFloat(e.target.value) || 0)
                            }
                            placeholder="100"
                            className="w-full px-3 py-2 pr-7 rounded-lg border border-court-border bg-white text-xs font-bold text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
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
                          value={ben.arabicName || ""}
                          onChange={(e) => handleUpdateSubstitute(ben.id, "arabicName", e.target.value)}
                          placeholder="ديفيد ألان ويتفيلد"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs font-arabic text-right text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          value={ben.passportNumber || ""}
                          onChange={(e) => handleUpdateSubstitute(ben.id, "passportNumber", e.target.value)}
                          placeholder="e.g. GB12345678"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs font-mono font-medium text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={ben.relationship || ""}
                          onChange={(e) => handleUpdateSubstitute(ben.id, "relationship", e.target.value)}
                          placeholder="e.g. Brother, Sister, Friend"
                          className="w-full px-3 py-2 rounded-lg border border-court-border bg-white text-xs text-obsidian focus:outline-none focus:ring-1 focus:ring-court-bronze"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {substituteBens.length < 2 && (
                <button
                  type="button"
                  onClick={handleAddSubstitute}
                  className="w-full py-3.5 border-2 border-dashed border-court-bronze/40 hover:border-court-bronze bg-alabaster/50 hover:bg-court-bronze/5 text-court-bronze rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add substitute beneficiary B ({substituteBens.length}/2)</span>
                </button>
              )}
            </div>
          </div>

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
              className="px-6 py-2.5 bg-obsidian hover:bg-[#101c30] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Review beneficiaries</span>
              <ArrowRight className="w-4 h-4 text-court-bronze" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PAGE 2: REVIEW BENEFICIARIES
      ========================================================================== */}
      {subPage === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-[10px] font-mono uppercase font-bold text-court-bronze tracking-wider">
                Step 3 of 3 · Final Allocation Verification
              </span>
              <h3 className="text-lg font-serif font-bold text-obsidian mt-0.5">
                Review your beneficiaries
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                These are two alternative distributions, not a combined allocation.
              </p>
            </div>

            {/* Table 1: Primary Beneficiaries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-obsidian uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-obsidian"></span>
                  Primary Beneficiaries
                </h4>
                <button
                  type="button"
                  onClick={() => setSubPage(0)}
                  className="text-xs text-court-bronze hover:underline font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit primaries
                </button>
              </div>

              <div className="border border-court-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-alabaster text-gray-500 font-mono uppercase text-[10px] border-b border-court-border">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">Person</th>
                      <th className="px-4 py-2.5 font-bold text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-court-border">
                    {primaryBens.map((ben) => (
                      <tr key={ben.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {ben.fullName || "Not specified"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-obsidian">
                          {ben.sharePercentage}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-court-tan/15 font-bold">
                      <td className="px-4 py-2.5 text-gray-700">Total Primary Allocation</td>
                      <td className="px-4 py-2.5 text-right text-court-bronze">
                        {primaryTotal}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-alabaster/60 text-xs text-gray-600 leading-relaxed border border-court-border">
                If some primary beneficiaries do not survive you, the surviving primaries share proportionally. A sole surviving primary receives 100%.
              </div>
            </div>

            {/* Table 2: Substitute Beneficiaries */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-obsidian uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-court-bronze"></span>
                  Shared Substitute Group
                </h4>
                <button
                  type="button"
                  onClick={() => setSubPage(1)}
                  className="text-xs text-court-bronze hover:underline font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit substitutes
                </button>
              </div>

              <div className="border border-court-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-alabaster text-gray-500 font-mono uppercase text-[10px] border-b border-court-border">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">Person</th>
                      <th className="px-4 py-2.5 font-bold text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-court-border">
                    {substituteBens.map((ben, idx) => (
                      <tr key={ben.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <span className="font-bold text-court-bronze mr-1.5">
                            {idx === 0 ? "A ·" : "B ·"}
                          </span>
                          {ben.fullName || "Not specified"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-obsidian">
                          {ben.sharePercentage}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-court-tan/15 font-bold">
                      <td className="px-4 py-2.5 text-gray-700">Total Substitute Allocation</td>
                      <td className="px-4 py-2.5 text-right text-court-bronze">
                        {substituteTotal}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-alabaster/60 text-xs text-gray-600 leading-relaxed border border-court-border">
                This substitute group applies only if none of your primary beneficiaries survives you. A's surviving-children clause remains attached to A.
              </div>
            </div>

            {(!isPrimaryValid || !isSubstituteValid) && (
              <p className="text-xs text-red-600 font-semibold">
                Please complete both allocations (each strictly 100%) to enable wizard completion.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSubPage(1)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to substitutes</span>
            </button>

            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Beneficiary allocations confirmed (use Next button below)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
