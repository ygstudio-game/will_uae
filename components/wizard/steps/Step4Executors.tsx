"use client";

import React, { useState } from "react";
import { useWillStore } from "@/store/useWillStore";
import { Party } from "@/types/will";
import { UserCheck, Plus, Trash2, Shield, User } from "lucide-react";

export function Step4Executors() {
  const { parties, addParty, updateParty, removeParty } = useWillStore();

  const primaryExec = parties.find((p) => p.role === "PRIMARY_EXECUTOR");
  const substituteExec = parties.find((p) => p.role === "SUBSTITUTE_EXECUTOR");
  const furtherExec = parties.find((p) => p.role === "FURTHER_EXECUTOR");

  const [showSubstitute, setShowSubstitute] = useState(Boolean(substituteExec));
  const [showFurther, setShowFurther] = useState(Boolean(furtherExec));

  const handleUpdate = (role: Party["role"], field: keyof Party, value: any) => {
    const existing = parties.find((p) => p.role === role);
    if (existing) {
      updateParty(existing.id, { [field]: value });
    } else {
      addParty({
        id: `exec-${Date.now()}`,
        role,
        fullName: value,
        arabicName: "",
        isArabicApproved: false,
        isUaeResident: false,
        [field]: value,
      });
    }
  };

  const handleAddSubstitute = () => {
    setShowSubstitute(true);
    if (!substituteExec) {
      addParty({
        id: `exec-${Date.now()}`,
        role: "SUBSTITUTE_EXECUTOR",
        fullName: "James Robert Carter",
        arabicName: "جيمس روبرت كارتر",
        isArabicApproved: true,
        dob: "1991-11-05",
        nationality: "British",
        passportNumber: "GB66778899",
        isUaeResident: false,
        address: "8 The Meadows, Cambridge CB2 1TJ, UK",
        email: "james.carter@example.co.uk",
        phone: "+44 7700 900456",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section TWO
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Appointment of Executors & Trustees
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Executors are responsible for administering your estate, settling lawful debts, and distributing assets to your beneficiaries in accordance with your Will.
        </p>
      </div>

      {/* Primary Executor Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-court-tan/20 text-court-bronze flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-obsidian">Primary Executor</h3>
              <p className="text-xs text-gray-500">Sole primary appointment under Section TWO</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Mandatory
          </span>
        </div>

        {/* Primary Executor fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Full Legal Name (English)
            </label>
            <input
              type="text"
              required
              value={primaryExec?.fullName || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "fullName", e.target.value)}
              placeholder="e.g. Sarah Elizabeth Carter"
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
              value={primaryExec?.arabicName || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "arabicName", e.target.value)}
              placeholder="سارة إليزابيث كارتر"
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
              value={primaryExec?.dob || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "dob", e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Nationality
            </label>
            <input
              type="text"
              value={primaryExec?.nationality || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "nationality", e.target.value)}
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
              value={primaryExec?.passportNumber || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "passportNumber", e.target.value)}
              placeholder="e.g. GB55443322"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono font-semibold text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Residential Address
            </label>
            <input
              type="text"
              value={primaryExec?.address || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "address", e.target.value)}
              placeholder="Full residential address"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Contact Email & Phone
            </label>
            <input
              type="text"
              value={primaryExec?.email || ""}
              onChange={(e) => handleUpdate("PRIMARY_EXECUTOR", "email", e.target.value)}
              placeholder="email@example.com / +44 7700 900123"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Substitute Executor Card */}
      {showSubstitute && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-court-tan/20 text-court-bronze flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base text-obsidian">Substitute Executor (Optional)</h3>
                <p className="text-xs text-gray-500">Acts if Primary Executor predeceases or cannot act</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (substituteExec) removeParty(substituteExec.id);
                setShowSubstitute(false);
              }}
              className="text-xs text-gray-400 hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={substituteExec?.fullName || ""}
                onChange={(e) => handleUpdate("SUBSTITUTE_EXECUTOR", "fullName", e.target.value)}
                placeholder="e.g. James Robert Carter"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                Arabic Transliteration
              </label>
              <input
                type="text"
                dir="rtl"
                value={substituteExec?.arabicName || ""}
                onChange={(e) => handleUpdate("SUBSTITUTE_EXECUTOR", "arabicName", e.target.value)}
                placeholder="جيمس روبرت كارتر"
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
                value={substituteExec?.dob || ""}
                onChange={(e) => handleUpdate("SUBSTITUTE_EXECUTOR", "dob", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                Nationality
              </label>
              <input
                type="text"
                value={substituteExec?.nationality || ""}
                onChange={(e) => handleUpdate("SUBSTITUTE_EXECUTOR", "nationality", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                Passport Number
              </label>
              <input
                type="text"
                value={substituteExec?.passportNumber || ""}
                onChange={(e) => handleUpdate("SUBSTITUTE_EXECUTOR", "passportNumber", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono text-gray-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Button to add substitute if not shown */}
      {!showSubstitute && (
        <button
          type="button"
          onClick={handleAddSubstitute}
          className="w-full py-4 border-2 border-dashed border-court-border hover:border-court-bronze rounded-xl flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-court-bronze transition-colors bg-white hover:bg-alabaster"
        >
          <Plus className="w-4 h-4" />
          <span>Add Substitute Executor (Optional)</span>
        </button>
      )}
    </div>
  );
}
