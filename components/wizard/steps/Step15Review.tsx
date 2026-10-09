"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWillStore } from "@/store/useWillStore";
import { CheckCircle2, AlertCircle, Edit3, Languages, ShieldCheck, Check } from "lucide-react";

export function Step15Review() {
  const { testator, parties, children, approveArabicName } = useWillStore();

  // Consolidate all named entities for Arabic review
  const namedParties = [
    {
      id: "testator",
      roleLabel: "Testator",
      fullName: testator.fullName,
      arabicName: testator.arabicName,
      isApproved: testator.isArabicApproved,
      passport: testator.passportNumber,
    },
    ...parties.map((p) => ({
      id: p.id,
      roleLabel: p.role.replace(/_/g, " "),
      fullName: p.fullName,
      arabicName: p.arabicName || "",
      isApproved: p.isArabicApproved,
      passport: p.passportNumber,
    })),
  ];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedArabic, setEditedArabic] = useState("");

  const handleStartEdit = (id: string, currentArabic: string) => {
    setEditingId(id);
    setEditedArabic(currentArabic);
  };

  const handleSaveEdit = (id: string) => {
    approveArabicName(id, editedArabic);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Pre-Flight Validation · Step 15 of 16
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Review & Arabic Name Approval
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Verify that all sections are complete. UAE court regulations strictly require foreign names to be phonetically transliterated into Arabic. Please review and confirm each Arabic name below before generating your Will.
        </p>
      </div>

      {/* Arabic Transliteration Approval Manager Table */}
      <div className="bg-white rounded-2xl border border-court-border shadow-court overflow-hidden">
        <div className="bg-obsidian text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Languages className="w-5 h-5 text-court-tan" />
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Arabic Name Transliteration Manager
              </h3>
              <p className="text-xs text-white/60">
                Phonetic transliteration according to official ADJD court standards
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-court-bronze/30 text-court-tan border border-court-bronze/50">
            Mandatory Court Verification
          </span>
        </div>

        <div className="divide-y divide-court-border">
          {namedParties.map((person) => (
            <div
              key={person.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-alabaster/40 transition-colors"
            >
              {/* Left details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-court-bronze-dark bg-court-tan/15 px-2 py-0.5 rounded">
                    {person.roleLabel}
                  </span>
                  {person.passport && (
                    <span className="text-xs text-gray-400 font-mono">
                      Passport: {person.passport}
                    </span>
                  )}
                </div>
                <div className="font-serif font-bold text-base text-obsidian">
                  {person.fullName || "Unspecified"}
                </div>
              </div>

              {/* Right: Arabic transliteration input / badge */}
              <div className="flex items-center gap-3">
                {editingId === person.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      dir="rtl"
                      value={editedArabic}
                      onChange={(e) => setEditedArabic(e.target.value)}
                      className="px-3 py-1.5 text-base font-arabic font-bold rounded-lg border border-court-bronze bg-white text-right focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(person.id)}
                      className="px-3 py-1.5 rounded-lg bg-court-bronze text-white text-xs font-semibold hover:bg-court-bronze-dark transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="font-arabic font-bold text-lg text-obsidian px-3 py-1 rounded-lg bg-alabaster border border-court-border min-w-[140px] text-right"
                      dir="rtl"
                    >
                      {person.arabicName || "—"}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(person.id, person.arabicName)}
                      className="p-1.5 text-gray-400 hover:text-court-bronze rounded transition-colors"
                      title="Edit Arabic name"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {person.isApproved ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => approveArabicName(person.id, person.arabicName)}
                        className="text-xs font-semibold px-3 py-1 rounded-md bg-court-bronze text-white hover:bg-court-bronze-dark"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist Audit Grid */}
      <div className="bg-white rounded-2xl border border-court-border shadow-court p-6 space-y-4">
        <h3 className="font-serif font-bold text-lg text-obsidian border-b border-gray-100 pb-2">
          Statutory Section Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section ONE: Declaration</span>
            </span>
            <Link href="/wizard/3" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section TWO: Executors & Trustees</span>
            </span>
            <Link href="/wizard/4" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section THREE: Debts & Funeral Expenses</span>
            </span>
            <Link href="/wizard/5" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section FOUR: Letter of Wishes</span>
            </span>
            <Link href="/wizard/6" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section FIVE: UAE Jurisdiction</span>
            </span>
            <Link href="/wizard/7" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section SIX: Insurance Proceeds</span>
            </span>
            <Link href="/wizard/8" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section SEVEN: Beneficiaries (Primary 100% & Substitute 100%)</span>
            </span>
            <Link href="/wizard/9" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section EIGHT: Powers of Trustees</span>
            </span>
            <Link href="/wizard/12" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section NINTH: Guardianship Appointments</span>
            </span>
            <Link href="/wizard/13" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-alabaster/80 border border-court-border">
            <span className="flex items-center gap-2 font-medium text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Execution & Attestation Clause</span>
            </span>
            <Link href="/wizard/14" className="text-court-bronze hover:underline font-semibold">
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
