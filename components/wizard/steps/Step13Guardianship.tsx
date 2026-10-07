"use client";

import React, { useState } from "react";
import { useWillStore } from "@/store/useWillStore";
import { Party, Child } from "@/types/will";
import { Baby, Shield, Plus, Trash2, User, Heart } from "lucide-react";

export function Step13Guardianship() {
  const { children, addChild, updateChild, removeChild, parties, addParty, updateParty, removeParty } =
    useWillStore();

  const [hasChildren, setHasChildren] = useState(children.length > 0);

  const permGuardian = parties.find((p) => p.role === "PERMANENT_GUARDIAN");
  const tempGuardian = parties.find((p) => p.role === "TEMPORARY_GUARDIAN");

  const handleUpdateGuardian = (role: Party["role"], field: keyof Party, value: any) => {
    const existing = parties.find((p) => p.role === role);
    if (existing) {
      updateParty(existing.id, { [field]: value });
    } else {
      addParty({
        id: `guard-${Date.now()}`,
        role,
        fullName: value,
        arabicName: "",
        isArabicApproved: false,
        isUaeResident: role === "TEMPORARY_GUARDIAN",
        [field]: value,
      });
    }
  };

  const handleAddChild = () => {
    addChild({
      id: `child-${Date.now()}`,
      fullName: "",
      arabicName: "",
      dob: "",
      nationality: "British",
      passportNumber: "",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section NINTH
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Guardianship of Minor Children
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Designate permanent and temporary guardians to protect your minor children in the event of your death under the Abu Dhabi Civil Family Court framework.
        </p>
      </div>

      {/* Children Toggle */}
      <div className="bg-white p-5 rounded-xl border border-court-border shadow-court flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
            Minor Children Declaration
          </span>
          <span className="text-sm font-medium text-obsidian">
            Do you have children under the age of 18?
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setHasChildren(true);
              if (children.length === 0) handleAddChild();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              hasChildren
                ? "bg-obsidian text-white"
                : "bg-alabaster text-gray-600 border border-court-border hover:bg-gray-100"
            }`}
          >
            Yes, I have minor children
          </button>
          <button
            type="button"
            onClick={() => setHasChildren(false)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              !hasChildren
                ? "bg-obsidian text-white"
                : "bg-alabaster text-gray-600 border border-court-border hover:bg-gray-100"
            }`}
          >
            No minor children
          </button>
        </div>
      </div>

      {hasChildren && (
        <>
          {/* Children List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-obsidian">
                  Minor Children ({children.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Enter legal name and passport details for each minor child.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddChild}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-court-bronze hover:bg-court-bronze-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Child</span>
              </button>
            </div>

            {children.map((child, idx) => (
              <div
                key={child.id}
                className="bg-white p-5 rounded-xl border border-court-border shadow-court space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold text-obsidian flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-court-bronze" />
                    <span>Child #{idx + 1}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChild(child.id)}
                    className="text-xs text-gray-400 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={child.fullName}
                      onChange={(e) => updateChild(child.id, { fullName: e.target.value })}
                      placeholder="e.g. Liam James Carter"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                      Arabic Name
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={child.arabicName}
                      onChange={(e) => updateChild(child.id, { arabicName: e.target.value })}
                      placeholder="ليام جيمس كارتر"
                      className="w-full px-3 py-2 text-base rounded-lg border border-court-border bg-white text-gray-900 font-arabic font-bold text-right"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={child.dob}
                      onChange={(e) => updateChild(child.id, { dob: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={child.passportNumber}
                      onChange={(e) => updateChild(child.id, { passportNumber: e.target.value })}
                      placeholder="e.g. GB33445566"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-court-border bg-white text-gray-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Permanent Guardian Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-court-tan/20 text-court-bronze flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-base text-obsidian">Permanent Guardian</h3>
                  <p className="text-xs text-gray-500">
                    Appointed upon death to assume long-term parental and legal custody of minor children
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Mandatory
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
                  value={permGuardian?.fullName || ""}
                  onChange={(e) => handleUpdateGuardian("PERMANENT_GUARDIAN", "fullName", e.target.value)}
                  placeholder="e.g. Sarah Elizabeth Carter"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Arabic Transliterated Name
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={permGuardian?.arabicName || ""}
                  onChange={(e) => handleUpdateGuardian("PERMANENT_GUARDIAN", "arabicName", e.target.value)}
                  placeholder="سارة إليزابيث كارتر"
                  className="w-full px-3 py-2.5 text-base rounded-lg border border-court-border bg-white font-arabic font-bold text-gray-900 text-right"
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
                  value={permGuardian?.dob || ""}
                  onChange={(e) => handleUpdateGuardian("PERMANENT_GUARDIAN", "dob", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Nationality
                </label>
                <input
                  type="text"
                  value={permGuardian?.nationality || ""}
                  onChange={(e) => handleUpdateGuardian("PERMANENT_GUARDIAN", "nationality", e.target.value)}
                  placeholder="e.g. British"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={permGuardian?.passportNumber || ""}
                  onChange={(e) => handleUpdateGuardian("PERMANENT_GUARDIAN", "passportNumber", e.target.value)}
                  placeholder="e.g. GB55443322"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white font-mono text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Temporary Guardian Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-court-tan/20 text-court-bronze flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-base text-obsidian">Temporary Guardian (In-Country)</h3>
                  <p className="text-xs text-gray-500">
                    Appointed to take immediate temporary physical care of your children in the UAE until permanent guardians arrive
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Mandatory
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={tempGuardian?.fullName || ""}
                  onChange={(e) => handleUpdateGuardian("TEMPORARY_GUARDIAN", "fullName", e.target.value)}
                  placeholder="e.g. David Alan Whitfield"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Arabic Transliterated Name
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={tempGuardian?.arabicName || ""}
                  onChange={(e) => handleUpdateGuardian("TEMPORARY_GUARDIAN", "arabicName", e.target.value)}
                  placeholder="ديفيد ألان ويتفيلد"
                  className="w-full px-3 py-2.5 text-base rounded-lg border border-court-border bg-white font-arabic font-bold text-gray-900 text-right"
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
                  value={tempGuardian?.dob || ""}
                  onChange={(e) => handleUpdateGuardian("TEMPORARY_GUARDIAN", "dob", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Nationality
                </label>
                <input
                  type="text"
                  value={tempGuardian?.nationality || ""}
                  onChange={(e) => handleUpdateGuardian("TEMPORARY_GUARDIAN", "nationality", e.target.value)}
                  placeholder="e.g. British"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={tempGuardian?.passportNumber || ""}
                  onChange={(e) => handleUpdateGuardian("TEMPORARY_GUARDIAN", "passportNumber", e.target.value)}
                  placeholder="e.g. GB99001122"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white font-mono text-gray-900"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
