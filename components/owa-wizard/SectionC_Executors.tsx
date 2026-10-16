"use client";

import React, { useState } from "react";
import { Plus, Trash2, UserCheck, ShieldCheck, AlertCircle, FileText, Upload } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { transliterateToName } from "@/lib/transliterate";
import { RoleType } from "@/types/owa";

interface ExecutorSlot {
  role: RoleType;
  title: string;
  order: number;
  subtitle: string;
  isRequired: boolean;
}

const EXECUTOR_SLOTS: ExecutorSlot[] = [
  {
    role: "EXECUTOR_PRIMARY",
    title: "Primary Executor",
    order: 1,
    subtitle: "Compulsory · The main individual who will administer your UAE estate",
    isRequired: true,
  },
  {
    role: "EXECUTOR_SUBSTITUTE",
    title: "Substitute Executor",
    order: 2,
    subtitle: "Recommended · Acts if the Primary Executor is unable or unwilling to act",
    isRequired: false,
  },
  {
    role: "EXECUTOR_FURTHER",
    title: "Further Substitute Executor",
    order: 3,
    subtitle: "Optional · Secondary backup in case both previous executors cannot act",
    isRequired: false,
  },
];

export function SectionC_Executors() {
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
    removeRoleAssignment,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const existingPersons = application?.persons || [];

  const getAssignment = (role: RoleType, order: number) => {
    return activeWill?.roleAssignments.find(
      (ra) => ra.role === role && ra.appointmentOrder === order
    );
  };

  const handleSelectExistingPerson = (
    slot: ExecutorSlot,
    personId: string
  ) => {
    if (!personId) return;
    assignPersonToRole(personId, slot.role, slot.order);
  };

  const handleAddNewPerson = async (slot: ExecutorSlot) => {
    const newPerson = await addOrUpdatePerson({
      fullName: `New ${slot.title}`,
      relationship: slot.order === 1 ? "Spouse" : "Relative",
      nationality: "",
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, slot.role, slot.order);
    }
  };

  const handleUpdateExecutor = async (
    personId: string,
    updates: Record<string, any>
  ) => {
    await addOrUpdatePerson({
      id: personId,
      ...updates,
    });
  };

  const handleExecutorNameBlur = async (
    personId: string,
    fullNameValue: string,
    currentArabic?: string | null
  ) => {
    await handleUpdateExecutor(personId, { fullName: fullNameValue });
    if (fullNameValue.trim() && !currentArabic?.trim()) {
      const transliterated = await transliterateToName(fullNameValue);
      if (transliterated) {
        await handleUpdateExecutor(personId, {
          fullName: fullNameValue,
          arabicName: transliterated,
        });
      }
    }
  };

  const [replacingDocPersonId, setReplacingDocPersonId] = useState<string | null>(null);

  const handleReplaceExecutorDoc = async (personId: string, file: File) => {
    setReplacingDocPersonId(personId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "PASSPORT");

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const ocr = json.data;
        const updates: Record<string, any> = {};
        if (ocr.fullName) updates.fullName = ocr.fullName;
        if (ocr.arabicName) updates.arabicName = ocr.arabicName;
        if (ocr.passportNumber) updates.passportNumber = ocr.passportNumber;
        if (ocr.nationality) updates.nationality = ocr.nationality;
        await handleUpdateExecutor(personId, updates);
      }
    } catch (err) {
      console.error("Error replacing document:", err);
    } finally {
      setReplacingDocPersonId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section C · Estate Administration
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Appointment of Executors (Clause 4)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Executors are responsible for collecting your UAE assets, paying debts, and distributing the estate in accordance with Section 4 of the official court form.
        </p>
      </div>

      <div className="space-y-6">
        {EXECUTOR_SLOTS.map((slot) => {
          const assignment = getAssignment(slot.role, slot.order);
          const executorPerson = assignment?.person;
          const isAssigned = !!assignment && !!executorPerson;

          return (
            <div
              key={slot.role}
              className={`bg-white p-6 sm:p-8 rounded-2xl border transition-all ${
                isAssigned ? "border-[#E5E0D8] shadow-sm" : "border-dashed border-gray-300 bg-gray-50/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs font-bold">
                      {slot.order}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#0B1528]">
                      {slot.title} {slot.isRequired && <span className="text-red-500">*</span>}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{slot.subtitle}</p>
                </div>

                {isAssigned && !slot.isRequired && (
                  <button
                    type="button"
                    onClick={() => removeRoleAssignment(assignment.id)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Slot
                  </button>
                )}
              </div>

              {!isAssigned ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600">
                    Select a person from your saved repository or create a new executor entry:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {existingPersons.length > 0 && (
                      <select
                        onChange={(e) => handleSelectExistingPerson(slot, e.target.value)}
                        defaultValue=""
                        className="px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-medium text-gray-700 focus:outline-none focus:border-[#A37E44]"
                      >
                        <option value="" disabled>
                          Select from existing persons...
                        </option>
                        {existingPersons.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({p.relationship || p.nationality || "Person"})
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddNewPerson(slot)}
                      className="px-4 py-2 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New {slot.title}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Select other person switch */}
                  {existingPersons.length > 1 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8]/60 text-xs">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#A37E44]" />
                        <span className="font-semibold text-gray-700">Currently Linked:</span>
                        <span className="text-[#0B1528] font-bold">{executorPerson.fullName}</span>
                      </div>
                      <select
                        value={executorPerson.id}
                        onChange={(e) => handleSelectExistingPerson(slot, e.target.value)}
                        className="px-2.5 py-1 rounded border border-[#E5E0D8] bg-white text-[11px] font-medium"
                      >
                        {existingPersons.map((p) => (
                          <option key={p.id} value={p.id}>
                            Switch to: {p.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 1. UAE Residency Question Upfront */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5E0D8]">
                    <div>
                      <span className="text-xs font-bold text-[#0B1528] block">
                        Does this executor reside in the United Arab Emirates?
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Determines whether UAE Emirates ID is mandatory alongside passport.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateExecutor(executorPerson.id, { isUaeResident: true })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          executorPerson.isUaeResident
                            ? "bg-[#0B1528] text-white"
                            : "bg-white text-gray-700 border border-gray-300"
                        }`}
                      >
                        Yes, In UAE
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateExecutor(executorPerson.id, { isUaeResident: false })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          !executorPerson.isUaeResident
                            ? "bg-[#0B1528] text-white"
                            : "bg-white text-gray-700 border border-gray-300"
                        }`}
                      >
                        No, Outside UAE
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Legal Name (English) *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.fullName || ""}
                        key={`exec-name-${executorPerson.fullName}`}
                        onBlur={(e) =>
                          handleExecutorNameBlur(
                            executorPerson.id,
                            e.target.value,
                            executorPerson.arabicName
                          )
                        }
                        placeholder="e.g. David Alan Whitfield"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Phonetic Arabic Name (الاسم باللغة العربية)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        defaultValue={executorPerson.arabicName || ""}
                        key={`exec-arabic-${executorPerson.arabicName}`}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { arabicName: e.target.value })
                        }
                        placeholder="ديفيد ألان ويتفيلد"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-arabic focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Relationship to Testator *
                      </label>
                      <select
                        value={
                          ["Spouse", "Brother", "Sister", "Parent", "Adult Child", "Trusted Friend", "Professional Trustee"].includes(
                            executorPerson.relationship || ""
                          )
                            ? executorPerson.relationship || "Spouse"
                            : "Other"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateExecutor(executorPerson.id, {
                            relationship: val === "Other" ? "" : val,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Parent">Parent</option>
                        <option value="Adult Child">Adult Child</option>
                        <option value="Trusted Friend">Trusted Friend</option>
                        <option value="Professional Trustee">Professional Trustee</option>
                        <option value="Other">Other (Type manually...)</option>
                      </select>
                      {!["Spouse", "Brother", "Sister", "Parent", "Adult Child", "Trusted Friend", "Professional Trustee"].includes(
                        executorPerson.relationship || ""
                      ) && (
                        <input
                          type="text"
                          defaultValue={executorPerson.relationship || ""}
                          key={`exec-rel-custom-${executorPerson.id}-${executorPerson.relationship}`}
                          onBlur={(e) =>
                            handleUpdateExecutor(executorPerson.id, { relationship: e.target.value })
                          }
                          placeholder="Specify custom relationship..."
                          className="mt-2 w-full px-3.5 py-2 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.nationality || ""}
                        key={`exec-nat-${executorPerson.nationality}`}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { nationality: e.target.value })
                        }
                        placeholder="e.g. British"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Passport Number *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.passportNumber || ""}
                        key={`exec-pass-${executorPerson.passportNumber}`}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, {
                            passportNumber: e.target.value,
                          })
                        }
                        placeholder="e.g. 509876543"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Emirates ID (if UAE resident)
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.emiratesId || ""}
                        key={`exec-eid-${executorPerson.emiratesId}`}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { emiratesId: e.target.value })
                        }
                        placeholder="784-XXXX-XXXXXXX-X"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Residential Address (Court requirement) *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.address || ""}
                        key={`exec-addr-${executorPerson.address}`}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { address: e.target.value })
                        }
                        placeholder="e.g. Apartment 14B, Al Bateen Tower, Abu Dhabi, UAE"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>
                  </div>

                  {/* Document preview with working replace button */}
                  <div className="pt-2">
                    <div className="border border-dashed border-[#A37E44]/40 bg-[#FBF9F5] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#A37E44] shrink-0" />
                        <span className="text-xs font-medium text-gray-700 truncate max-w-xs">
                          Passport_Document_{executorPerson.fullName ? executorPerson.fullName.replace(/\s+/g, "_") : "Executor"}.pdf
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono shrink-0">
                          Attached
                        </span>
                      </div>
                      <label className="text-xs text-[#A37E44] hover:text-[#8C6B37] font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{replacingDocPersonId === executorPerson.id ? "Analyzing..." : "Replace Document"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={Boolean(replacingDocPersonId)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceExecutorDoc(executorPerson.id, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
