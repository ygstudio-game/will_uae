"use client";

import React, { useState } from "react";
import { Plus, Trash2, UserCheck, ShieldCheck, AlertCircle, FileText, Upload } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
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
    role: "EXECUTOR_FURTHER_SUB",
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
      nationality: "British",
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Legal Name (English) *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.fullName || ""}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { fullName: e.target.value })
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
                      <input
                        type="text"
                        defaultValue={executorPerson.relationship || ""}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { relationship: e.target.value })
                        }
                        placeholder="e.g. Spouse, Brother, Trusted Friend"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.nationality || "British"}
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { nationality: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Passport Number / National ID *
                      </label>
                      <input
                        type="text"
                        defaultValue={executorPerson.passportNumber || ""}
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
                        onBlur={(e) =>
                          handleUpdateExecutor(executorPerson.id, { address: e.target.value })
                        }
                        placeholder="e.g. Apartment 14B, Al Bateen Tower, Abu Dhabi, UAE"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>
                  </div>

                  {/* Document preview */}
                  <div className="pt-2">
                    <div className="border border-dashed border-[#A37E44]/40 bg-[#FBF9F5] rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#A37E44]" />
                        <span className="text-xs font-medium text-gray-700">
                          Passport_Document_{executorPerson.fullName.replace(/\s+/g, "_")}.pdf
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                          Attached
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-[#A37E44] hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Replace
                      </button>
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
