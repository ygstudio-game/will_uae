"use client";

import React, { useState } from "react";
import { Plus, Trash2, HeartHandshake, CheckCircle2, RotateCw, Edit2 } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { RoleType, PersonData } from "@/types/owa";
import { UniversalPersonModal } from "@/components/owa-wizard/UniversalPersonModal";

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
    assignPersonToRole,
    removeRoleAssignment,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const existingPersons = application?.persons || [];

  // Modal State for UniversalPersonModal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPersonToEdit, setModalPersonToEdit] = useState<PersonData | null>(null);
  const [modalDefaultRelationship, setModalDefaultRelationship] = useState("Spouse");
  const [modalAssignSlot, setModalAssignSlot] = useState<SlotDef | null>(null);

  const getAssignment = (role: RoleType, order: number) => {
    return activeWill?.roleAssignments.find(
      (ra) => ra.role === role && ra.appointmentOrder === order
    );
  };

  const potentialSpouse = existingPersons.find(
    (p) =>
      p.id !== activeWill?.testatorPersonId &&
      (p.relationship?.toLowerCase() === "spouse" ||
        p.relationship?.toLowerCase() === "wife" ||
        p.relationship?.toLowerCase() === "husband")
  );

  const primaryAssignment = getAssignment("EXECUTOR_PRIMARY", 1);
  const primaryPerson =
    primaryAssignment?.person ||
    existingPersons.find((ep) => ep.id === primaryAssignment?.personId);

  const isSpouseAlreadyPrimary = Boolean(
    primaryPerson &&
      (primaryPerson.relationship?.toLowerCase() === "spouse" ||
        primaryPerson.relationship?.toLowerCase() === "wife" ||
        primaryPerson.relationship?.toLowerCase() === "husband" ||
        (potentialSpouse && primaryPerson.id === potentialSpouse.id))
  );

  // Appoint Spouse action (opens modal if spouse not created yet, or assigns immediately if exists)
  const handleAppointSpouseExecutor = () => {
    if (potentialSpouse) {
      assignPersonToRole(potentialSpouse.id, "EXECUTOR_PRIMARY", 1);
    } else {
      setModalPersonToEdit(null);
      setModalDefaultRelationship("Spouse");
      setModalAssignSlot(SLOTS[0]);
      setModalOpen(true);
    }
  };

  // Add new person to slot
  const handleAddNewPersonToSlot = (slot: SlotDef) => {
    setModalPersonToEdit(null);
    setModalDefaultRelationship(slot.order === 1 ? "Spouse" : "Relative");
    setModalAssignSlot(slot);
    setModalOpen(true);
  };

  // Edit existing person details
  const handleEditPerson = (person: PersonData) => {
    setModalPersonToEdit(person);
    setModalAssignSlot(null);
    setModalOpen(true);
  };

  // Select existing person or "+ Add a new person..." from dropdown
  const handleDropdownChange = (slot: SlotDef, value: string) => {
    if (!value) return;
    if (value === "__ADD_NEW__") {
      handleAddNewPersonToSlot(slot);
    } else {
      assignPersonToRole(value, slot.role, slot.order);
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
          {/* Quick Spouse Executor Banner: stays visible unless spouse is already 1st executor */}
          {!isSpouseAlreadyPrimary && (
            <div className="bg-[#382852] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-5 h-5 text-[#d7b48b] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d7b48b]">
                    Appoint Spouse as 1st Executor
                  </h4>
                  <p className="text-xs text-[#d9d0e6] mt-0.5">
                    {potentialSpouse ? (
                      <>
                        Set <strong>{potentialSpouse.fullName || "your spouse"}</strong> as your primary executor and trustee.
                        {primaryPerson && ` (Currently: ${primaryPerson.fullName})`}
                      </>
                    ) : (
                      <>
                        Most testators appoint their spouse as their primary executor and trustee.
                        {primaryPerson && ` (Currently: ${primaryPerson.fullName})`}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAppointSpouseExecutor}
                className="px-4 py-2 bg-[#d7b48b] hover:bg-[#c5a37a] text-[#281b40] text-xs font-semibold rounded-full shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                {primaryPerson
                  ? "Switch 1st Executor to Spouse"
                  : potentialSpouse
                  ? `Appoint ${potentialSpouse.fullName ? potentialSpouse.fullName.split(" ")[0] : "Spouse"} as Executor`
                  : "+ Appoint Spouse as Executor"}
              </button>
            </div>
          )}

          {SLOTS.map((slot) => {
            const assignment = getAssignment(slot.role, slot.order);
            const executorPerson =
              assignment?.person ||
              existingPersons.find((p) => p.id === assignment?.personId);
            const isAssigned = !!assignment && !!executorPerson;

            // Slot Assigned View
            if (isAssigned) {
              const hasPassport = Boolean(
                executorPerson.passportNumber ||
                executorPerson.documents?.some((d) => d.documentType === "PASSPORT")
              );
              const details = [
                executorPerson.relationship || "Relative",
                executorPerson.nationality || "British",
                executorPerson.isUaeResident ? "lives in the UAE" : "lives outside the UAE",
                hasPassport ? "passport uploaded" : null,
                executorPerson.emiratesId
                  ? `ID ${executorPerson.emiratesId}`
                  : null,
              ].filter(Boolean);

              return (
                <section
                  key={slot.role}
                  className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                        {slot.label.toUpperCase()}
                      </span>
                      <h2 className="text-xl sm:text-[22px] font-serif font-bold text-[#0B1528] leading-tight tracking-tight">
                        {executorPerson.fullName || "Named Executor"}
                      </h2>
                      {executorPerson.arabicName && (
                        <span className="text-[15px] sm:text-[16px] font-arabic text-[#231a30] font-normal block w-fit text-left leading-relaxed" dir="rtl">
                          {executorPerson.arabicName}
                        </span>
                      )}
                      <p className="text-[13px] text-[#6c6478] leading-relaxed pt-0.5">
                        {details.join(" · ")}
                      </p>
                      <p className="text-xs text-[#797287] pt-1">
                        {slot.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditPerson(executorPerson)}
                        className="px-3.5 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit details
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRoleAssignment(assignment.id)}
                        className="text-xs text-[#b42318] hover:underline font-semibold cursor-pointer px-1"
                      >
                        Change person
                      </button>
                    </div>
                  </div>
                </section>
              );
            }

            // Slot Empty Picker View
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
                  <span className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                    {slot.label.toUpperCase()} · {slot.tag.toUpperCase()}
                  </span>
                  <h2 className="text-lg font-serif font-bold text-[#0B1528]">
                    {slot.order === 1 ? "Primary executor required" : slot.order === 2 ? "Appoint first backup executor" : "Appoint second backup executor"}
                  </h2>
                  <p className="text-xs text-[#6c6478]">
                    {slot.desc}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-[#231a30] mb-1">
                        Choose someone already in your Will
                      </label>
                      <select
                        defaultValue=""
                        onChange={(e) => handleDropdownChange(slot, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0] cursor-pointer"
                      >
                        <option value="" disabled>
                          Select a person
                        </option>
                        {existingPersons
                          .filter((p) => Boolean(p.fullName?.trim()) && p.id !== activeWill?.testatorPersonId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.fullName} ({p.relationship || "Person"})
                            </option>
                          ))}
                        <option value="__ADD_NEW__" className="font-semibold text-[#5b3fb0]">
                          + Add a new person...
                        </option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddNewPersonToSlot(slot)}
                      className="px-5 py-2.5 bg-[#0B1528] hover:bg-[#1a2942] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer border border-[#A37E44]/40 active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4 text-[#d7b48b] stroke-[2.5]" />
                      <span>+ Add a new person</span>
                    </button>

                    {slot.order === 1 && !potentialSpouse && (
                      <button
                        type="button"
                        onClick={handleAppointSpouseExecutor}
                        className="px-3.5 py-2.5 border border-[#382852] text-[#382852] hover:bg-[#382852] hover:text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        + Appoint Spouse
                      </button>
                    )}
                  </div>
                </div>
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
            Each person needs a passport. An Emirates ID is required if they live in the UAE.
          </p>
        </aside>
      </div>

      {/* Universal Person Modal */}
      <UniversalPersonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        personToEdit={modalPersonToEdit}
        defaultRelationship={modalDefaultRelationship}
        title={
          modalPersonToEdit
            ? `Edit ${modalPersonToEdit.fullName || "person"}`
            : modalDefaultRelationship.toLowerCase() === "spouse"
            ? "Add your spouse"
            : modalAssignSlot
            ? `Add person for ${modalAssignSlot.label}`
            : "Add a person"
        }
        allowCharity={false}
        onSave={(savedPerson) => {
          if (modalAssignSlot) {
            assignPersonToRole(savedPerson.id, modalAssignSlot.role, modalAssignSlot.order);
          }
        }}
      />
    </div>
  );
}
