"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCw,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { transliterateToName } from "@/lib/transliterate";
import Link from "next/link";

export function SectionB_Children() {
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
    removeRoleAssignment,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const childAssignments =
    activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];

  const [hasChildren, setHasChildren] = useState(childAssignments.length > 0);
  const [analyzingChildId, setAnalyzingChildId] = useState<string | null>(null);
  const [analyzingType, setAnalyzingType] = useState<"PASSPORT" | "EMIRATES_ID" | null>(null);

  // Helper to add a new child
  const handleAddChild = async () => {
    if (childAssignments.length >= 5) return;

    const newPerson = await addOrUpdatePerson({
      fullName: "",
      arabicName: "",
      relationship: "Child",
      nationality: activeWill?.testatorPerson?.nationality || "",
      isUaeResident: false,
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, "CHILD", childAssignments.length + 1);
    }
  };

  const handleUpdateChild = async (
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

  // OCR upload handler for child passport or Emirates ID
  const handleChildFileUpload = async (
    personId: string,
    file: File | undefined,
    type: "PASSPORT" | "EMIRATES_ID"
  ) => {
    if (!file) {
      // Simulation test fixture
      if (type === "PASSPORT") {
        await handleUpdateChild(personId, {
          fullName: "Liam Daniel Carter",
          arabicName: "ليام دانيال كارتر",
          dob: "2015-08-22",
          nationality: activeWill?.testatorPerson?.nationality || "British",
          passportNumber: "GBR99887766",
        });
      } else {
        await handleUpdateChild(personId, {
          emiratesId: "784-2015-9988776-1",
          arabicName: "ليام دانيال كارتر",
          isUaeResident: true,
        });
      }
      return;
    }

    setAnalyzingChildId(personId);
    setAnalyzingType(type);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", type);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to process document (${res.status})`);
      }

      const ocr = json.data;
      const updates: any = {};
      if (ocr.fullName) updates.fullName = ocr.fullName;
      if (ocr.arabicName) updates.arabicName = ocr.arabicName;
      if (ocr.dob) updates.dob = ocr.dob;
      if (ocr.nationality) updates.nationality = ocr.nationality;
      if (ocr.passportNumber) updates.passportNumber = ocr.passportNumber;
      if (ocr.emiratesId) {
        updates.emiratesId = ocr.emiratesId;
        updates.isUaeResident = true;
      }

      await handleUpdateChild(personId, updates);
    } catch (err: any) {
      console.error("Child OCR upload error:", err);
    } finally {
      setAnalyzingChildId(null);
      setAnalyzingType(null);
    }
  };

  // Auto-transliterate child name on blur
  const handleChildNameBlur = async (
    personId: string,
    fullNameValue: string,
    currentArabic: string
  ) => {
    await handleUpdateChild(personId, { fullName: fullNameValue });
    if (fullNameValue.trim() && !currentArabic.trim()) {
      const transliterated = await transliterateToName(fullNameValue);
      if (transliterated) {
        await handleUpdateChild(personId, {
          fullName: fullNameValue,
          arabicName: transliterated,
        });
      }
    }
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
            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
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
            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
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
            const child =
              application?.persons.find((p) => p.id === assignment.personId) ||
              assignment.person;
            const personId = assignment.personId;
            const isAnalyzingThisPassport =
              analyzingChildId === personId && analyzingType === "PASSPORT";
            const isAnalyzingThisEmiratesId =
              analyzingChildId === personId && analyzingType === "EMIRATES_ID";

            return (
              <div
                key={assignment.id}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6 relative"
              >
                {/* Header */}
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
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* 1. UAE RESIDENCY FIRST */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBF9F5] p-3.5 rounded-xl border border-[#E5E0D8]">
                  <div>
                    <span className="text-xs font-bold text-[#0B1528] block">
                      Does this child also reside in the United Arab Emirates?
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Determines whether UAE Emirates ID is mandatory alongside passport.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateChild(personId, { isUaeResident: true })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        child?.isUaeResident
                          ? "bg-[#0B1528] text-white"
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                    >
                      Yes, In UAE
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateChild(personId, { isUaeResident: false })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        !child?.isUaeResident
                          ? "bg-[#0B1528] text-white"
                          : "bg-white text-gray-700 border border-gray-300"
                      }`}
                    >
                      No, Outside UAE
                    </button>
                  </div>
                </div>

                {/* 2. DOCUMENT UPLOADS: Passport (Mandatory) & EID (Mandatory if UAE Resident) */}
                <div className="space-y-4">
                  {/* Child Passport Upload */}
                  <div className="p-4 rounded-xl border border-dashed border-[#A37E44]/50 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A37E44]" />
                        <span className="text-xs font-bold text-[#0B1528] uppercase">
                          Child Passport Copy * (Mandatory for ADJD Court)
                        </span>
                      </div>
                      {child?.passportNumber ? (
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
                      Upload your child&apos;s passport bio-page to automatically extract full name, DOB, nationality, and transliterate to Arabic.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <label
                        className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold shadow-sm transition-all text-center ${
                          isAnalyzingThisPassport
                            ? "bg-[#A37E44] animate-pulse"
                            : "bg-[#0B1528] hover:bg-[#1a2844]"
                        }`}
                      >
                        {isAnalyzingThisPassport ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Analyzing Passport with Gemini Vision...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {child?.passportNumber
                                ? "Replace Child Passport"
                                : "Upload Child Passport"}
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={Boolean(analyzingChildId)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChildFileUpload(personId, file, "PASSPORT");
                            e.target.value = "";
                          }}
                        />
                      </label>

                      {!child?.passportNumber && !isAnalyzingThisPassport && (
                        <button
                          type="button"
                          onClick={() =>
                            handleChildFileUpload(personId, undefined, "PASSPORT")
                          }
                          className="text-[11px] text-[#A37E44] hover:text-[#8C6B37] font-semibold underline cursor-pointer"
                        >
                          ⚡ Simulate sample child passport
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Child Emirates ID Upload (Mandatory if UAE resident) */}
                  {child?.isUaeResident && (
                    <div className="p-4 rounded-xl border border-dashed border-emerald-400/60 bg-emerald-50/20 hover:bg-emerald-50/30 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold text-[#0B1528] uppercase">
                            Child Emirates ID * (Mandatory for UAE Residents)
                          </span>
                        </div>
                        {child?.emiratesId ? (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> EID Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase">
                            Required for UAE Children
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Upload front and back of child&apos;s Emirates ID to derive identity and address records.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Emirates ID Number *
                          </label>
                          <input
                            type="text"
                            defaultValue={child?.emiratesId || ""}
                            key={`child-eid-${child?.emiratesId}`}
                            onBlur={(e) =>
                              handleUpdateChild(personId, {
                                emiratesId: e.target.value,
                              })
                            }
                            placeholder="784-XXXX-XXXXXXX-X"
                            className="w-full px-3.5 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm font-mono focus:outline-none focus:border-[#A37E44]"
                          />
                        </div>

                        <div className="flex flex-col justify-end">
                          <label
                            className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold shadow-sm transition-all text-center ${
                              isAnalyzingThisEmiratesId
                                ? "bg-[#A37E44] animate-pulse"
                                : "bg-[#0B1528] hover:bg-[#1a2844]"
                            }`}
                          >
                            {isAnalyzingThisEmiratesId ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Scanning ID...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>
                                  {child?.emiratesId
                                    ? "Replace Emirates ID Scan"
                                    : "Upload Child Emirates ID"}
                                </span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              disabled={Boolean(analyzingChildId)}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file)
                                  handleChildFileUpload(
                                    personId,
                                    file,
                                    "EMIRATES_ID"
                                  );
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Form Fields (Autofilled & Editable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Full Legal Name (as per Passport) *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.fullName || ""}
                      key={`child-name-${child?.fullName}`}
                      onBlur={(e) =>
                        handleChildNameBlur(
                          personId,
                          e.target.value,
                          child?.arabicName || ""
                        )
                      }
                      placeholder="e.g. Liam Daniel Carter"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Phonetic Arabic Name (الاسم باللغة العربية) *
                      </label>
                      {child?.arabicName ? (
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
                      defaultValue={child?.arabicName || ""}
                      key={`child-arabic-${child?.arabicName}`}
                      onBlur={(e) =>
                        handleUpdateChild(personId, { arabicName: e.target.value })
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
                        child?.dob
                          ? new Date(child.dob).toISOString().split("T")[0]
                          : ""
                      }
                      key={`child-dob-${child?.dob}`}
                      onBlur={(e) =>
                        handleUpdateChild(personId, { dob: e.target.value })
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
                      key={`child-rel-${child?.relationship}`}
                      onChange={(e) =>
                        handleUpdateChild(personId, {
                          relationship: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    >
                      <option value="Son">Son (ابن)</option>
                      <option value="Daughter">Daughter (ابنة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Passport Number * (Mandatory)
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.passportNumber || ""}
                      key={`child-pass-${child?.passportNumber}`}
                      onBlur={(e) =>
                        handleUpdateChild(personId, {
                          passportNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. GBR99887766"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.nationality || ""}
                      key={`child-nat-${child?.nationality}`}
                      onBlur={(e) =>
                        handleUpdateChild(personId, {
                          nationality: e.target.value,
                        })
                      }
                      placeholder="e.g. British"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {childAssignments.length < 5 && (
            <button
              type="button"
              onClick={handleAddChild}
              className="w-full py-4 border-2 border-dashed border-[#A37E44]/40 hover:border-[#A37E44] bg-[#FBF9F5] hover:bg-[#A37E44]/5 text-[#A37E44] rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
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
