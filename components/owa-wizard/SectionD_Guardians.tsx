"use client";

import React from "react";
import { Plus, Trash2, Shield, HeartHandshake, UserCheck, AlertCircle, FileText, Upload } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { RoleType } from "@/types/owa";
import { transliterateToName } from "@/lib/transliterate";

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
      nationality: "",
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

  const handleAppointSurvivingSpouse = async () => {
    if (potentialSpouse) {
      assignPersonToRole(potentialSpouse.id, "GUARDIAN_PERMANENT", 1);
    } else {
      const newPerson = await addOrUpdatePerson({
        fullName: "",
        relationship: "Spouse",
        nationality: "",
        isUaeResident: true,
      });
      if (newPerson) {
        assignPersonToRole(newPerson.id, "GUARDIAN_PERMANENT", 1);
      }
    }
  };

  const handleGuardianNameBlur = async (
    personId: string,
    fullNameValue: string,
    currentArabic?: string | null
  ) => {
    await handleUpdateGuardian(personId, { fullName: fullNameValue });
    if (fullNameValue.trim() && !currentArabic?.trim()) {
      const transliterated = await transliterateToName(fullNameValue);
      if (transliterated) {
        await handleUpdateGuardian(personId, {
          fullName: fullNameValue,
          arabicName: transliterated,
        });
      }
    }
  };

  const [analyzingGuardianId, setAnalyzingGuardianId] = useState<string | null>(null);

  const handleGuardianFileUpload = async (
    personId: string,
    file: File,
    docType: "PASSPORT" | "EMIRATES_ID"
  ) => {
    setAnalyzingGuardianId(personId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", docType);

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
        if (ocr.emiratesId) updates.emiratesId = ocr.emiratesId;
        if (ocr.nationality) updates.nationality = ocr.nationality;
        if (ocr.dob) updates.dob = ocr.dob;
        await handleUpdateGuardian(personId, updates);
      }
    } catch (err) {
      console.error("Error reading guardian document:", err);
    } finally {
      setAnalyzingGuardianId(null);
    }
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
      {!getAssignment("GUARDIAN_PERMANENT", 1) && (
        <div className="bg-[#0B1528] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-[#A37E44]/30">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-6 h-6 text-[#A37E44] shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">Surviving Spouse Guardianship (Clause 5)</h4>
              <p className="text-xs text-gray-300 mt-0.5">
                {potentialSpouse ? (
                  <>Set <strong>{potentialSpouse.fullName}</strong> as your Primary Permanent Guardian.</>
                ) : (
                  <>Under ADJD rules, parental guardianship vests primarily in your surviving spouse upon demise.</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAppointSurvivingSpouse}
            className="px-4 py-2 bg-[#A37E44] hover:bg-[#B38D48] text-white text-xs font-semibold rounded-lg shadow transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Appoint Surviving Spouse
          </button>
        </div>
      )}

      {/* 3 Guardian Slots */}
      <div className="space-y-6">
        {GUARDIAN_SLOTS.map((slot) => {
          const assignment = getAssignment(slot.role, slot.order);
          const guardianPerson = assignment?.person;
          const isAssigned = !!assignment && !!guardianPerson;
          const isSpouse = guardianPerson?.relationship?.toLowerCase() === "spouse" || guardianPerson?.relationship?.toLowerCase() === "wife" || guardianPerson?.relationship?.toLowerCase() === "husband";
          const isAnalyzingThisGuardian = analyzingGuardianId === guardianPerson?.id;

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
                    {isAssigned && isSpouse && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        <HeartHandshake className="w-3 h-3 text-[#A37E44]" />
                        Surviving Spouse
                      </span>
                    )}
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
                    {slot.order === 1 && (
                      <button
                        type="button"
                        onClick={handleAppointSurvivingSpouse}
                        className="px-4 py-2 bg-[#A37E44] hover:bg-[#B38D48] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        Appoint Surviving Spouse
                      </button>
                    )}
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

                  {/* 1. Residency Question Upfront */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5E0D8]">
                    <div>
                      <span className="text-xs font-bold text-[#0B1528] block">
                        Does this guardian reside in the United Arab Emirates?
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {slot.order === 3
                          ? "Statutory Requirement: Under Section 6 of ADJD rules, temporary guardians must reside in the UAE."
                          : "Determines whether UAE Emirates ID is mandatory alongside passport."}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateGuardian(guardianPerson.id, { isUaeResident: true })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          guardianPerson.isUaeResident
                            ? "bg-[#0B1528] text-white"
                            : "bg-white text-gray-700 border border-gray-300"
                        }`}
                      >
                        Yes, In UAE
                      </button>
                      {slot.order !== 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateGuardian(guardianPerson.id, { isUaeResident: false })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            !guardianPerson.isUaeResident
                              ? "bg-[#0B1528] text-white"
                              : "bg-white text-gray-700 border border-gray-300"
                          }`}
                        >
                          No, Outside UAE
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Document Uploads for Guardian */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-dashed border-[#A37E44]/50 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#A37E44]" />
                          <span className="text-xs font-bold text-[#0B1528] uppercase">
                            Guardian Passport Copy * (Required for ADJD Court)
                          </span>
                        </div>
                        {guardianPerson.passportNumber ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Passport Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Upload to Autofill
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Upload passport bio-page to derive legal name, DOB, nationality, and transliterate to Arabic.
                      </p>

                      <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-[#0B1528] hover:bg-[#1a2844] shadow-sm transition-all text-center">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isAnalyzingThisGuardian ? "Scanning..." : guardianPerson.passportNumber ? "Replace Guardian Passport" : "Upload Guardian Passport"}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={Boolean(analyzingGuardianId)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleGuardianFileUpload(guardianPerson.id, file, "PASSPORT");
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>

                    {guardianPerson.isUaeResident && (
                      <div className="p-4 rounded-xl border border-dashed border-emerald-400/60 bg-emerald-50/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-700" />
                            <span className="text-xs font-bold text-[#0B1528] uppercase">
                              Guardian Emirates ID Scan
                            </span>
                          </div>
                          {guardianPerson.emiratesId && (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> EID Attached
                            </span>
                          )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-[#0B1528] hover:bg-[#1a2844] shadow-sm transition-all text-center">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{guardianPerson.emiratesId ? "Replace Emirates ID Scan" : "Upload Guardian Emirates ID"}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            disabled={Boolean(analyzingGuardianId)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleGuardianFileUpload(guardianPerson.id, file, "EMIRATES_ID");
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Legal Name (English) *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.fullName || ""}
                        key={`guardian-name-${guardianPerson.fullName}`}
                        onBlur={(e) =>
                          handleGuardianNameBlur(
                            guardianPerson.id,
                            e.target.value,
                            guardianPerson.arabicName
                          )
                        }
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Phonetic Arabic Name (الاسم باللغة العربية)
                        </label>
                        {guardianPerson.arabicName ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                            <span>✓</span> Auto-Transliterated
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                            Phonetic Arabic
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        dir="rtl"
                        defaultValue={guardianPerson.arabicName || ""}
                        key={`guardian-arabic-${guardianPerson.arabicName}`}
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
                        key={`guardian-rel-${guardianPerson.relationship}`}
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
                        defaultValue={guardianPerson.nationality || ""}
                        key={`guardian-nat-${guardianPerson.nationality}`}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, {
                            nationality: e.target.value,
                          })
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
                        defaultValue={guardianPerson.passportNumber || ""}
                        key={`guardian-pass-${guardianPerson.passportNumber}`}
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
                        Emirates ID (if UAE resident)
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.emiratesId || ""}
                        key={`guardian-eid-${guardianPerson.emiratesId}`}
                        onBlur={(e) =>
                          handleUpdateGuardian(guardianPerson.id, {
                            emiratesId: e.target.value,
                          })
                        }
                        placeholder="784-XXXX-XXXXXXX-X"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Residential Address *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.address || ""}
                        key={`guardian-addr-${guardianPerson.address}`}
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
