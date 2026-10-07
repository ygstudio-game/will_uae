"use client";

import React from "react";
import { Plus, Trash2, PieChart, CheckCircle2, AlertCircle, UserCheck } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";

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
  const beneficiaryAssignments =
    activeWill?.roleAssignments.filter((ra) => ra.role === "BENEFICIARY") || [];

  const totalAllocated = beneficiaryAssignments.reduce(
    (sum, ra) => sum + (Number(ra.sharePercentage) || 0),
    0
  );
  const remainingPercentage = Math.round((100 - totalAllocated) * 100) / 100;
  const is100Percent = Math.abs(totalAllocated - 100) < 0.01;

  const handleAddBeneficiary = async () => {
    if (beneficiaryAssignments.length >= 5) return;

    const remaining = remainingPercentage > 0 ? remainingPercentage : 0;
    const newPerson = await addOrUpdatePerson({
      fullName: `Beneficiary ${beneficiaryAssignments.length + 1}`,
      relationship: "Beneficiary",
      nationality: "British",
    });

    if (newPerson) {
      assignPersonToRole(
        newPerson.id,
        "BENEFICIARY",
        beneficiaryAssignments.length + 1,
        remaining
      );
    }
  };

  const handleSelectExistingPerson = (assignmentId: string, personId: string) => {
    const assignment = beneficiaryAssignments.find((ra) => ra.id === assignmentId);
    if (!assignment) return;
    assignPersonToRole(
      personId,
      "BENEFICIARY",
      assignment.appointmentOrder,
      assignment.sharePercentage || undefined
    );
  };

  const handleUpdateBeneficiaryPerson = async (
    personId: string,
    updates: Record<string, any>
  ) => {
    await addOrUpdatePerson({
      id: personId,
      ...updates,
    });
  };

  const handleUpdateShare = (assignmentId: string, newShare: number) => {
    const assignment = beneficiaryAssignments.find((ra) => ra.id === assignmentId);
    if (!assignment) return;
    assignPersonToRole(
      assignment.personId,
      "BENEFICIARY",
      assignment.appointmentOrder,
      newShare
    );
  };

  const handleDistributeEqually = () => {
    if (beneficiaryAssignments.length === 0) return;
    const count = beneficiaryAssignments.length;
    const baseShare = Math.floor(100 / count);
    const remainder = 100 - baseShare * count;

    beneficiaryAssignments.forEach((assignment, index) => {
      const share = index === 0 ? baseShare + remainder : baseShare;
      assignPersonToRole(
        assignment.personId,
        "BENEFICIARY",
        assignment.appointmentOrder,
        share
      );
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section E · Estate Distribution
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Estate Beneficiaries (Clause 7)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Specify who inherits your UAE assets (up to 5 beneficiaries). Under official ADJD-NM0723-07-03 rules, beneficiary shares are simultaneous and must strictly sum to 100%.
        </p>
      </div>

      {/* Share Allocation Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A37E44]/10 text-[#A37E44] flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0B1528] flex items-center gap-2">
                <span>Total Allocated: {totalAllocated}%</span>
                {is100Percent ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Balanced
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {remainingPercentage > 0
                      ? `${remainingPercentage}% Unallocated`
                      : `Exceeds 100% by ${Math.abs(remainingPercentage)}%`}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                The ADJD court requires exact percentage allocation across all listed beneficiaries.
              </p>
            </div>
          </div>

          {beneficiaryAssignments.length > 1 && (
            <button
              type="button"
              onClick={handleDistributeEqually}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-all self-start sm:self-auto"
            >
              Distribute Equally
            </button>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
          {beneficiaryAssignments.map((assignment, index) => {
            const share = Number(assignment.sharePercentage) || 0;
            const colors = [
              "bg-[#0B1528]",
              "bg-[#A37E44]",
              "bg-[#3B82F6]",
              "bg-[#10B981]",
              "bg-[#8B5CF6]",
            ];
            return (
              <div
                key={assignment.id}
                style={{ width: `${Math.min(share, 100)}%` }}
                className={`h-full ${colors[index % colors.length]} transition-all duration-300`}
                title={`${assignment.person?.fullName || `Beneficiary ${index + 1}`}: ${share}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Beneficiary List */}
      <div className="space-y-6">
        {beneficiaryAssignments.map((assignment, index) => {
          const person = assignment.person;
          const personId = assignment.personId;

          return (
            <div
              key={assignment.id}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider">
                    Beneficiary #{index + 1}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => removeRoleAssignment(assignment.id)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>

              {/* Quick switch to existing person */}
              {existingPersons.length > 1 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8]/60 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#A37E44]" />
                    <span className="font-semibold text-gray-700">Select Existing:</span>
                  </div>
                  <select
                    value={person?.id || ""}
                    onChange={(e) => handleSelectExistingPerson(assignment.id, e.target.value)}
                    className="px-2.5 py-1 rounded border border-[#E5E0D8] bg-white text-[11px] font-medium"
                  >
                    {existingPersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.relationship || p.nationality || "Person"})
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
                    defaultValue={person?.fullName || ""}
                    onBlur={(e) =>
                      handleUpdateBeneficiaryPerson(personId, { fullName: e.target.value })
                    }
                    placeholder="e.g. Emily Rose Smith"
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
                    defaultValue={person?.arabicName || ""}
                    onBlur={(e) =>
                      handleUpdateBeneficiaryPerson(personId, { arabicName: e.target.value })
                    }
                    placeholder="إيميلي روز سميث"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-arabic focus:outline-none focus:border-[#A37E44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Relationship to Testator *
                  </label>
                  <input
                    type="text"
                    defaultValue={person?.relationship || ""}
                    onBlur={(e) =>
                      handleUpdateBeneficiaryPerson(personId, { relationship: e.target.value })
                    }
                    placeholder="e.g. Spouse, Daughter, Son, Brother"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Share Percentage (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.01"
                      value={assignment.sharePercentage || ""}
                      onChange={(e) =>
                        handleUpdateShare(assignment.id, parseFloat(e.target.value) || 0)
                      }
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 pr-8 rounded-lg border border-[#E5E0D8] text-sm font-semibold text-[#0B1528] focus:outline-none focus:border-[#A37E44]"
                    />
                    <span className="absolute right-3 top-2.5 text-sm font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Passport Number / National ID *
                  </label>
                  <input
                    type="text"
                    defaultValue={person?.passportNumber || ""}
                    onBlur={(e) =>
                      handleUpdateBeneficiaryPerson(personId, { passportNumber: e.target.value })
                    }
                    placeholder="e.g. 503214569"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    defaultValue={person?.nationality || "British"}
                    onBlur={(e) =>
                      handleUpdateBeneficiaryPerson(personId, { nationality: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    defaultValue={person?.address || ""}
                    onBlur={(e) =>
                      handleUpdateBeneficiaryPerson(personId, { address: e.target.value })
                    }
                    placeholder="Full residential address"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {beneficiaryAssignments.length < 5 && (
          <button
            type="button"
            onClick={handleAddBeneficiary}
            className="w-full py-4 border-2 border-dashed border-[#A37E44]/40 hover:border-[#A37E44] bg-[#FBF9F5] hover:bg-[#A37E44]/5 text-[#A37E44] rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Beneficiary ({beneficiaryAssignments.length}/5)
          </button>
        )}
      </div>
    </div>
  );
}
