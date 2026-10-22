"use client";

import React, { useState } from "react";
import { Plus, HeartHandshake, Edit2 } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { RoleType, PersonData } from "@/types/owa";
import Link from "next/link";
import { UniversalPersonModal } from "./UniversalPersonModal";

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
    tag: "Recommended",
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
    assignPersonToRole,
    removeRoleAssignment,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const existingPersons = application?.persons || [];
  const childAssignments = activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];

  // Modal State for UniversalPersonModal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPersonToEdit, setModalPersonToEdit] = useState<PersonData | null>(null);
  const [modalAssignSlot, setModalAssignSlot] = useState<GuardianSlotDef | null>(null);
  const [modalDefaultRelationship, setModalDefaultRelationship] = useState("Spouse");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);

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

  // Check if partner/spouse exists in application
  const potentialSpouse = existingPersons.find(
    (p) =>
      p.id !== activeWill?.testatorPersonId &&
      Boolean(p.fullName?.trim()) &&
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

  const permanentGuardianAssignment = getAssignment(GUARDIAN_SLOTS[0]);
  const permanentGuardianPerson =
    permanentGuardianAssignment?.person ||
    existingPersons.find((p) => p.id === permanentGuardianAssignment?.personId);

  const isSpousePermanentGuardian = Boolean(
    permanentGuardianPerson &&
      (permanentGuardianPerson.relationship?.toLowerCase() === "spouse" ||
        permanentGuardianPerson.relationship?.toLowerCase() === "wife" ||
        permanentGuardianPerson.relationship?.toLowerCase() === "husband" ||
        (potentialSpouse && permanentGuardianPerson.id === potentialSpouse.id))
  );

  // Appoint Spouse action (opens modal if spouse not created yet, or assigns immediately if exists)
  const handleAppointSurvivingSpouse = () => {
    if (potentialSpouse && potentialSpouse.fullName?.trim()) {
      assignPersonToRole(potentialSpouse.id, "GUARDIAN_PERMANENT", 1);
    } else {
      setModalPersonToEdit(null);
      setModalDefaultRelationship("Spouse");
      setModalAssignSlot(GUARDIAN_SLOTS[0]);
      setModalTitle("Add your spouse");
      setModalOpen(true);
    }
  };

  // Add new person to slot
  const handleAddNewPersonToSlot = (slot: GuardianSlotDef) => {
    setModalPersonToEdit(null);
    setModalDefaultRelationship(
      slot.order === 1 && !slot.label.includes("Interim") ? "Spouse" : "Relative"
    );
    setModalAssignSlot(slot);
    setModalTitle(slot.label.includes("Interim") ? "Add interim guardian" : "Add guardian");
    setModalOpen(true);
  };

  // Edit existing person details
  const handleEditPerson = (person: PersonData) => {
    setModalPersonToEdit(person);
    setModalAssignSlot(null);
    setModalTitle(`Edit ${person.fullName || "guardian"}`);
    setModalOpen(true);
  };

  // Select existing person or "+ Add a new person..." from dropdown
  const handleDropdownChange = (slot: GuardianSlotDef, value: string) => {
    if (!value) return;
    if (value === "__ADD_NEW__") {
      handleAddNewPersonToSlot(slot);
    } else {
      assignPersonToRole(value, slot.role, slot.order);
    }
  };

  // If user has not yet answered Section B (Children)
  if (!activeWill?.childrenAnswered && childAssignments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#FAF9FC] p-6 sm:p-7 rounded-2xl border border-[#cfc6da] space-y-3">
          <h2 className="text-lg font-serif font-bold text-[#231a30]">
            Answer the children question first
          </h2>
          <p className="text-sm text-[#6c6478] leading-relaxed">
            Please answer Section B (Children) before appointing guardians, to determine whether court guardianship appointments are required for your Will.
          </p>
          <Link
            href="/wizard/children"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#382852] text-white text-xs font-semibold hover:bg-[#231a30] transition-colors"
          >
            Go to Section B (Children) →
          </Link>
        </div>
      </div>
    );
  }

  // If user answered but has no minor children (or no children at all)
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
              : "You indicated that you do not have minor children."}{" "}
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

      {/* Quick Spouse Permanent Guardian Option: stays visible unless spouse is already permanent guardian */}
      {!isSpousePermanentGuardian && (
        <div className="bg-[#382852] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-[#d7b48b] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d7b48b]">
                Appoint Surviving Spouse
              </h4>
              <p className="text-xs text-[#d9d0e6] mt-0.5">
                {potentialSpouse ? (
                  <>
                    Set <strong>{potentialSpouse.fullName}</strong> as your primary permanent guardian.
                    {permanentGuardianPerson && ` (Currently: ${permanentGuardianPerson.fullName})`}
                  </>
                ) : (
                  <>
                    Under ADJD rules, parental guardianship vests primarily in your surviving spouse upon demise.
                    {permanentGuardianPerson && ` (Currently: ${permanentGuardianPerson.fullName})`}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAppointSurvivingSpouse}
            className="px-4 py-2 bg-[#d7b48b] hover:bg-[#c5a37a] text-[#281b40] text-xs font-semibold rounded-full shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {permanentGuardianPerson
              ? "Switch Guardian to Spouse"
              : potentialSpouse
              ? `Appoint ${potentialSpouse.fullName ? potentialSpouse.fullName.split(" ")[0] : "Spouse"}`
              : "+ Appoint Spouse as Guardian"}
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

          // Assigned view
          if (isAssigned) {
            const hasPassport = Boolean(
              guardianPerson.passportNumber ||
              guardianPerson.documents?.some((d) => d.documentType === "PASSPORT")
            );
            const details = [
              guardianPerson.relationship || "Guardian",
              guardianPerson.nationality || "British",
              guardianPerson.isUaeResident ? "lives in the UAE" : "lives outside the UAE",
              hasPassport ? "passport uploaded" : null,
              guardianPerson.emiratesId ? `EID ${guardianPerson.emiratesId}` : null,
            ].filter(Boolean);

            return (
              <section
                key={slotKey}
                className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                    {slot.label.toUpperCase()} · {slot.tag.toUpperCase()}
                  </span>
                  <h2 className="text-xl sm:text-[22px] font-serif font-bold text-[#0B1528] leading-tight tracking-tight">
                    {guardianPerson.fullName || "Named Guardian"}
                  </h2>
                  {guardianPerson.arabicName && (
                    <span className="text-[15px] sm:text-[16px] font-arabic text-[#231a30] font-normal block w-fit text-left leading-relaxed" dir="rtl">
                      {guardianPerson.arabicName}
                    </span>
                  )}
                  <p className="text-[13px] text-[#6c6478] leading-relaxed pt-0.5">
                    {details.join(" · ")}
                  </p>
                  <p className="text-xs text-[#797287] pt-1">
                    {slot.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f0ebf5]">
                  <button
                    type="button"
                    onClick={() => handleEditPerson(guardianPerson)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit details
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoleAssignment(assignment.id)}
                    className="text-xs text-[#b42318] hover:underline font-semibold cursor-pointer"
                  >
                    Change person
                  </button>
                </div>
              </section>
            );
          }

          // Unassigned view with dropdown & Add person button
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
                <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                  {slot.label.toUpperCase()} · {slot.tag.toUpperCase()}
                </span>
                <h2 className="text-lg font-serif font-bold text-[#0B1528]">
                  {slot.order === 1 && !slot.label.includes("Interim")
                    ? "Permanent guardian required"
                    : `Appoint ${slot.label.toLowerCase()}`}
                </h2>
                <p className="text-xs text-[#6c6478]">
                  {slot.desc}
                </p>
              </div>

              {/* Picker row */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#231a30]">
                    Choose someone already in your Will
                  </label>
                  <select
                    value=""
                    onChange={(e) => handleDropdownChange(slot, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a person
                    </option>
                    <option value="__ADD_NEW__" className="font-semibold text-[#5b3fb0]">
                      + Add a new person...
                    </option>
                    {existingPersons
                      .filter(
                        (p) =>
                          Boolean(p.fullName?.trim()) &&
                          p.id !== activeWill?.testatorPersonId &&
                          !childAssignments.some((ca) => ca.personId === p.id)
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.relationship || "Person"})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddNewPersonToSlot(slot)}
                  className="w-full py-2.5 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add a new person
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* Universal Person Modal for adding/editing */}
      <UniversalPersonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        personToEdit={modalPersonToEdit}
        defaultRelationship={modalDefaultRelationship}
        title={modalTitle}
        allowCharity={false}
        onSave={(saved) => {
          if (modalAssignSlot) {
            assignPersonToRole(saved.id, modalAssignSlot.role, modalAssignSlot.order);
          }
        }}
      />
    </div>
  );
}
