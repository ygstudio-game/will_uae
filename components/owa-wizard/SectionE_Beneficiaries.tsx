"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, CheckCircle2, AlertCircle, X, Edit2, Shield, HeartHandshake, Scale, Sliders } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { PersonData, RoleType } from "@/types/owa";
import Link from "next/link";
import { UniversalPersonModal } from "./UniversalPersonModal";

const PRIMARY_COLORS = ["#5b3fb0", "#4a3a86", "#d7b48b", "#2f7a55"];
const SUB_COLORS = ["#c73a30", "#7a1d14"];
const SUB_LETTERS = ["A", "B"];

/**
 * Robust BeneficiaryShareControl:
 * 1. Range slider for smooth, immediate visual adjustment.
 * 2. Numeric input that lets user type freely without interruptions or deselecting.
 * 3. Validation and store commit ONLY happen AFTER typing is done (onBlur or Enter).
 */
function BeneficiaryShareControl({
  value,
  onChange,
  color = "#382852",
  disabled = false,
}: {
  value: number | null | undefined;
  onChange: (val: number) => void;
  color?: string;
  disabled?: boolean;
}) {
  const numericVal = value !== null && value !== undefined ? Math.round(Number(value)) : 0;
  const [text, setText] = useState<string>(String(numericVal));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setText(String(numericVal));
    }
  }, [numericVal]);

  // While typing: do NOT validate, clamp, or call parent onChange!
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^\d*$/.test(raw)) return;
    setText(raw);
  };

  // Check AFTER typing finishes (on blur or Enter)
  const handleCommit = () => {
    isFocused.current = false;
    let finalVal = 0;
    if (text !== "" && !isNaN(parseInt(text, 10))) {
      finalVal = Math.min(100, Math.max(0, parseInt(text, 10)));
    }
    setText(String(finalVal));
    onChange(finalVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Slider change: user is dragging slider, smoothly commit
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    setText(String(val));
    onChange(val);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Interactive Range Slider */}
      <div className="flex-1 sm:w-28 md:w-36 flex items-center gap-1.5">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={numericVal}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full h-2 bg-[#efeaf7] rounded-lg appearance-none cursor-pointer accent-[#382852] focus:outline-none"
          title={`Adjust share: ${numericVal}%`}
        />
      </div>

      {/* Robust Text Input (checks only after typing on blur / enter) */}
      <div className="flex items-center gap-1 bg-white border border-[#cfc6da] rounded-lg px-2.5 py-1.5 focus-within:border-[#5b3fb0] focus-within:ring-2 focus-within:ring-[#5b3fb0]/20 transition-all shadow-2xs">
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onFocus={() => {
            isFocused.current = true;
          }}
          onChange={handleInputChange}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-10 text-sm font-mono font-bold text-right text-[#231a30] bg-transparent focus:outline-none"
          placeholder="0"
        />
        <span className="text-xs font-bold text-[#6c6478] select-none">%</span>
      </div>
    </div>
  );
}

export function SectionE_Beneficiaries() {
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
    updateRoleShares,
    removeRoleAssignment,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const existingPersons = application?.persons || [];
  const testatorId = activeWill?.testatorPersonId;

  // Potential spouse
  const potentialSpouse = existingPersons.find(
    (p) =>
      p.id !== testatorId &&
      (p.relationship?.toLowerCase() === "spouse" ||
        p.relationship?.toLowerCase() === "wife" ||
        p.relationship?.toLowerCase() === "husband")
  );

  // Active role assignments
  const primaryAssignments = (activeWill?.roleAssignments || [])
    .filter((ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY")
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  const substituteAssignments = (activeWill?.roleAssignments || [])
    .filter((ra) => ra.role === "BENEFICIARY_SUBSTITUTE")
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  // Totals
  const primaryTotal =
    Math.round(
      primaryAssignments.reduce((sum, ra) => sum + (Number(ra.sharePercentage) || 0), 0) * 100
    ) / 100;
  const substituteTotal =
    Math.round(
      substituteAssignments.reduce((sum, ra) => sum + (Number(ra.sharePercentage) || 0), 0) * 100
    ) / 100;

  const soleSpouse =
    potentialSpouse &&
    primaryAssignments.length === 1 &&
    primaryAssignments[0].personId === potentialSpouse.id &&
    primaryTotal === 100;

  // Modal State for Adding / Editing a Person via UniversalPersonModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"BENEFICIARY_PRIMARY" | "BENEFICIARY_SUBSTITUTE">(
    "BENEFICIARY_PRIMARY"
  );
  const [personToEdit, setPersonToEdit] = useState<PersonData | null>(null);
  const [defaultRelationship, setDefaultRelationship] = useState("Spouse");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [isSpouse100Mode, setIsSpouse100Mode] = useState(false);

  // Auto-initialize Primary 1 if none exists
  const hasAutoInitialized = useRef(false);
  useEffect(() => {
    if (!hasAutoInitialized.current && primaryAssignments.length === 0) {
      hasAutoInitialized.current = true;
      if (potentialSpouse && potentialSpouse.fullName?.trim()) {
        assignPersonToRole(potentialSpouse.id, "BENEFICIARY_PRIMARY", 1, 100);
      } else {
        const firstNamedChild = existingPersons.find(
          (p) =>
            p.id !== testatorId &&
            Boolean(p.fullName?.trim()) &&
            activeWill?.roleAssignments.some(
              (ra) => ra.role === "CHILD" && ra.personId === p.id
            )
        );
        if (firstNamedChild) {
          assignPersonToRole(firstNamedChild.id, "BENEFICIARY_PRIMARY", 1, 100);
        }
      }
    }
  }, [primaryAssignments.length, potentialSpouse, existingPersons, testatorId, activeWill]);

  // Open modal for Adding New Person
  const handleOpenAddPerson = (
    role: "BENEFICIARY_PRIMARY" | "BENEFICIARY_SUBSTITUTE",
    defaultRel = "Child"
  ) => {
    setModalRole(role);
    setPersonToEdit(null);
    setDefaultRelationship(defaultRel);
    setModalTitle(defaultRel === "Spouse" ? "Add your spouse" : undefined);
    setIsSpouse100Mode(false);
    setIsModalOpen(true);
  };

  // Open modal for Editing an Existing Person
  const handleOpenEditPerson = (person: PersonData) => {
    setPersonToEdit(person);
    setModalTitle(`Edit ${person.fullName || "beneficiary"}`);
    setIsSpouse100Mode(false);
    setIsModalOpen(true);
  };

  // Quick 100% spouse appointment
  const handleAppointSpouse100 = () => {
    if (potentialSpouse && potentialSpouse.fullName?.trim()) {
      for (let i = 1; i < primaryAssignments.length; i++) {
        removeRoleAssignment(primaryAssignments[i].id);
      }
      assignPersonToRole(potentialSpouse.id, "BENEFICIARY_PRIMARY", 1, 100);
    } else {
      setModalRole("BENEFICIARY_PRIMARY");
      setPersonToEdit(null);
      setDefaultRelationship("Spouse");
      setModalTitle("Add your spouse");
      setIsSpouse100Mode(true);
      setIsModalOpen(true);
    }
  };

  // Save handler from UniversalPersonModal
  const handleModalSave = (savedPerson: PersonData) => {
    if (isSpouse100Mode) {
      for (let i = 1; i < primaryAssignments.length; i++) {
        removeRoleAssignment(primaryAssignments[i].id);
      }
      assignPersonToRole(savedPerson.id, "BENEFICIARY_PRIMARY", 1, 100);
      setIsSpouse100Mode(false);
      return;
    }

    if (!personToEdit) {
      if (modalRole === "BENEFICIARY_PRIMARY") {
        if (primaryAssignments.length === 1 && (primaryAssignments[0].sharePercentage === 100 || primaryTotal === 100)) {
          // Auto split 50 / 50 when adding 2nd beneficiary
          updateRoleShares("BENEFICIARY_PRIMARY", [
            { assignmentId: primaryAssignments[0].id, sharePercentage: 50 },
          ]);
          assignPersonToRole(savedPerson.id, "BENEFICIARY_PRIMARY", 2, 50);
        } else {
          const remaining = Math.max(0, 100 - primaryTotal);
          assignPersonToRole(
            savedPerson.id,
            "BENEFICIARY_PRIMARY",
            primaryAssignments.length + 1,
            remaining > 0 ? remaining : 0
          );
        }
      } else {
        if (substituteAssignments.length === 1 && (substituteAssignments[0].sharePercentage === 100 || substituteTotal === 100)) {
          // Auto split 50 / 50 when adding 2nd substitute
          updateRoleShares("BENEFICIARY_SUBSTITUTE", [
            { assignmentId: substituteAssignments[0].id, sharePercentage: 50 },
          ]);
          assignPersonToRole(savedPerson.id, "BENEFICIARY_SUBSTITUTE", 2, 50);
        } else {
          const remaining = Math.max(0, 100 - substituteTotal);
          assignPersonToRole(
            savedPerson.id,
            "BENEFICIARY_SUBSTITUTE",
            substituteAssignments.length + 1,
            remaining > 0 ? remaining : 0
          );
        }
      }
    }
  };

  // Pick existing person for Primary
  const handleSelectExistingPrimary = (personId: string) => {
    if (!personId) return;
    if (personId === "__ADD_NEW__") {
      handleOpenAddPerson("BENEFICIARY_PRIMARY", "Relative");
      return;
    }
    if (primaryAssignments.length >= 4) return;
    if (primaryAssignments.length === 1 && (primaryAssignments[0].sharePercentage === 100 || primaryTotal === 100)) {
      updateRoleShares("BENEFICIARY_PRIMARY", [
        { assignmentId: primaryAssignments[0].id, sharePercentage: 50 },
      ]);
      assignPersonToRole(personId, "BENEFICIARY_PRIMARY", 2, 50);
    } else {
      const remaining = Math.max(0, 100 - primaryTotal);
      assignPersonToRole(
        personId,
        "BENEFICIARY_PRIMARY",
        primaryAssignments.length + 1,
        remaining > 0 ? remaining : 0
      );
    }
  };

  // Pick existing person for Substitute
  const handleSelectExistingSubstitute = (personId: string) => {
    if (!personId) return;
    if (personId === "__ADD_NEW__") {
      handleOpenAddPerson("BENEFICIARY_SUBSTITUTE", "Relative");
      return;
    }
    if (substituteAssignments.length >= 2) return;
    if (substituteAssignments.length === 1 && (substituteAssignments[0].sharePercentage === 100 || substituteTotal === 100)) {
      updateRoleShares("BENEFICIARY_SUBSTITUTE", [
        { assignmentId: substituteAssignments[0].id, sharePercentage: 50 },
      ]);
      assignPersonToRole(personId, "BENEFICIARY_SUBSTITUTE", 2, 50);
    } else {
      const remaining = Math.max(0, 100 - substituteTotal);
      assignPersonToRole(
        personId,
        "BENEFICIARY_SUBSTITUTE",
        substituteAssignments.length + 1,
        remaining > 0 ? remaining : 0
      );
    }
  };

  // Update Primary share with smart 2-person auto balancing
  const handlePrimaryShareChange = (targetAssignmentId: string, val: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(val)));
    if (primaryAssignments.length === 2) {
      // Auto-manage other beneficiary to keep total at 100%
      const other = primaryAssignments.find((a) => a.id !== targetAssignmentId);
      if (other) {
        const otherShare = 100 - clamped;
        updateRoleShares("BENEFICIARY_PRIMARY", [
          { assignmentId: targetAssignmentId, sharePercentage: clamped },
          { assignmentId: other.id, sharePercentage: otherShare },
        ]);
        return;
      }
    }
    const target = primaryAssignments.find((a) => a.id === targetAssignmentId);
    if (target) {
      assignPersonToRole(target.personId, "BENEFICIARY_PRIMARY", target.appointmentOrder, clamped);
    }
  };

  // Update Substitute share with smart 2-person auto balancing
  const handleSubstituteShareChange = (targetAssignmentId: string, val: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(val)));
    if (substituteAssignments.length === 2) {
      // Auto-manage other substitute to keep total at 100%
      const other = substituteAssignments.find((a) => a.id !== targetAssignmentId);
      if (other) {
        const otherShare = 100 - clamped;
        updateRoleShares("BENEFICIARY_SUBSTITUTE", [
          { assignmentId: targetAssignmentId, sharePercentage: clamped },
          { assignmentId: other.id, sharePercentage: otherShare },
        ]);
        return;
      }
    }
    const target = substituteAssignments.find((a) => a.id === targetAssignmentId);
    if (target) {
      assignPersonToRole(target.personId, "BENEFICIARY_SUBSTITUTE", target.appointmentOrder, clamped);
    }
  };

  // Split shares equally across all beneficiaries in a role
  const handleSplitEqually = (role: "BENEFICIARY_PRIMARY" | "BENEFICIARY_SUBSTITUTE") => {
    const list = role === "BENEFICIARY_PRIMARY" ? primaryAssignments : substituteAssignments;
    if (list.length === 0) return;
    const count = list.length;
    const baseShare = Math.floor(100 / count);
    const remainder = 100 - baseShare * count;

    const updates = list.map((a, idx) => ({
      assignmentId: a.id,
      sharePercentage: idx === 0 ? baseShare + remainder : baseShare,
    }));

    updateRoleShares(role, updates);
  };

  // Remove beneficiary and auto-assign 100% if only one remains
  const handleRemovePrimary = (assignmentId: string) => {
    removeRoleAssignment(assignmentId);
    const remaining = primaryAssignments.filter((a) => a.id !== assignmentId);
    if (remaining.length === 1) {
      assignPersonToRole(remaining[0].personId, "BENEFICIARY_PRIMARY", 1, 100);
    }
  };

  const handleRemoveSubstitute = (assignmentId: string) => {
    removeRoleAssignment(assignmentId);
    const remaining = substituteAssignments.filter((a) => a.id !== assignmentId);
    if (remaining.length === 1) {
      assignPersonToRole(remaining[0].personId, "BENEFICIARY_SUBSTITUTE", 1, 100);
    }
  };

  // Eligible people for Primary dropdown (named, not testator, not already primary)
  const eligiblePrimaryPersons = existingPersons.filter(
    (p) =>
      p.id !== testatorId &&
      Boolean(p.fullName?.trim()) &&
      !primaryAssignments.some((a) => a.personId === p.id)
  );

  // Eligible people for Substitute dropdown (named, not testator, not already primary or substitute)
  const eligibleSubstitutePersons = existingPersons.filter(
    (p) =>
      p.id !== testatorId &&
      Boolean(p.fullName?.trim()) &&
      !primaryAssignments.some((a) => a.personId === p.id) &&
      !substituteAssignments.some((a) => a.personId === p.id)
  );

  // Status message helpers
  const getPrimaryStatusMessage = () => {
    if (primaryTotal === 100) {
      return (
        <span className="text-xs font-semibold text-[#1f5a3d] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Primary shares total 100%
        </span>
      );
    }
    if (primaryTotal < 100) {
      const remaining = Math.round((100 - primaryTotal) * 100) / 100;
      return (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#7a4f0e] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Primary shares total {primaryTotal}%.{" "}
            {remaining}% left to assign.
          </span>
          <button
            type="button"
            onClick={() => handleSplitEqually("BENEFICIARY_PRIMARY")}
            className="text-[11px] font-bold text-[#5b3fb0] hover:underline cursor-pointer"
          >
            Balance to 100%
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[#b42318] flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Primary shares total {primaryTotal}%. Reduce
          by {Math.round((primaryTotal - 100) * 100) / 100}%.
        </span>
        <button
          type="button"
          onClick={() => handleSplitEqually("BENEFICIARY_PRIMARY")}
          className="text-[11px] font-bold text-[#5b3fb0] hover:underline cursor-pointer"
        >
          Reset to 100%
        </button>
      </div>
    );
  };

  const getSubStatusMessage = () => {
    if (substituteTotal === 100) {
      return (
        <span className="text-xs font-semibold text-[#1f5a3d] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Substitute shares total 100%
        </span>
      );
    }
    if (substituteTotal < 100) {
      const remaining = Math.round((100 - substituteTotal) * 100) / 100;
      return (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#7a4f0e] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Substitute shares total {substituteTotal}%.{" "}
            {remaining}% left to assign.
          </span>
          <button
            type="button"
            onClick={() => handleSplitEqually("BENEFICIARY_SUBSTITUTE")}
            className="text-[11px] font-bold text-[#5b3fb0] hover:underline cursor-pointer"
          >
            Balance to 100%
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[#b42318] flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Substitute shares total {substituteTotal}%.
          Reduce by {Math.round((substituteTotal - 100) * 100) / 100}%.
        </span>
        <button
          type="button"
          onClick={() => handleSplitEqually("BENEFICIARY_SUBSTITUTE")}
          className="text-[11px] font-bold text-[#5b3fb0] hover:underline cursor-pointer"
        >
          Reset to 100%
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Split Layout matching Reference YB Wills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Beneficiary Setup */}
        <div className="lg:col-span-2 space-y-5">
          {/* CARD 1: Primary Beneficiaries */}
          <section className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border-2 border-[#382852] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#f0ebf5] pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b42318]">
                  1 · Primary beneficiaries · Total 100%
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#231a30]">
                  Who receives your estate
                </h2>
                <p className="text-xs text-[#6c6478]">
                  They share the whole residue of your UAE estate: everything left after debts
                  and costs.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#efeaf7] text-[#4a3a86] shrink-0">
                {primaryAssignments.length} of 4
              </span>
            </div>

            {/* Quick Spouse 100% Shortcut */}
            {!soleSpouse && (
              <div className="bg-[#f7f5fb] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#efeaf7]">
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-5 h-5 text-[#8A6233] shrink-0" />
                  <div>
                    <span className="text-xs text-[#231a30] block font-semibold">
                      {potentialSpouse
                        ? `Leaving everything to ${potentialSpouse.fullName || "your spouse"}?`
                        : "Leaving everything to your spouse?"}
                    </span>
                    <span className="text-[11px] text-[#6c6478]">
                      Make your spouse your sole primary beneficiary at 100%.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (potentialSpouse) {
                      handleAppointSpouse100();
                    } else {
                      handleOpenAddPerson("BENEFICIARY_PRIMARY", "Spouse");
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-xs"
                >
                  {potentialSpouse
                    ? `Give ${potentialSpouse.fullName ? potentialSpouse.fullName.split(" ")[0] : "Spouse"} 100%`
                    : "+ Appoint Spouse at 100%"}
                </button>
              </div>
            )}

            {/* Equal Split & Auto-Balance bar if > 1 primary */}
            {primaryAssignments.length > 1 && (
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1 pb-1">
                <span className="text-[11px] text-[#6c6478]">
                  {primaryAssignments.length === 2 ? (
                    <span className="text-[#382852] font-semibold">
                      💡 Changing one share automatically balances the other to 100%.
                    </span>
                  ) : (
                    <span>Adjust shares below using the sliders or number boxes:</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleSplitEqually("BENEFICIARY_PRIMARY")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#efeaf7] hover:bg-[#e4dfe9] text-[#382852] text-xs font-semibold transition-colors cursor-pointer border border-[#cfc6da]"
                  title="Distribute 100% equally among all primary beneficiaries"
                >
                  <Scale className="w-3.5 h-3.5 text-[#5b3fb0]" />
                  Split equally ({Math.floor(100 / primaryAssignments.length)}% each)
                </button>
              </div>
            )}

            {/* Primary Share Rows */}
            <div className="space-y-3">
              {primaryAssignments.map((assignment, index) => {
                const person =
                  assignment.person ||
                  existingPersons.find((p) => p.id === assignment.personId);

                return (
                  <div
                    key={assignment.personId || assignment.id}
                    className="p-3.5 rounded-xl bg-white border border-[#e4dfe9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#cfc6da] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-full bg-[#382852] text-white font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                          PRIMARY BENEFICIARY
                        </span>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-[17px] sm:text-[19px] text-[#0B1528] truncate leading-tight">
                            {person?.fullName || "Unnamed beneficiary"}
                          </h4>
                          {person && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditPerson(person)}
                              className="text-[11px] text-[#5b3fb0] hover:underline font-medium inline-flex items-center gap-0.5"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </div>
                        {person?.arabicName && (
                          <span
                            className="text-[14px] font-arabic text-[#231a30] font-normal block w-fit text-left truncate leading-relaxed"
                            dir="rtl"
                          >
                            {person.arabicName}
                          </span>
                        )}
                        <span className="text-[12px] text-[#6c6478] block truncate">
                          {person?.relationship || "Beneficiary"} · {person?.nationality || "British"}
                          {person?.isUaeResident ? " · UAE resident" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0ebf5]">
                      {/* Robust percentage slider + input */}
                      <BeneficiaryShareControl
                        value={assignment.sharePercentage}
                        onChange={(num) => handlePrimaryShareChange(assignment.id, num)}
                      />

                      {primaryAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePrimary(assignment.id)}
                          className="w-8 h-8 rounded-lg border border-[#cfc6da] hover:border-[#b42318] text-[#6c6478] hover:text-[#b42318] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          aria-label="Remove beneficiary"
                          title="Remove beneficiary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Live Allocation Bar */}
            {primaryAssignments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="h-7 w-full bg-[#f7f5fb] border border-[#cfc6da] rounded-lg overflow-hidden flex">
                  {primaryAssignments.map((assignment, index) => {
                    const person =
                      assignment.person ||
                      existingPersons.find((p) => p.id === assignment.personId);
                    const pct = Number(assignment.sharePercentage) || 0;
                    if (pct <= 0) return null;
                    const base = Math.max(primaryTotal, 100);
                    const widthPct = (pct / base) * 100;

                    return (
                      <div
                        key={assignment.id}
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: PRIMARY_COLORS[index % PRIMARY_COLORS.length],
                        }}
                        className="h-full flex items-center justify-center text-white text-[11px] font-bold px-1 truncate transition-all duration-300"
                        title={`${person?.fullName || "Beneficiary"}: ${pct}%`}
                      >
                        {pct >= 10 &&
                          `${person?.fullName ? person.fullName.split(" ")[0] : ""} ${pct}%`}
                      </div>
                    );
                  })}
                </div>
                <div>{getPrimaryStatusMessage()}</div>
              </div>
            )}

            {/* Pro-rata hint */}
            {primaryAssignments.length > 1 && (
              <p className="text-[11px] text-[#6c6478] border-l-2 border-[#d7b48b] pl-2.5 leading-relaxed">
                If a primary beneficiary dies before you, the survivors share their part in
                proportion to their own shares. If only one survives, they receive the whole
                residue.
              </p>
            )}

            {/* Add Primary Picker matching reference c-e-desktop.jpg */}
            {primaryAssignments.length < 4 && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#231a30] mb-1.5">
                  Add another primary beneficiary
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleSelectExistingPrimary(e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a person
                    </option>
                    <option value="__ADD_NEW__" className="font-semibold text-[#5b3fb0]">
                      + Add a new person or charity...
                    </option>
                    {eligiblePrimaryPersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.relationship || "Person"})
                      </option>
                    ))}
                  </select>

                  {!potentialSpouse && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddPerson("BENEFICIARY_PRIMARY", "Spouse")}
                      className="px-3.5 py-2.5 border border-[#382852] text-[#382852] hover:bg-[#382852] hover:text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      + Add Spouse
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenAddPerson("BENEFICIARY_PRIMARY", "Child")}
                    className="px-4 py-2.5 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add a new person or charity
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* CARD 2: Substitute Beneficiaries */}
          <section className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#f0ebf5] pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b42318]">
                  2 · If none of your primary beneficiaries survives you
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#231a30]">
                  Substitute beneficiaries
                </h2>
                <p className="text-xs text-[#6c6478]">
                  Substitute A is required. Give A 100%, or divide 100% between A and B.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#efeaf7] text-[#4a3a86] shrink-0">
                {substituteAssignments.length} of 2
              </span>
            </div>

            {/* Equal Split & Auto-Balance bar if 2 substitutes */}
            {substituteAssignments.length > 1 && (
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1 pb-1">
                <span className="text-[11px] text-[#6c6478]">
                  <span className="text-[#382852] font-semibold">
                    💡 Changing one share automatically balances the other to 100%.
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSplitEqually("BENEFICIARY_SUBSTITUTE")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#efeaf7] hover:bg-[#e4dfe9] text-[#382852] text-xs font-semibold transition-colors cursor-pointer border border-[#cfc6da]"
                  title="Distribute 100% equally between Substitute A and B"
                >
                  <Scale className="w-3.5 h-3.5 text-[#5b3fb0]" />
                  Split equally (50% / 50%)
                </button>
              </div>
            )}

            {/* Substitute Share Rows */}
            <div className="space-y-3">
              {substituteAssignments.map((assignment, index) => {
                const person =
                  assignment.person ||
                  existingPersons.find((p) => p.id === assignment.personId);
                const letter = SUB_LETTERS[index];
                const aName =
                  substituteAssignments[0]?.person?.fullName ||
                  existingPersons.find((p) => p.id === substituteAssignments[0]?.personId)
                    ?.fullName ||
                  "A";

                return (
                  <div
                    key={assignment.personId || assignment.id}
                    className="p-3.5 rounded-xl bg-white border border-[#e4dfe9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#cfc6da] transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="w-7 h-7 rounded-full border-2 border-[#382852] text-[#231a30] font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {letter}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                          SUBSTITUTE {letter}
                        </span>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-[17px] sm:text-[19px] text-[#0B1528] truncate leading-tight">
                            {person?.fullName || `Substitute ${letter}`}
                          </h4>
                          {person && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditPerson(person)}
                              className="text-[11px] text-[#5b3fb0] hover:underline font-medium inline-flex items-center gap-0.5"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </div>
                        {person?.arabicName && (
                          <span
                            className="text-[14px] font-arabic text-[#231a30] font-normal block w-fit text-left truncate leading-relaxed"
                            dir="rtl"
                          >
                            {person.arabicName}
                          </span>
                        )}
                        <span className="text-[12px] text-[#6c6478] block">
                          {index === 0
                            ? `If ${person?.fullName ? person.fullName.split(" ")[0] : "A"} dies before you, this share passes to their children in equal shares.`
                            : `If ${person?.fullName ? person.fullName.split(" ")[0] : "B"} dies before you, this share passes to ${aName.split(" ")[0]}, pro rata.`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0ebf5]">
                      <BeneficiaryShareControl
                        value={assignment.sharePercentage}
                        onChange={(num) => handleSubstituteShareChange(assignment.id, num)}
                      />

                      {substituteAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubstitute(assignment.id)}
                          className="w-8 h-8 rounded-lg border border-[#cfc6da] hover:border-[#b42318] text-[#6c6478] hover:text-[#b42318] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          aria-label="Remove substitute"
                          title="Remove substitute"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Substitute Live Allocation Bar */}
            {substituteAssignments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="h-7 w-full bg-[#f7f5fb] border border-[#cfc6da] rounded-lg overflow-hidden flex">
                  {substituteAssignments.map((assignment, index) => {
                    const person =
                      assignment.person ||
                      existingPersons.find((p) => p.id === assignment.personId);
                    const pct = Number(assignment.sharePercentage) || 0;
                    if (pct <= 0) return null;
                    const base = Math.max(substituteTotal, 100);
                    const widthPct = (pct / base) * 100;

                    return (
                      <div
                        key={assignment.id}
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: SUB_COLORS[index % SUB_COLORS.length],
                        }}
                        className="h-full flex items-center justify-center text-white text-[11px] font-bold px-1 truncate transition-all duration-300"
                        title={`${SUB_LETTERS[index]}: ${person?.fullName || "Substitute"}: ${pct}%`}
                      >
                        {pct >= 10 &&
                          `${SUB_LETTERS[index]}: ${person?.fullName ? person.fullName.split(" ")[0] : ""} ${pct}%`}
                      </div>
                    );
                  })}
                </div>
                <div>{getSubStatusMessage()}</div>
              </div>
            )}

            {/* Add Substitute Picker */}
            {substituteAssignments.length < 2 && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#231a30] mb-1.5">
                  {substituteAssignments.length === 0
                    ? "Choose substitute A"
                    : "Add substitute B (optional)"}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleSelectExistingSubstitute(e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a person
                    </option>
                    <option value="__ADD_NEW__" className="font-semibold text-[#5b3fb0]">
                      + Add a new person or charity...
                    </option>
                    {eligibleSubstitutePersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.relationship || "Person"})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleOpenAddPerson("BENEFICIARY_SUBSTITUTE")}
                    className="px-4 py-2.5 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {substituteAssignments.length === 0 ? "Add substitute A" : "Add substitute B"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* CARD 3: Rules applied */}
          <section className="bg-[#efeaf7] p-5 rounded-2xl border border-transparent space-y-2">
            <h2 className="text-sm font-serif font-bold text-[#231a30]">
              Rules the template applies for you
            </h2>
            <ul className="text-xs text-[#3b3346] space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>A share due to someone under 21 stays in trust until they turn 21.</li>
              <li>
                Your executors can use the income or capital of that share for the beneficiary&apos;s
                maintenance, education or benefit.
              </li>
              <li>
                Any share that cannot pass under the clauses above goes to the other beneficiaries,
                in proportion to their shares.
              </li>
            </ul>
          </section>
        </div>

        {/* Right Column: Estate Flow Aside matching c-e-desktop.jpg */}
        <aside className="lg:col-span-1 bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[#231a30]">
              How your estate passes
            </h2>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c6478] block">
              First
            </span>

            <div className="grid grid-cols-2 gap-2">
              {primaryAssignments.map((assignment, index) => {
                const p =
                  assignment.person ||
                  existingPersons.find((ep) => ep.id === assignment.personId);
                return (
                  <div
                    key={assignment.id}
                    className="border-l-4 rounded-lg p-2.5 bg-[#f7f5fb] border-[#cfc6da]"
                    style={{ borderLeftColor: PRIMARY_COLORS[index % PRIMARY_COLORS.length] }}
                  >
                    <b className="text-xs text-[#231a30] block truncate">
                      {p?.fullName ? p.fullName.split(" ")[0] : `Primary ${index + 1}`}
                    </b>
                    <span className="text-xs text-[#6c6478] font-mono font-semibold">
                      {assignment.sharePercentage || 0}%
                    </span>
                  </div>
                );
              })}
              {primaryAssignments.length === 0 && (
                <div className="col-span-2 text-xs text-[#6c6478] italic p-2 bg-[#f7f5fb] rounded-lg text-center">
                  No primary beneficiary yet
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6c6478] text-center pt-1 italic">
              {primaryAssignments.length > 1
                ? "If one dies first, the others share their part pro rata"
                : "Receives the whole residue"}
            </p>

            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c6478] block pt-3 border-t border-[#f0ebf5]">
              Only if none of them survives you
            </span>

            <div className="grid grid-cols-2 gap-2">
              {substituteAssignments.map((assignment, index) => {
                const p =
                  assignment.person ||
                  existingPersons.find((ep) => ep.id === assignment.personId);
                return (
                  <div
                    key={assignment.id}
                    className="border-l-4 rounded-lg p-2.5 bg-[#f7f5fb] border-[#cfc6da]"
                    style={{ borderLeftColor: SUB_COLORS[index % SUB_COLORS.length] }}
                  >
                    <b className="text-xs text-[#231a30] block truncate">
                      {SUB_LETTERS[index]}:{" "}
                      {p?.fullName ? p.fullName.split(" ")[0] : `Sub ${SUB_LETTERS[index]}`}
                    </b>
                    <span className="text-xs text-[#6c6478] font-mono font-semibold">
                      {assignment.sharePercentage || 0}%
                    </span>
                  </div>
                );
              })}
              {substituteAssignments.length === 0 && (
                <div className="col-span-2 text-xs text-[#6c6478] italic p-2 bg-[#f7f5fb] rounded-lg text-center">
                  No substitute yet
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6c6478] text-center pt-1 italic">
              If A has died: A&apos;s children, in equal shares
            </p>

            <div className="pt-2 border-t border-[#f0ebf5]">
              <Link
                href="/preview"
                className="text-xs text-[#5b3fb0] hover:underline font-semibold flex items-center justify-center gap-1"
              >
                See this on the sample Will
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Universal Person Modal for adding / editing beneficiaries */}
      <UniversalPersonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsSpouse100Mode(false);
        }}
        personToEdit={personToEdit}
        defaultRelationship={defaultRelationship}
        title={modalTitle}
        onSave={handleModalSave}
      />
    </div>
  );
}
