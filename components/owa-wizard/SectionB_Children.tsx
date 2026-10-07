"use client";

import React, { useState } from "react";
import { Plus, Trash2, Upload, FileText, CheckCircle2, AlertCircle, HelpCircle, UserCheck } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import Link from "next/link";

export function SectionB_Children() {
  const { application, activeWillIndex, addOrUpdatePerson, assignPersonToRole, removeRoleAssignment } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const childAssignments = activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];

  const [hasChildren, setHasChildren] = useState(childAssignments.length > 0);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Helper to get or create child form state
  const handleAddChild = async () => {
    if (childAssignments.length >= 5) return;

    // Create a new empty person in repository
    const newPerson = await addOrUpdatePerson({
      fullName: `Child ${childAssignments.length + 1}`,
      relationship: "Child",
      nationality: activeWill?.testatorPerson?.nationality || "British",
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, "CHILD", childAssignments.length + 1);
    }
  };

  const handleUpdateChild = async (
    roleAssignmentId: string,
    personId: string,
    updates: Record<string, any>
  ) => {
    await addOrUpdatePerson({
      id: personId,
      ...updates,
    });
  };

  const handleRemoveChild = (roleAssignmentId: string) => {
    removeRoleAssignment(roleAssignmentId);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section B · Children & Guardianship Eligibility
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Your Children (Up to 5)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Record your children below. Under UAE civil family law, listing minor children activates court guardianship protections (Sections 5 & 6).
        </p>
      </div>

      {/* Children Existence Toggle */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Do you have any biological or legally adopted children?
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setHasChildren(true);
              if (childAssignments.length === 0) {
                handleAddChild();
              }
            }}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
              hasChildren
                ? "border-[#A37E44] bg-[#A37E44]/5 text-[#0B1528] ring-1 ring-[#A37E44]"
                : "border-[#E5E0D8] text-gray-600 hover:border-gray-400"
            }`}
          >
            Yes, I have children
          </button>
          <button
            type="button"
            onClick={() => {
              setHasChildren(false);
            }}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
              !hasChildren
                ? "border-[#A37E44] bg-[#A37E44]/5 text-[#0B1528] ring-1 ring-[#A37E44]"
                : "border-[#E5E0D8] text-gray-600 hover:border-gray-400"
            }`}
          >
            No, I have no children
          </button>
        </div>

        {!hasChildren && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              You have indicated that you do not have children. You may still appoint default guardians in Section D if you anticipate having children in the future, or proceed directly to Section C (Executors).
            </p>
          </div>
        )}
      </div>

      {/* Children Cards */}
      {hasChildren && (
        <div className="space-y-6">
          {childAssignments.map((assignment, index) => {
            const child = assignment.person;
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
                      Child #{index + 1} Details
                    </h3>
                  </div>
                  {childAssignments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(assignment.id)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Full Legal Name (as per Passport) *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.fullName || ""}
                      onBlur={(e) =>
                        handleUpdateChild(assignment.id, personId, { fullName: e.target.value })
                      }
                      placeholder="e.g. Liam Daniel Carter"
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
                      defaultValue={child?.arabicName || ""}
                      onBlur={(e) =>
                        handleUpdateChild(assignment.id, personId, { arabicName: e.target.value })
                      }
                      placeholder="ليام دانيال كارتر"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-arabic focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      defaultValue={
                        child?.dob ? new Date(child.dob).toISOString().split("T")[0] : ""
                      }
                      onBlur={(e) =>
                        handleUpdateChild(assignment.id, personId, { dob: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Gender / Relationship *
                    </label>
                    <select
                      defaultValue={child?.relationship || "Son"}
                      onChange={(e) =>
                        handleUpdateChild(assignment.id, personId, { relationship: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    >
                      <option value="Son">Son (ابن)</option>
                      <option value="Daughter">Daughter (ابنة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.passportNumber || ""}
                      onBlur={(e) =>
                        handleUpdateChild(assignment.id, personId, { passportNumber: e.target.value })
                      }
                      placeholder="e.g. 501234987"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.nationality || "British"}
                      onBlur={(e) =>
                        handleUpdateChild(assignment.id, personId, { nationality: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>
                </div>

                {/* Passport Document Upload & Assistance Banner */}
                <div className="pt-4 border-t border-[#E5E0D8]/60 space-y-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Child Passport Copy (Mandatory for ADJD Court Verification)
                  </label>

                  <div className="border border-dashed border-[#A37E44]/40 bg-[#FBF9F5] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#A37E44]/10 text-[#A37E44] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0B1528] flex items-center gap-1.5">
                          <span>Passport_Scan_{index + 1}.pdf</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Re-usable document stored in application repository
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-white border border-[#E5E0D8] rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                        Replace
                      </button>
                    </div>
                  </div>

                  {/* Child Passport Assistance Callout */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2 text-blue-900">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Child does not have a passport yet?</span>
                        <p className="text-[11px] text-blue-800/80 mt-0.5">
                          ADJD Civil Family Court requires passport verification for minors. Our legal support team can guide you through consular or emergency registration procedures.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/support?topic=child_passport"
                      className="whitespace-nowrap px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                    >
                      Request Child Passport Assistance
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {childAssignments.length < 5 && (
            <button
              type="button"
              onClick={handleAddChild}
              className="w-full py-4 border-2 border-dashed border-[#A37E44]/40 hover:border-[#A37E44] bg-[#FBF9F5] hover:bg-[#A37E44]/5 text-[#A37E44] rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Child ({childAssignments.length}/5)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
