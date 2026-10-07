"use client";

import React from "react";
import { Plus, Trash2, Shield, HeartHandshake, UserCheck, AlertCircle, FileText, Upload } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { RoleType } from "@/types/owa";

interface GuardianSlot {
  role: RoleType;
  title: string;
  order: number;
  clause: string;
  subtitle: string;
  recommended: string;
}

const GUARDIAN_SLOTS: GuardianSlot[] = [
  {
    role: "GUARDIAN_PERMANENT",
    title: "Permanent Guardian",
    order: 1,
    clause: "Section 5",
    subtitle: "Primary legal custodian who will assume full parental responsibility for minor children",
    recommended: "Usually surviving spouse or close immediate family member",
  },
  {
    role: "GUARDIAN_SUBSTITUTE_PERM",
    title: "Substitute Permanent Guardian",
    order: 2,
    clause: "Section 5",
    subtitle: "Assumes permanent guardianship if the primary guardian predeceases or cannot act",
    recommended: "Sibling, parent, or trusted family member",
  },
  {
    role: "GUARDIAN_TEMPORARY",
    title: "Temporary Guardian",
    order: 3,
    clause: "Section 6",
    subtitle: "Immediate local custodian in the UAE until permanent guardians arrive",
    recommended: "Must be resident in the UAE (neighbor, close colleague, local family friend)",
  },
];

export function SectionD_Guardians() {
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
    removeRoleAssignment,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const existingPersons = application?.persons || [];
  const children = activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];
  const hasChildren = children.length > 0;

  // Check if partner/spouse exists in application (e.g. Testator of Will 2 or relationship: "Spouse")
  const potentialSpouse = existingPersons.find(
    (p) =>
      p.id !== activeWill?.testatorPersonId &&
      (p.relationship?.toLowerCase() === "spouse" ||
        p.relationship?.toLowerCase() === "wife" ||
        p.relationship?.toLowerCase() === "husband")
  );

  const getAssignment = (role: RoleType, order: number) => {
    return activeWill?.roleAssignments.find(
      (ra) => ra.role === role && ra.appointmentOrder === order
    );
  };

  const handleSelectExistingPerson = (slot: GuardianSlot, personId: string) => {
    if (!personId) return;
    assignPersonToRole(personId, slot.role, slot.order);
  };

  const handleAddNewPerson = async (slot: GuardianSlot) => {
    const newPerson = await addOrUpdatePerson({
      fullName: `New ${slot.title}`,
      relationship: slot.order === 3 ? "UAE Resident Friend" : "Family Member",
      nationality: "British",
      isUaeResident: slot.order === 3,
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, slot.role, slot.order);
    }
  };

  const handleUpdateGuardian = async (personId: string, updates: Record<string, any>) => {
    await addOrUpdatePerson({
      id: personId,
      ...updates,
    });
  };

  const handleAssignSpouseAsPermanent = () => {
    if (!potentialSpouse) return;
    assignPersonToRole(potentialSpouse.id, "GUARDIAN_PERMANENT", 1);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section D · Minor Guardianship
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Appointment of Guardians (Clauses 5 & 6)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Designate legal custodians for your minor children under UAE Civil Family Court rules. Exactly 3 slots are recognized (the obsolete 4th backup has been removed).
        </p>
      </div>

      {!hasChildren && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">No Minor Children Listed in Section B</p>
            <p className="mt-0.5 text-amber-800/90">
              You did not list children in Section B. You may still appoint prospective guardians below, or proceed directly to Section E (Beneficiaries). The court will record guardianship clauses accordingly.
            </p>
          </div>
        </div>
      )}

      {/* Quick Spouse Appointment Banner */}
      {potentialSpouse && !getAssignment("GUARDIAN_PERMANENT", 1) && (
        <div className="bg-[#0B1528] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-6 h-6 text-[#A37E44] shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">Quick Appointment: Appoint Spouse</h4>
              <p className="text-xs text-gray-300 mt-0.5">
                Set <strong>{potentialSpouse.fullName}</strong> as your Primary Permanent Guardian (Section 5).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAssignSpouseAsPermanent}
            className="px-4 py-2 bg-[#A37E44] hover:bg-[#B38D48] text-white text-xs font-semibold rounded-lg shadow transition-all whitespace-nowrap"
          >
            Appoint Spouse as Permanent Guardian
          </button>
        </div>
      )}

      {/* 3 Guardian Slots */}
      <div className="space-y-6">
        {GUARDIAN_SLOTS.map((slot) => {
          const assignment = getAssignment(slot.role, slot.order);
          const guardianPerson = assignment?.person;
          const isAssigned = !!assignment && !!guardianPerson;

          return (
            <div
              key={slot.role}
              className={`bg-white p-6 sm:p-8 rounded-2xl border transition-all ${
                isAssigned
                  ? "border-[#E5E0D8] shadow-sm"
                  : "border-dashed border-gray-300 bg-gray-50/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#A37E44] text-white flex items-center justify-center text-xs font-bold">
                      {slot.order}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#0B1528]">
                      {slot.title} ({slot.clause})
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{slot.subtitle}</p>
                  <p className="text-[11px] text-[#A37E44] font-medium mt-0.5 italic">
                    Recommendation: {slot.recommended}
                  </p>
                </div>

                {isAssigned && (
                  <button
                    type="button"
                    onClick={() => removeRoleAssignment(assignment.id)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {!isAssigned ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600">
                    Select a person from your saved repository or create a new guardian record:
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
                  {existingPersons.length > 1 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8]/60 text-xs">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#A37E44]" />
                        <span className="font-semibold text-gray-700">Currently Linked:</span>
                        <span className="text-[#0B1528] font-bold">{guardianPerson.fullName}</span>
                      </div>
                      <select
                        value={guardianPerson.id}
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
                        defaultValue={guardianPerson.fullName || ""}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, { fullName: e.target.value })
                        }
                        placeholder="e.g. Sarah Jenkins"
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
                        defaultValue={guardianPerson.arabicName || ""}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, {
                            arabicName: e.target.value,
                          })
                        }
                        placeholder="سارة جنكينز"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-arabic focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Relationship to Testator *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.relationship || ""}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, {
                            relationship: e.target.value,
                          })
                        }
                        placeholder={slot.order === 3 ? "UAE Resident Friend" : "Sister / Mother"}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.nationality || "British"}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, {
                            nationality: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Passport Number *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.passportNumber || ""}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, {
                            passportNumber: e.target.value,
                          })
                        }
                        placeholder="e.g. 508765123"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        UAE Resident Status
                      </label>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`uae_resident_${guardianPerson.id}`}
                            checked={guardianPerson.isUaeResident}
                            onChange={() =>
                              handleUpdateGuardian(guardianPerson.id, { isUaeResident: true })
                            }
                            className="text-[#A37E44] focus:ring-[#A37E44]"
                          />
                            UAE Resident
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`uae_resident_${guardianPerson.id}`}
                            checked={!guardianPerson.isUaeResident}
                            onChange={() =>
                              handleUpdateGuardian(guardianPerson.id, { isUaeResident: false })
                            }
                            className="text-[#A37E44] focus:ring-[#A37E44]"
                          />
                          Non-Resident (Overseas)
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Residential Address *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.address || ""}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, { address: e.target.value })
                        }
                        placeholder="Residential address in UAE or country of domicile"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
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
