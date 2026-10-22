"use client";

import React, { useState } from "react";
import { Plus, Trash2, UserCheck, FileText, Upload, CheckCircle2, RotateCw } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { transliterateToName } from "@/lib/transliterate";
import { RoleType } from "@/types/owa";

interface SlotDef {
  role: RoleType;
  order: number;
  letter: "a" | "b" | "c";
  label: string;
  tag: string;
  desc: string;
  isRequired: boolean;
}

const SLOTS: SlotDef[] = [
  {
    role: "EXECUTOR_PRIMARY",
    order: 1,
    letter: "a",
    label: "(a) Executor and trustee",
    tag: "Required",
    desc: "Collects your assets, pays what you owe and distributes the rest.",
    isRequired: true,
  },
  {
    role: "EXECUTOR_SUBSTITUTE",
    order: 2,
    letter: "b",
    label: "(b) Substitute executor",
    tag: "Recommended",
    desc: "Acts if your executor cannot or will not act, or dies before your Will is proved.",
    isRequired: false,
  },
  {
    role: "EXECUTOR_FURTHER",
    order: 3,
    letter: "c",
    label: "(c) Further appointment",
    tag: "Optional",
    desc: "Takes over only if both executors above die before your Will is proved.",
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
  const [editingSlotRole, setEditingSlotRole] = useState<RoleType | null>(null);
  const [replacingDocPersonId, setReplacingDocPersonId] = useState<string | null>(null);

  const getAssignment = (role: RoleType, order: number) => {
    return activeWill?.roleAssignments.find(
      (ra) => ra.role === role && ra.appointmentOrder === order
    );
  };

  const handleSelectExistingPerson = (role: RoleType, order: number, personId: string) => {
    if (!personId) return;
    assignPersonToRole(personId, role, order);
    setEditingSlotRole(null);
  };

  const handleAddNewPerson = async (slot: SlotDef) => {
    const newPerson = await addOrUpdatePerson({
      fullName: "",
      relationship: slot.order === 1 ? "Spouse" : "Relative",
      nationality: "British",
      isUaeResident: true,
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, slot.role, slot.order);
      setEditingSlotRole(slot.role);
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

  const handleReplaceExecutorDoc = async (personId: string, file?: File) => {
    if (!file) return;

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

  // Names for Cascade Rail
  const namesInCascade = SLOTS.map((slot) => {
    const assignment = getAssignment(slot.role, slot.order);
    const p = assignment?.person || existingPersons.find((ep) => ep.id === assignment?.personId);
    return p?.fullName || "Not named yet";
  });

  return (
    <div className="space-y-6">
      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: 3 Executor Slots */}
        <div className="lg:col-span-2 space-y-4">
          {SLOTS.map((slot) => {
            const assignment = getAssignment(slot.role, slot.order);
            const executorPerson =
              assignment?.person ||
              existingPersons.find((p) => p.id === assignment?.personId);
            const isAssigned = !!assignment && !!executorPerson;
            const isEditing = editingSlotRole === slot.role;

            // Slot assigned view (collapsed or editable)
            if (isAssigned && !isEditing) {
              const details = [
                executorPerson.relationship || "Relative",
                executorPerson.nationality || "British",
                executorPerson.isUaeResident ? "lives in the UAE" : "lives outside the UAE",
                executorPerson.passportNumber
                  ? `passport ${executorPerson.passportNumber}`
                  : "passport uploaded",
              ].filter(Boolean);

              return (
                <section
                  key={slot.role}
                  className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#382852]">
                        {slot.label} · {slot.tag}
                      </span>
                      <h2 className="text-lg font-serif font-bold text-[#231a30]">
                        {executorPerson.fullName || "Named Executor"}
                      </h2>
                      {executorPerson.arabicName && (
                        <span className="text-base font-arabic text-[#231a30] block" dir="rtl">
                          {executorPerson.arabicName}
                        </span>
                      )}
                      <p className="text-xs text-[#6c6478]">
                        {details.join(" · ")}
                      </p>
                      <p className="text-xs text-[#8a6233] pt-1">
                        {slot.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingSlotRole(slot.role)}
                        className="px-3.5 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      {!slot.isRequired && (
                        <button
                          type="button"
                          onClick={() => removeRoleAssignment(assignment.id)}
                          className="text-xs text-[#b42318] hover:underline font-semibold cursor-pointer px-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            // Editable or Empty Slot Form
            return (
              <section
                key={slot.role}
                className={`bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border transition-all ${
                  slot.isRequired
                    ? "border-2 border-[#d7b48b] shadow-sm"
                    : "border-2 border-dashed border-[#cfc6da]"
                }`}
              >
                <div className="space-y-1 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    slot.isRequired ? "text-[#b42318]" : "text-[#6c6478]"
                  }`}>
                    {slot.label} · {slot.tag}
                  </span>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#231a30]">
                    {slot.order === 1 ? "Choose your executor" : slot.order === 2 ? "Add a backup" : "Add a second backup"}
                  </h2>
                  <p className="text-xs text-[#6c6478]">
                    {slot.desc}
                  </p>
                </div>

                {!isAssigned ? (
                  /* Picker row */
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Choose someone already in your Will
                        </label>
                        <select
                          defaultValue=""
                          onChange={(e) => handleSelectExistingPerson(slot.role, slot.order, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0]"
                        >
                          <option value="" disabled>
                            Select a person
                          </option>
                          {existingPersons.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.fullName || "Unnamed"} ({p.relationship || "Person"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddNewPerson(slot)}
                        className="px-4 py-2.5 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add a new person
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Full editing fields */
                  <div className="space-y-4 pt-2">
                    {/* Switch existing person link */}
                    {existingPersons.length > 1 && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f5fb] text-xs">
                        <span className="text-[#6c6478]">Switch to someone else:</span>
                        <select
                          value={executorPerson.id}
                          onChange={(e) => handleSelectExistingPerson(slot.role, slot.order, e.target.value)}
                          className="px-2 py-1 rounded border border-[#cfc6da] bg-white text-xs"
                        >
                          {existingPersons.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.fullName || "Unnamed"} ({p.relationship || "Person"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* UAE Residency Segment */}
                    <div className="bg-[#f7f5fb] p-3 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-[#231a30] block">
                          Lives in the UAE?
                        </span>
                        <span className="text-[11px] text-[#6c6478]">
                          If yes, add Emirates ID if available.
                        </span>
                      </div>
                      <div className="inline-flex p-1 bg-white rounded-full border border-[#cfc6da] shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateExecutor(executorPerson.id, { isUaeResident: true })}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            executorPerson.isUaeResident ? "bg-[#382852] text-white" : "text-[#3b3346]"
                          }`}
                        >
                          In UAE
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateExecutor(executorPerson.id, { isUaeResident: false })}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            !executorPerson.isUaeResident ? "bg-[#382852] text-white" : "text-[#3b3346]"
                          }`}
                        >
                          Outside
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Full Legal Name (English) *
                        </label>
                        <input
                          type="text"
                          defaultValue={executorPerson.fullName || ""}
                          key={`exec-name-${executorPerson.fullName}`}
                          onBlur={(e) =>
                            handleExecutorNameBlur(executorPerson.id, e.target.value, executorPerson.arabicName)
                          }
                          placeholder="e.g. David Alan Whitfield"
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs bg-white focus:outline-none focus:border-[#5b3fb0]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Phonetic Arabic Name <span className="font-normal text-[#6c6478]">(optional)</span>
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          defaultValue={executorPerson.arabicName || ""}
                          key={`exec-arabic-${executorPerson.arabicName}`}
                          onBlur={(e) => handleUpdateExecutor(executorPerson.id, { arabicName: e.target.value })}
                          placeholder="ديفيد ألان ويتفيلد"
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-arabic bg-white focus:outline-none focus:border-[#5b3fb0]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Relationship to you *
                        </label>
                        <select
                          value={executorPerson.relationship || "Spouse"}
                          onChange={(e) => handleUpdateExecutor(executorPerson.id, { relationship: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs bg-white focus:outline-none focus:border-[#5b3fb0]"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Parent">Parent</option>
                          <option value="Adult Child">Adult Child</option>
                          <option value="Trusted Friend">Trusted Friend</option>
                          <option value="Professional Trustee">Professional Trustee</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Nationality *
                        </label>
                        <input
                          type="text"
                          defaultValue={executorPerson.nationality || ""}
                          key={`exec-nat-${executorPerson.nationality}`}
                          onBlur={(e) => handleUpdateExecutor(executorPerson.id, { nationality: e.target.value })}
                          placeholder="e.g. British"
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs bg-white focus:outline-none focus:border-[#5b3fb0]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Passport Number *
                        </label>
                        <input
                          type="text"
                          defaultValue={executorPerson.passportNumber || ""}
                          key={`exec-pass-${executorPerson.passportNumber}`}
                          onBlur={(e) => handleUpdateExecutor(executorPerson.id, { passportNumber: e.target.value })}
                          placeholder="e.g. 509876543"
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-mono bg-white focus:outline-none focus:border-[#5b3fb0]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Emirates ID <span className="font-normal text-[#6c6478]">(if UAE resident)</span>
                        </label>
                        <input
                          type="text"
                          defaultValue={executorPerson.emiratesId || ""}
                          key={`exec-eid-${executorPerson.emiratesId}`}
                          onBlur={(e) => handleUpdateExecutor(executorPerson.id, { emiratesId: e.target.value })}
                          placeholder="784-XXXX-XXXXXXX-X"
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-mono bg-white focus:outline-none focus:border-[#5b3fb0]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#231a30] mb-1">
                          Current Residential Address *
                        </label>
                        <input
                          type="text"
                          defaultValue={executorPerson.address || ""}
                          key={`exec-addr-${executorPerson.address}`}
                          onBlur={(e) => handleUpdateExecutor(executorPerson.id, { address: e.target.value })}
                          placeholder="e.g. Apartment 14B, Al Bateen Tower, Abu Dhabi"
                          className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs bg-white focus:outline-none focus:border-[#5b3fb0]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-[#f0ebf5]">
                      <button
                        type="button"
                        onClick={() => setEditingSlotRole(null)}
                        className="px-4 py-1.5 rounded-full bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        Done Editing
                      </button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Right Column: Cascade Rail Diagram */}
        <aside className="lg:col-span-1 bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[#231a30]">
              How your executors step in
            </h2>
            <p className="text-xs text-[#6c6478] mt-0.5">
              The court recognizes succession in this exact order.
            </p>
          </div>

          <ol className="space-y-1 list-none p-0 m-0">
            {/* Step A */}
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-[#382852] text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                a
              </span>
              <div>
                <b className="text-xs font-bold text-[#231a30] block">Executor and trustee</b>
                <span className="text-xs text-[#6c6478]">{namesInCascade[0]}</span>
              </div>
            </li>

            {/* Rail 1 */}
            <li className="flex items-center gap-3 py-1">
              <div className="w-8 flex justify-center">
                <div className="w-0.5 h-7 bg-[#cfc6da]" />
              </div>
              <span className="text-[11px] font-semibold text-[#8a6233]">
                If they cannot or will not act
              </span>
            </li>

            {/* Step B */}
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-[#382852] text-[#231a30] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                b
              </span>
              <div>
                <b className="text-xs font-bold text-[#231a30] block">Substitute executor</b>
                <span className="text-xs text-[#6c6478]">{namesInCascade[1]}</span>
              </div>
            </li>

            {/* Rail 2 */}
            <li className="flex items-center gap-3 py-1">
              <div className="w-8 flex justify-center">
                <div className="w-0.5 h-7 bg-[#cfc6da]" />
              </div>
              <span className="text-[11px] font-semibold text-[#8a6233]">
                If both die before the Will is proved
              </span>
            </li>

            {/* Step C */}
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-dashed border-[#cfc6da] text-[#6c6478] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                c
              </span>
              <div>
                <b className="text-xs font-bold text-[#231a30] block">Further appointment</b>
                <span className="text-xs text-[#6c6478]">{namesInCascade[2]}</span>
              </div>
            </li>
          </ol>

          <p className="text-[11px] text-[#6c6478] pt-3 border-t border-[#f0ebf5] leading-relaxed">
            Each person needs a passport. Add their Emirates ID if they live in the UAE.
          </p>
        </aside>
      </div>
    </div>
  );
}
