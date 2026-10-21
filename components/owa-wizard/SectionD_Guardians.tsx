"use client";

import React, { useState } from "react";
import { Plus, Trash2, HeartHandshake } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { RoleType } from "@/types/owa";
import { transliterateToName } from "@/lib/transliterate";
import Link from "next/link";

interface GuardianSlotDef {
  role: RoleType;
  order: number;
  label: string;
  tag: string;
  color: string;
  desc: string;
}

const GUARDIAN_SLOTS: GuardianSlotDef[] = [
  {
    role: "GUARDIAN_PERMANENT",
    order: 1,
    label: "Permanent guardian",
    tag: "Required",
    color: "#5b3fb0",
    desc: "Raises your children while they are under the age of full capacity.",
  },
  {
    role: "GUARDIAN_SUBSTITUTE_PERM",
    order: 2,
    label: "Backup permanent guardian",
    tag: "Recommended",
    color: "#5b3fb0",
    desc: "Acts if your permanent guardian dies before you or cannot act.",
  },
  {
    role: "GUARDIAN_TEMPORARY",
    order: 1,
    label: "Interim guardian",
    tag: "Recommended",
    color: "#8a6233",
    desc: "Someone already in the UAE can step in at once, for example while a guardian travels from abroad.",
  },
  {
    role: "GUARDIAN_TEMPORARY",
    order: 2,
    label: "Backup interim guardian",
    tag: "Optional",
    color: "#6c6478",
    desc: "Acts if your interim guardian dies before you or cannot act.",
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
  const childAssignments = activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];

  // Identify minor children (age < 18)
  const calculateAge = (dobString?: string | null): number | null => {
    if (!dobString) return null;
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const minorChildren = childAssignments.filter((ca) => {
    const p = ca.person || existingPersons.find((ep) => ep.id === ca.personId);
    if (!p) return false;
    const age = calculateAge(p.dob);
    return age === null || age < 18;
  });

  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);

  // Check if partner/spouse exists in application
  const potentialSpouse = existingPersons.find(
    (p) =>
      p.id !== activeWill?.testatorPersonId &&
      (p.relationship?.toLowerCase() === "spouse" ||
        p.relationship?.toLowerCase() === "wife" ||
        p.relationship?.toLowerCase() === "husband")
  );

  const getSlotKey = (slot: GuardianSlotDef) => `${slot.role}:${slot.order}`;

  const getAssignment = (slot: GuardianSlotDef) => {
    return activeWill?.roleAssignments.find(
      (ra) => ra.role === slot.role && ra.appointmentOrder === slot.order
    );
  };

  const handleSelectExistingPerson = (slot: GuardianSlotDef, personId: string) => {
    if (!personId) return;
    assignPersonToRole(personId, slot.role, slot.order);
    setEditingSlotKey(null);
  };

  const handleAddNewPerson = async (slot: GuardianSlotDef) => {
    const isInterim = slot.label.includes("Interim");
    const newPerson = await addOrUpdatePerson({
      fullName: "",
      relationship: slot.order === 1 && !isInterim ? "Spouse" : "Relative",
      nationality: "British",
      isUaeResident: isInterim,
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, slot.role, slot.order);
      setEditingSlotKey(getSlotKey(slot));
    }
  };

  const handleAppointSurvivingSpouse = async () => {
    if (potentialSpouse) {
      assignPersonToRole(potentialSpouse.id, "GUARDIAN_PERMANENT", 1);
    } else {
      const newPerson = await addOrUpdatePerson({
        fullName: "",
        relationship: "Spouse",
        nationality: "British",
        isUaeResident: true,
      });
      if (newPerson) {
        assignPersonToRole(newPerson.id, "GUARDIAN_PERMANENT", 1);
        setEditingSlotKey("GUARDIAN_PERMANENT:1");
      }
    }
  };

  const handleUpdateGuardian = async (personId: string, updates: Record<string, any>) => {
    await addOrUpdatePerson({
      id: personId,
      ...updates,
    });
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

  // If no minor children exist
  if (childAssignments.length === 0 || minorChildren.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#efeaf7] p-6 sm:p-7 rounded-2xl border border-transparent space-y-2">
          <h2 className="text-lg font-serif font-bold text-[#231a30]">
            No guardians needed
          </h2>
          <p className="text-sm text-[#6c6478] leading-relaxed">
            {childAssignments.length > 0
              ? "None of the children you listed is under 18."
              : "You told us you have no children."}{" "}
            Section Nine of your Will stays empty.{" "}
            <Link href="/wizard/children" className="text-[#5b3fb0] font-semibold underline">
              Change your answer in Section B
            </Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Minor children chip banner */}
      <div className="flex flex-wrap items-center gap-2">
        {minorChildren.map((ca) => {
          const p = ca.person || existingPersons.find((ep) => ep.id === ca.personId);
          const age = calculateAge(p?.dob);
          return (
            <span
              key={ca.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#efeaf7] text-[#4a3a86]"
            >
              Covers {p?.fullName || "Child"}, age {age !== null ? age : "<18"}
            </span>
          );
        })}
      </div>

      {/* 3-Stage Visual Timeline Figure */}
      <figure className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm m-0">
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0">
          <li className="pt-2 border-t-2 border-[#cfc6da] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c6478] block">
              At death
            </span>
            <b className="text-sm font-serif text-[#231a30] block">
              Children need care at once
            </b>
            <span className="text-xs text-[#6c6478] leading-relaxed block">
              Your Will can name four people for two roles.
            </span>
          </li>

          <li className="pt-2 border-t-2 border-[#d7b48b] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6233] block">
              Interim period
            </span>
            <b className="text-sm font-serif text-[#231a30] block">
              Interim guardian
            </b>
            <span className="text-xs text-[#6c6478] leading-relaxed block">
              Cares for the children until the permanent guardian can take custody.
            </span>
          </li>

          <li className="pt-2 border-t-2 border-[#5b3fb0] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5b3fb0] block">
              Long term
            </span>
            <b className="text-sm font-serif text-[#231a30] block">
              Permanent guardian
            </b>
            <span className="text-xs text-[#6c6478] leading-relaxed block">
              Raises the children while they are under the age of full capacity.
            </span>
          </li>
        </ol>
      </figure>

      {/* Quick Spouse Permanent Guardian Option */}
      {!getAssignment(GUARDIAN_SLOTS[0]) && (
        <div className="bg-[#382852] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-[#d7b48b] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d7b48b]">
                Appoint Surviving Spouse
              </h4>
              <p className="text-xs text-[#d9d0e6] mt-0.5">
                {potentialSpouse ? (
                  <>Set <strong>{potentialSpouse.fullName}</strong> as your primary permanent guardian.</>
                ) : (
                  <>Under ADJD rules, parental guardianship vests primarily in your surviving spouse upon demise.</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAppointSurvivingSpouse}
            className="px-4 py-2 bg-[#d7b48b] hover:bg-[#c5a37a] text-[#281b40] text-xs font-semibold rounded-full shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Appoint Surviving Spouse
          </button>
        </div>
      )}

      {/* 4 Guardian Slots in 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GUARDIAN_SLOTS.map((slot) => {
          const assignment = getAssignment(slot);
          const guardianPerson =
            assignment?.person ||
            existingPersons.find((p) => p.id === assignment?.personId);
          const isAssigned = !!assignment && !!guardianPerson;
          const slotKey = getSlotKey(slot);
          const isEditing = editingSlotKey === slotKey;

          // Assigned view
          if (isAssigned && !isEditing) {
            const details = [
              guardianPerson.relationship || "Guardian",
              guardianPerson.nationality || "British",
              guardianPerson.isUaeResident ? "lives in the UAE" : "lives outside the UAE",
              guardianPerson.passportNumber ? `passport ${guardianPerson.passportNumber}` : "passport uploaded",
            ].filter(Boolean);

            return (
              <section
                key={slotKey}
                className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span
                    className="text-xs font-bold uppercase tracking-wider block"
                    style={{ color: slot.color }}
                  >
                    {slot.label} · {slot.tag}
                  </span>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#231a30]">
                    {guardianPerson.fullName || "Named Guardian"}
                  </h2>
                  {guardianPerson.arabicName && (
                    <span className="text-sm font-arabic text-[#231a30] block" dir="rtl">
                      {guardianPerson.arabicName}
                    </span>
                  )}
                  <p className="text-xs text-[#6c6478]">
                    {details.join(" · ")}
                  </p>
                  <p className="text-xs text-[#6c6478] pt-1">
                    {slot.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f0ebf5]">
                  <button
                    type="button"
                    onClick={() => setEditingSlotKey(slotKey)}
                    className="px-3.5 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoleAssignment(assignment.id)}
                    className="text-xs text-[#b42318] hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </section>
            );
          }

          // Unassigned or editing view
          return (
            <section
              key={slotKey}
              className={`bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border transition-all ${
                slot.tag === "Required"
                  ? "border-2 border-[#d7b48b] shadow-sm"
                  : "border-2 border-dashed border-[#cfc6da]"
              }`}
            >
              <div className="space-y-1 mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider block"
                  style={{ color: slot.color }}
                >
                  {slot.label} · {slot.tag}
                </span>
                <h2 className="text-base font-serif font-bold text-[#231a30]">
                  {isAssigned ? "Edit guardian" : "Not named yet"}
                </h2>
                <p className="text-xs text-[#6c6478]">
                  {slot.desc}
                </p>
              </div>

              {!isAssigned ? (
                /* Picker row */
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#231a30]">
                      Choose someone already in your Will
                    </label>
                    <select
                      defaultValue=""
                      onChange={(e) => handleSelectExistingPerson(slot, e.target.value)}
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
                    className="w-full py-2.5 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add a new person
                  </button>
                </div>
              ) : (
                /* Editing form */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Full Legal Name (English) *
                    </label>
                    <input
                      type="text"
                      defaultValue={guardianPerson.fullName || ""}
                      key={`guard-name-${guardianPerson.fullName}`}
                      onBlur={(e) =>
                        handleGuardianNameBlur(guardianPerson.id, e.target.value, guardianPerson.arabicName)
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
                      defaultValue={guardianPerson.arabicName || ""}
                      key={`guard-ar-${guardianPerson.arabicName}`}
                      onBlur={(e) => handleUpdateGuardian(guardianPerson.id, { arabicName: e.target.value })}
                      placeholder="ديفيد ألان ويتفيلد"
                      className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-arabic bg-white focus:outline-none focus:border-[#5b3fb0]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#231a30] mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        defaultValue={guardianPerson.nationality || ""}
                        key={`guard-nat-${guardianPerson.nationality}`}
                        onBlur={(e) => handleUpdateGuardian(guardianPerson.id, { nationality: e.target.value })}
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
                        defaultValue={guardianPerson.passportNumber || ""}
                        key={`guard-pass-${guardianPerson.passportNumber}`}
                        onBlur={(e) => handleUpdateGuardian(guardianPerson.id, { passportNumber: e.target.value })}
                        placeholder="GBR12345678"
                        className="w-full px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-mono bg-white focus:outline-none focus:border-[#5b3fb0]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f0ebf5]">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateGuardian(guardianPerson.id, {
                          passportNumber: "GBR77665544",
                          arabicName: "ديفيد ألان ويتفيلد",
                        })
                      }
                      className="text-xs text-[#5b3fb0] hover:underline font-medium"
                    >
                      ⚡ Simulate passport
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingSlotKey(null)}
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
    </div>
  );
}
