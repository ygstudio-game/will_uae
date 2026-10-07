"use client";

import React, { useState } from "react";
import { useWillStore } from "@/store/useWillStore";
import { Party } from "@/types/will";
import { Users, Plus, Trash2, AlertCircle, CheckCircle2, User } from "lucide-react";

export function Step9Beneficiaries() {
  const { parties, addParty, updateParty, removeParty } = useWillStore();

  const primaryBen = parties.find((p) => p.role === "PRIMARY_BENEFICIARY");
  const substituteBens = parties.filter((p) => p.role === "SUBSTITUTE_BENEFICIARY");

  const totalSubstituteShare = substituteBens.reduce(
    (acc, curr) => acc + (curr.sharePercentage || 0),
    0
  );
  const isShareValid = substituteBens.length === 0 || Math.abs(totalSubstituteShare - 100) < 0.01;

  const handleUpdatePrimary = (field: keyof Party, value: any) => {
    if (primaryBen) {
      updateParty(primaryBen.id, { [field]: value });
    } else {
      addParty({
        id: "ben-primary",
        role: "PRIMARY_BENEFICIARY",
        fullName: value,
        arabicName: "",
        isArabicApproved: false,
        isUaeResident: true,
        sharePercentage: 100,
        [field]: value,
      });
    }
  };

  const handleAddSubstitute = () => {
    const remaining = Math.max(0, 100 - totalSubstituteShare);
    addParty({
      id: `ben-sub-${Date.now()}`,
      role: "SUBSTITUTE_BENEFICIARY",
      fullName: "",
      arabicName: "",
      isArabicApproved: false,
      isUaeResident: true,
      sharePercentage: remaining,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section SEVEN
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Distribution of Estate (Beneficiaries)
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Designate your primary sole beneficiary (100% of your UAE estate), and optional substitute beneficiaries if your primary beneficiary predeceases you.
        </p>
      </div>

      {/* Primary Beneficiary Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-court-tan/20 text-court-bronze flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-obsidian">Primary Sole Beneficiary</h3>
              <p className="text-xs text-gray-500">Receives 100% of your whole UAE residue estate</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-court-bronze text-white shadow-sm">
            100% Share
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Full Legal Name (English)
            </label>
            <input
              type="text"
              required
              value={primaryBen?.fullName || ""}
              onChange={(e) => handleUpdatePrimary("fullName", e.target.value)}
              placeholder="e.g. Emma Claire Carter"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Arabic Transliterated Name (الاسم باللغة العربية)
            </label>
            <input
              type="text"
              dir="rtl"
              value={primaryBen?.arabicName || ""}
              onChange={(e) => handleUpdatePrimary("arabicName", e.target.value)}
              placeholder="إيما كلير كارتر"
              className="w-full px-3 py-2.5 text-base rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-arabic font-bold text-gray-900 text-right"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={primaryBen?.dob || ""}
              onChange={(e) => handleUpdatePrimary("dob", e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Nationality
            </label>
            <input
              type="text"
              value={primaryBen?.nationality || ""}
              onChange={(e) => handleUpdatePrimary("nationality", e.target.value)}
              placeholder="e.g. British"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Passport Number
            </label>
            <input
              type="text"
              value={primaryBen?.passportNumber || ""}
              onChange={(e) => handleUpdatePrimary("passportNumber", e.target.value)}
              placeholder="e.g. GB87654321"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono font-semibold text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Substitute Beneficiaries Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-obsidian">
              Substitute Beneficiaries (Optional)
            </h3>
            <p className="text-xs text-gray-500">
              Receive your estate residue if your primary beneficiary predeceases you.
            </p>
          </div>

          {/* Allocation Total Indicator */}
          {substituteBens.length > 0 && (
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
                isShareValid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200 animate-pulse"
              }`}
            >
              <span>Allocated: {totalSubstituteShare.toFixed(1)}% / 100%</span>
              {isShareValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
          )}
        </div>

        {/* Substitute list cards */}
        {substituteBens.map((ben, idx) => (
          <div
            key={ben.id}
            className="bg-white p-5 sm:p-6 rounded-xl border border-court-border shadow-court space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-obsidian">
                Substitute Beneficiary #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeParty(ben.id)}
                className="text-xs text-gray-400 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                  Full Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={ben.fullName}
                  onChange={(e) => updateParty(ben.id, { fullName: e.target.value })}
                  placeholder="e.g. Liam James Carter"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                  Arabic Transliteration
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={ben.arabicName}
                  onChange={(e) => updateParty(ben.id, { arabicName: e.target.value })}
                  placeholder="ليام جيمس كارتر"
                  className="w-full px-3 py-2 text-base rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-arabic font-bold text-gray-900 text-right"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                  Share Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    value={ben.sharePercentage || ""}
                    onChange={(e) =>
                      updateParty(ben.id, { sharePercentage: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-bold text-court-bronze pr-8"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs text-gray-400 font-bold">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add substitute button */}
        <button
          type="button"
          onClick={handleAddSubstitute}
          className="w-full py-3.5 border-2 border-dashed border-court-border hover:border-court-bronze rounded-xl flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-court-bronze transition-colors bg-white hover:bg-alabaster"
        >
          <Plus className="w-4 h-4" />
          <span>Add Substitute Beneficiary</span>
        </button>

        {!isShareValid && (
          <p className="text-xs text-red-600 font-medium">
            Warning: The sum of substitute beneficiary shares must equal strictly 100.00%. Currently it is {totalSubstituteShare.toFixed(1)}%.
          </p>
        )}
      </div>
    </div>
  );
}
