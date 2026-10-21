"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, HeartHandshake, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { transliterateToName } from "@/lib/transliterate";
import Link from "next/link";

const PRIMARY_COLORS = ["#5b3fb0", "#4a3a86", "#d7b48b", "#2f7a55"];
const SUB_COLORS = ["#c73a30", "#7a1d14"];
const SUB_LETTERS = ["A", "B"];

export function SectionE_Beneficiaries() {
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
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
  const primaryTotal = Math.round(
    primaryAssignments.reduce((sum, ra) => sum + (Number(ra.sharePercentage) || 0), 0) * 100
  ) / 100;
  const substituteTotal = Math.round(
    substituteAssignments.reduce((sum, ra) => sum + (Number(ra.sharePercentage) || 0), 0) * 100
  ) / 100;

  const soleSpouse =
    potentialSpouse &&
    primaryAssignments.length === 1 &&
    primaryAssignments[0].personId === potentialSpouse.id &&
    primaryTotal === 100;

  // Auto-initialize Primary 1 if none exists
  const hasAutoInitialized = useRef(false);
  useEffect(() => {
    if (!hasAutoInitialized.current && primaryAssignments.length === 0) {
      hasAutoInitialized.current = true;
      (async () => {
        const newPerson = await addOrUpdatePerson({
          fullName: "",
          relationship: potentialSpouse ? "Spouse" : "Family Member",
          nationality: "British",
          isUaeResident: true,
        });
        if (newPerson) {
          assignPersonToRole(newPerson.id, "BENEFICIARY_PRIMARY", 1, 100);
        }
      })();
    }
  }, [primaryAssignments.length]);

  // Handlers
  const handleAddPrimary = async (personId?: string) => {
    if (primaryAssignments.length >= 4) return;
    const remaining = Math.max(0, 100 - primaryTotal);
    let targetPersonId = personId;

    if (!targetPersonId) {
      const newPerson = await addOrUpdatePerson({
        fullName: "",
        relationship: "Beneficiary",
        nationality: "British",
        isUaeResident: true,
      });
      targetPersonId = newPerson?.id;
    }

    if (targetPersonId) {
      assignPersonToRole(
        targetPersonId,
        "BENEFICIARY_PRIMARY",
        primaryAssignments.length + 1,
        remaining
      );
    }
  };

  const handleAddSubstitute = async (personId?: string) => {
    if (substituteAssignments.length >= 2) return;
    const remaining = Math.max(0, 100 - substituteTotal);
    let targetPersonId = personId;

    if (!targetPersonId) {
      const newPerson = await addOrUpdatePerson({
        fullName: "",
        relationship: "Substitute Beneficiary",
        nationality: "British",
        isUaeResident: true,
      });
      targetPersonId = newPerson?.id;
    }

    if (targetPersonId) {
      assignPersonToRole(
        targetPersonId,
        "BENEFICIARY_SUBSTITUTE",
        substituteAssignments.length + 1,
        remaining
      );
    }
  };

  const handleAppointSpouse100 = async () => {
    let spouseId = potentialSpouse?.id;
    if (!spouseId) {
      const newSpouse = await addOrUpdatePerson({
        fullName: "",
        relationship: "Spouse",
        nationality: "British",
        isUaeResident: true,
      });
      spouseId = newSpouse?.id;
    }

    if (spouseId) {
      // Remove others
      for (let i = 1; i < primaryAssignments.length; i++) {
        removeRoleAssignment(primaryAssignments[i].id);
      }
      if (primaryAssignments.length > 0) {
        assignPersonToRole(spouseId, "BENEFICIARY_PRIMARY", 1, 100);
      } else {
        assignPersonToRole(spouseId, "BENEFICIARY_PRIMARY", 1, 100);
      }
    }
  };

  const handleShareChange = (assignmentId: string, role: "BENEFICIARY_PRIMARY" | "BENEFICIARY_SUBSTITUTE", order: number, rawVal: string) => {
    const parsed = parseFloat(rawVal) || 0;
    const assignment =
      role === "BENEFICIARY_PRIMARY"
        ? primaryAssignments.find((a) => a.id === assignmentId)
        : substituteAssignments.find((a) => a.id === assignmentId);

    if (assignment) {
      assignPersonToRole(assignment.personId, role, order, Math.min(100, Math.max(0, parsed)));
    }
  };

  const handleNameBlur = async (personId: string, fullNameValue: string, currentArabic?: string | null) => {
    await addOrUpdatePerson({ id: personId, fullName: fullNameValue });
    if (fullNameValue.trim() && !currentArabic?.trim()) {
      const transliterated = await transliterateToName(fullNameValue);
      if (transliterated) {
        await addOrUpdatePerson({ id: personId, fullName: fullNameValue, arabicName: transliterated });
      }
    }
  };

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
      return (
        <span className="text-xs font-semibold text-[#7a4f0e] flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Primary shares total {primaryTotal}%. {Math.round((100 - primaryTotal) * 100) / 100}% left to assign.
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-[#b42318] flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" /> Primary shares total {primaryTotal}%. Reduce by {Math.round((primaryTotal - 100) * 100) / 100}%.
      </span>
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
      return (
        <span className="text-xs font-semibold text-[#7a4f0e] flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Substitute shares total {substituteTotal}%. {Math.round((100 - substituteTotal) * 100) / 100}% left to assign.
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-[#b42318] flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" /> Substitute shares total {substituteTotal}%. Reduce by {Math.round((substituteTotal - 100) * 100) / 100}%.
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Beneficiary Setup */}
        <div className="lg:col-span-2 space-y-5">
          {/* CARD 1: Primary Beneficiaries */}
          <section className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border-2 border-[#382852] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#f0ebf5] pb-3">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b42318]">
                  1 · Primary beneficiaries · 1 to 4, total 100%
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#231a30]">
                  Who receives your estate
                </h2>
                <p className="text-xs text-[#6c6478]">
                  They share the whole residue of your UAE estate: everything left after debts and costs.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#efeaf7] text-[#4a3a86] shrink-0">
                {primaryAssignments.length} of 4
              </span>
            </div>

            {/* Quick Spouse 100% Shortcut */}
            {potentialSpouse && !soleSpouse && (
              <div className="bg-[#f7f5fb] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs text-[#231a30]">
                  <b className="font-semibold">Leaving everything to {potentialSpouse.fullName || "your spouse"}?</b> Make them your only primary beneficiary, at 100%.
                </span>
                <button
                  type="button"
                  onClick={handleAppointSpouse100}
                  className="px-3.5 py-1.5 rounded-full border border-[#382852] text-[#382852] hover:bg-[#382852] hover:text-white text-xs font-semibold transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  Give {potentialSpouse.fullName ? potentialSpouse.fullName.split(" ")[0] : "Spouse"} 100%
                </button>
              </div>
            )}

            {/* Primary Share Rows */}
            <div className="space-y-3">
              {primaryAssignments.map((assignment, index) => {
                const person =
                  assignment.person || existingPersons.find((p) => p.id === assignment.personId);

                return (
                  <div
                    key={assignment.id}
                    className="p-3 rounded-xl bg-white border border-[#e4dfe9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-[#382852] text-white font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <input
                          type="text"
                          defaultValue={person?.fullName || ""}
                          placeholder={`Primary Beneficiary ${index + 1}`}
                          onBlur={(e) => handleNameBlur(person?.id || "", e.target.value, person?.arabicName)}
                          className="font-semibold text-sm text-[#231a30] bg-transparent border-0 border-b border-transparent hover:border-[#cfc6da] focus:border-[#5b3fb0] focus:outline-none px-0 py-0.5 w-full truncate"
                        />
                        <span className="text-[11px] text-[#6c6478] block truncate">
                          {person?.relationship || "Beneficiary"} · {person?.nationality || "British"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={assignment.sharePercentage ?? ""}
                          onChange={(e) =>
                            handleShareChange(assignment.id, "BENEFICIARY_PRIMARY", assignment.appointmentOrder, e.target.value)
                          }
                          className="w-16 px-2 py-1.5 rounded-lg border border-[#cfc6da] text-xs font-mono font-bold text-right text-[#231a30] focus:outline-none focus:border-[#5b3fb0]"
                        />
                        <span className="text-xs font-bold text-[#6c6478]">%</span>
                      </div>

                      {primaryAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoleAssignment(assignment.id)}
                          className="w-8 h-8 rounded-lg border border-[#cfc6da] hover:border-[#b42318] text-[#6c6478] hover:text-[#b42318] flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Remove beneficiary"
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
                    const person = assignment.person || existingPersons.find((p) => p.id === assignment.personId);
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
                        title={`${person?.fullName || `Beneficiary ${index + 1}`}: ${pct}%`}
                      >
                        {pct >= 10 && `${person?.fullName ? person.fullName.split(" ")[0] : `${index + 1}`} ${pct}%`}
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
                If a primary beneficiary dies before you, the survivors share their part in proportion to their own shares. If only one survives, they receive the whole residue.
              </p>
            )}

            {/* Add Primary Picker */}
            {primaryAssignments.length < 4 && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleAddPrimary(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0]"
                >
                  <option value="" disabled>
                    Choose someone already in your Will
                  </option>
                  {existingPersons
                    .filter((p) => p.id !== testatorId && !primaryAssignments.some((a) => a.personId === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName || "Unnamed"} ({p.relationship || "Person"})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAddPrimary()}
                  className="px-3.5 py-2 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add a new person
                </button>
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

            {/* Substitute Share Rows */}
            <div className="space-y-3">
              {substituteAssignments.map((assignment, index) => {
                const person =
                  assignment.person || existingPersons.find((p) => p.id === assignment.personId);
                const letter = SUB_LETTERS[index];
                const aName =
                  substituteAssignments[0]?.person?.fullName ||
                  existingPersons.find((p) => p.id === substituteAssignments[0]?.personId)?.fullName ||
                  "A";

                return (
                  <div
                    key={assignment.id}
                    className="p-3 rounded-xl bg-white border border-[#e4dfe9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full border-2 border-[#382852] text-[#231a30] font-serif font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {letter}
                      </span>
                      <div className="min-w-0">
                        <input
                          type="text"
                          defaultValue={person?.fullName || ""}
                          placeholder={`Substitute Beneficiary ${letter}`}
                          onBlur={(e) => handleNameBlur(person?.id || "", e.target.value, person?.arabicName)}
                          className="font-semibold text-sm text-[#231a30] bg-transparent border-0 border-b border-transparent hover:border-[#cfc6da] focus:border-[#5b3fb0] focus:outline-none px-0 py-0.5 w-full truncate"
                        />
                        <span className="text-[11px] text-[#6c6478] block">
                          {index === 0
                            ? `If ${person?.fullName ? person.fullName.split(" ")[0] : "A"} dies before you, this share passes to their children in equal shares.`
                            : `If ${person?.fullName ? person.fullName.split(" ")[0] : "B"} dies before you, this share passes to ${aName.split(" ")[0]}, pro rata.`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={assignment.sharePercentage ?? ""}
                          onChange={(e) =>
                            handleShareChange(assignment.id, "BENEFICIARY_SUBSTITUTE", assignment.appointmentOrder, e.target.value)
                          }
                          className="w-16 px-2 py-1.5 rounded-lg border border-[#cfc6da] text-xs font-mono font-bold text-right text-[#231a30] focus:outline-none focus:border-[#5b3fb0]"
                        />
                        <span className="text-xs font-bold text-[#6c6478]">%</span>
                      </div>

                      {substituteAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoleAssignment(assignment.id)}
                          className="w-8 h-8 rounded-lg border border-[#cfc6da] hover:border-[#b42318] text-[#6c6478] hover:text-[#b42318] flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Remove substitute"
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
                    const person = assignment.person || existingPersons.find((p) => p.id === assignment.personId);
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
                        {pct >= 10 && `${SUB_LETTERS[index]}: ${person?.fullName ? person.fullName.split(" ")[0] : ""} ${pct}%`}
                      </div>
                    );
                  })}
                </div>
                <div>{getSubStatusMessage()}</div>
              </div>
            )}

            {/* Add Substitute Picker */}
            {substituteAssignments.length < 2 && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleAddSubstitute(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#cfc6da] text-xs font-medium text-[#231a30] bg-white focus:outline-none focus:border-[#5b3fb0]"
                >
                  <option value="" disabled>
                    Choose someone already in your Will
                  </option>
                  {existingPersons
                    .filter(
                      (p) =>
                        p.id !== testatorId &&
                        !primaryAssignments.some((a) => a.personId === p.id) &&
                        !substituteAssignments.some((a) => a.personId === p.id)
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName || "Unnamed"} ({p.relationship || "Person"})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAddSubstitute()}
                  className="px-3.5 py-2 bg-[#382852] hover:bg-[#281b40] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {substituteAssignments.length === 0 ? "Choose substitute A" : "Add substitute B"}
                </button>
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
              <li>Your executors can use the income or capital of that share for the beneficiary&apos;s maintenance, education or benefit.</li>
              <li>Any share that cannot pass under the clauses above goes to the other beneficiaries, in proportion to their shares.</li>
            </ul>
          </section>
        </div>

        {/* Right Column: Estate Flow Aside */}
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
                const p = assignment.person || existingPersons.find((ep) => ep.id === assignment.personId);
                return (
                  <div
                    key={assignment.id}
                    className="border-l-4 rounded-lg p-2 bg-[#f7f5fb] border-[#cfc6da]"
                    style={{ borderLeftColor: PRIMARY_COLORS[index % PRIMARY_COLORS.length] }}
                  >
                    <b className="text-xs text-[#231a30] block truncate">
                      {p?.fullName ? p.fullName.split(" ")[0] : `Primary ${index + 1}`}
                    </b>
                    <span className="text-xs text-[#6c6478] font-mono">
                      {assignment.sharePercentage || 0}%
                    </span>
                  </div>
                );
              })}
              {primaryAssignments.length === 0 && (
                <div className="col-span-2 text-xs text-[#6c6478] italic">
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
                const p = assignment.person || existingPersons.find((ep) => ep.id === assignment.personId);
                return (
                  <div
                    key={assignment.id}
                    className="border-l-4 rounded-lg p-2 bg-[#f7f5fb] border-[#cfc6da]"
                    style={{ borderLeftColor: SUB_COLORS[index % SUB_COLORS.length] }}
                  >
                    <b className="text-xs text-[#231a30] block truncate">
                      {SUB_LETTERS[index]}: {p?.fullName ? p.fullName.split(" ")[0] : `Sub ${SUB_LETTERS[index]}`}
                    </b>
                    <span className="text-xs text-[#6c6478] font-mono">
                      {assignment.sharePercentage || 0}%
                    </span>
                  </div>
                );
              })}
              {substituteAssignments.length === 0 && (
                <div className="col-span-2 text-xs text-[#6c6478] italic">
                  No substitute yet
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#6c6478] text-center pt-1 italic">
              If A has died: A&apos;s children, in equal shares
            </p>
          </div>

          <div className="pt-3 border-t border-[#f0ebf5]">
            <Link href="/sample" className="text-xs text-[#5b3fb0] font-semibold underline">
              See this on the sample Will
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
