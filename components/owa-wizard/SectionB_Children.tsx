"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCw,
  CreditCard,
  Sparkles,
  Plus,
  Check,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { transliterateToName } from "@/lib/transliterate";

export function SectionB_Children() {
  const {
    application,
    activeWillIndex,
    addOrUpdatePerson,
    assignPersonToRole,
    removeRoleAssignment,
    updateActiveWill,
  } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const childAssignments =
    activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];

  const initialHasChildren: boolean | null =
    childAssignments.length > 0
      ? true
      : activeWill?.childrenAnswered
      ? false
      : null;

  const [hasChildren, setHasChildren] = useState<boolean | null>(initialHasChildren);
  const [openChildIndex, setOpenChildIndex] = useState<number>(
    childAssignments.length > 0 ? childAssignments.length - 1 : 0
  );
  const [analyzingChildId, setAnalyzingChildId] = useState<string | null>(null);
  const [analyzingType, setAnalyzingType] = useState<"PASSPORT" | "EMIRATES_ID" | null>(null);

  // Calculate age helper
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

  const formatDate = (dobString?: string | null): string => {
    if (!dobString) return "";
    const d = new Date(dobString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  // Helper to add a new child
  const handleAddChild = async () => {
    if (childAssignments.length >= 5) return;

    const newPerson = await addOrUpdatePerson({
      fullName: "",
      arabicName: "",
      relationship: "Son",
      nationality: activeWill?.testatorPerson?.nationality || "British",
      isUaeResident: true,
    });

    if (newPerson) {
      assignPersonToRole(newPerson.id, "CHILD", childAssignments.length + 1);
      updateActiveWill({
        hasChildrenUnder18: true,
        childrenAnswered: true,
      });
      setOpenChildIndex(childAssignments.length);
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

    const currentAssignments = activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];
    const hasAnyMinor = currentAssignments.some((ca) => {
      const p = ca.personId === personId
        ? { ...(ca.person || {}), ...updates }
        : (ca.person || application?.persons.find((ep) => ep.id === ca.personId));
      if (!p?.dob) return true;
      const age = calculateAge(p.dob);
      return age === null || age < 18;
    });

    updateActiveWill({
      hasChildrenUnder18: hasAnyMinor,
      childrenAnswered: true,
    });
  };

  const handleRemoveChild = (roleAssignmentId: string, index: number) => {
    removeRoleAssignment(roleAssignmentId);
    if (openChildIndex === index) {
      setOpenChildIndex(Math.max(0, index - 1));
    }
    const remaining = childAssignments.filter((ca) => ca.id !== roleAssignmentId);
    const hasAnyMinor = remaining.some((ca) => {
      const p = ca.person || application?.persons.find((ep) => ep.id === ca.personId);
      if (!p?.dob) return true;
      const age = calculateAge(p.dob);
      return age === null || age < 18;
    });
    updateActiveWill({
      hasChildrenUnder18: hasAnyMinor,
      childrenAnswered: true,
    });
  };

  // OCR upload handler for child passport or Emirates ID
  const handleChildFileUpload = async (
    personId: string,
    file: File | undefined,
    type: "PASSPORT" | "EMIRATES_ID"
  ) => {
    if (!file) return;

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
    <div className="space-y-6">

      {/* Children Existence Segment Question */}
      <div id="children-question" className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#e4dfe9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-[#231a30]">
            Do you have any children?
          </h2>
          <p className="text-xs text-[#6c6478] mt-0.5 max-w-xl leading-relaxed">
            List your children (both minor and adult). Under UAE civil family law, only minor children (under 18) require court guardianship appointments in Section D. Adult children do not need guardians and can be named as executors or beneficiaries.
          </p>
        </div>

        <div className="inline-flex p-1 bg-[#efeaf7] rounded-full border border-[#cfc6da] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setHasChildren(true);
              updateActiveWill({
                childrenAnswered: true,
              });
              if (childAssignments.length === 0) {
                handleAddChild();
              }
            }}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              hasChildren === true
                ? "bg-[#382852] text-white shadow-sm"
                : "text-[#3b3346] hover:text-[#231a30]"
            }`}
          >
            Yes, I have children
          </button>
          <button
            type="button"
            onClick={() => {
              setHasChildren(false);
              updateActiveWill({
                hasChildrenUnder18: false,
                childrenAnswered: true,
                roleAssignments: (activeWill?.roleAssignments || []).filter(
                  (ra) => ra.role !== "CHILD" && !ra.role.startsWith("GUARDIAN_")
                ),
              });
            }}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              hasChildren === false
                ? "bg-[#382852] text-white shadow-sm"
                : "text-[#3b3346] hover:text-[#231a30]"
            }`}
          >
            No children
          </button>
        </div>
      </div>

      {hasChildren === null && (
        <div className="p-4 rounded-xl bg-[#FAF9FC] border border-dashed border-[#cfc6da] text-xs sm:text-sm text-[#6c6478]">
          Please select <strong className="text-[#231a30]">Yes, I have children</strong> or <strong className="text-[#231a30]">No children</strong> above to confirm your family details.
        </div>
      )}

      {hasChildren === false && (
        <div className="p-4 rounded-xl bg-[#efeaf7] text-xs sm:text-sm text-[#231a30] space-y-1">
          <span className="font-semibold block">You indicated that you do not have children.</span>
          <p className="text-[#6c6478]">
            Section Nine (Guardianship) of your Will is not applicable. You can proceed directly to Section C (Executors).
          </p>
        </div>
      )}

      {/* Children List */}
      {hasChildren === true && (
        <div className="space-y-4">
          {childAssignments.map((assignment, index) => {
            const child =
              application?.persons.find((p) => p.id === assignment.personId) ||
              assignment.person;
            const personId = assignment.personId;
            const isAnalyzingThisPassport =
              analyzingChildId === personId && analyzingType === "PASSPORT";
            const isAnalyzingThisEmiratesId =
              analyzingChildId === personId && analyzingType === "EMIRATES_ID";
            const isChildOpen = openChildIndex === index;
            const childAge = calculateAge(child?.dob);

            // Collapsed summary card
            if (!isChildOpen) {
              const summaryParts = [
                child?.relationship || "Child",
                child?.dob ? `born ${formatDate(child.dob)}${childAge !== null ? ` (age ${childAge})` : ""}` : "",
                child?.nationality || "",
                child?.isUaeResident ? "lives in the UAE" : "lives outside the UAE",
              ].filter(Boolean);

              return (
                <div
                  key={assignment.id}
                  className="bg-[#FFFEFA] p-4 sm:p-5 rounded-2xl border border-[#e4dfe9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border-2 border-[#382852] text-[#231a30] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                        CHILD {index + 1}
                      </span>
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0B1528] leading-tight">
                        {child?.fullName || `Child ${index + 1}`}
                      </h2>
                      {child?.arabicName && (
                        <span className="text-[14px] font-arabic text-[#231a30] font-normal block w-fit text-left leading-relaxed" dir="rtl">
                          {child.arabicName}
                        </span>
                      )}
                      <span className="text-xs text-[#6c6478] block pt-0.5">
                        {summaryParts.join(" · ") || "Details needed"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {child?.passportNumber ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Passport read
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#7a4f0e] bg-[#fbf3e4] px-2.5 py-1 rounded-full">
                        Passport needed
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenChildIndex(index)}
                      className="px-3.5 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            }

            // Expanded full editor card
            return (
              <div
                key={assignment.id}
                className="bg-[#FFFEFA] p-6 sm:p-7 rounded-2xl border-2 border-[#382852] shadow-md space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#f0ebf5] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-[#382852] text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                        CHILD {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0B1528]">
                          {child?.fullName || `Child ${index + 1}`}
                        </h2>
                        {child?.arabicName && (
                          <span className="text-[14px] font-arabic text-[#231a30] font-normal" dir="rtl">
                            {child.arabicName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(assignment.id, index)}
                      className="text-xs text-[#b42318] hover:underline font-semibold cursor-pointer"
                    >
                      Remove child
                    </button>
                    {childAssignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOpenChildIndex(-1)}
                        className="px-3 py-1 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-segment: UAE Residence */}
                <div className="bg-[#f7f5fb] p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-[#231a30] block">
                      Does {child?.fullName ? child.fullName.split(" ")[0] : "this child"} live in the UAE?
                    </span>
                    <span className="text-[11px] text-[#6c6478]">
                      If the child lives in the UAE, an Emirates ID is required alongside their passport.
                    </span>
                  </div>

                  <div className="inline-flex p-1 bg-white rounded-full border border-[#cfc6da] self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateChild(personId, { isUaeResident: true })}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        child?.isUaeResident
                          ? "bg-[#382852] text-white"
                          : "text-[#3b3346] hover:text-[#231a30]"
                      }`}
                    >
                      In the UAE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateChild(personId, { isUaeResident: false })}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        !child?.isUaeResident
                          ? "bg-[#382852] text-white"
                          : "text-[#3b3346] hover:text-[#231a30]"
                      }`}
                    >
                      Outside the UAE
                    </button>
                  </div>
                </div>

                {/* Document Upload Tiles (Passport + Emirates ID) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Passport Tile */}
                  <div
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      child?.passportNumber
                        ? "border-[#b9dcc9] bg-[#f3faf6]"
                        : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#5b3fb0]/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-[#231a30] flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#8a6233]" />
                          <span>Child Passport</span>
                        </span>
                        {child?.passportNumber ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Read
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#6c6478] bg-[#f1eef5] px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6c6478] leading-relaxed mb-3">
                        {child?.passportNumber
                          ? "Read: name, date of birth, nationality."
                          : "The photo page. Extracts name, date of birth, and nationality."}
                      </p>
                      {child?.passportNumber && (
                        <div className="text-[11px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded border border-[#e4dfe9]">
                          📄 Passport {child.passportNumber}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col gap-1.5">
                      <label
                        className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-sm transition-all text-center ${
                          isAnalyzingThisPassport
                            ? "bg-[#5b3fb0] text-white animate-pulse"
                            : child?.passportNumber
                            ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                            : "bg-[#382852] text-white hover:bg-[#281b40]"
                        }`}
                      >
                        {isAnalyzingThisPassport ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Reading passport...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{child?.passportNumber ? "Replace document" : "Upload document"}</span>
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
                    </div>
                  </div>

                  {/* Emirates ID Tile (Only if in UAE) */}
                  {child?.isUaeResident ? (
                    <div
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        child?.emiratesId
                          ? "border-[#b9dcc9] bg-[#f3faf6]"
                          : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#5b3fb0]/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-[#231a30] flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-[#8a6233]" />
                            <span>Child Emirates ID</span>
                          </span>
                          {child?.emiratesId ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Read
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#b42318] bg-[#fef3f2] px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6c6478] leading-relaxed mb-3">
                          {child?.emiratesId
                            ? "Read: Emirates ID number."
                            : "Front and back (required for UAE residents)."}
                        </p>
                        {child?.emiratesId && (
                          <div className="text-[11px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded border border-[#e4dfe9]">
                            🪪 ID {child.emiratesId}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col gap-1.5">
                        <label
                          className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-sm transition-all text-center ${
                            isAnalyzingThisEmiratesId
                              ? "bg-[#5b3fb0] text-white animate-pulse"
                              : child?.emiratesId
                              ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                              : "bg-[#382852] text-white hover:bg-[#281b40]"
                          }`}
                        >
                          {isAnalyzingThisEmiratesId ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Reading ID...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{child?.emiratesId ? "Replace document" : "Upload document"}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            disabled={Boolean(analyzingChildId)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleChildFileUpload(personId, file, "EMIRATES_ID");
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-transparent bg-[#f7f5fb] flex items-center justify-center text-xs text-[#6c6478] text-center">
                      Child lives outside UAE. Emirates ID is not required.
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Full name in English *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.fullName || ""}
                      key={`child-name-${child?.fullName}`}
                      onBlur={(e) =>
                        handleChildNameBlur(personId, e.target.value, child?.arabicName || "")
                      }
                      placeholder="e.g. Liam Daniel Carter"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Full name in Arabic *
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      defaultValue={child?.arabicName || ""}
                      key={`child-arabic-${child?.arabicName}`}
                      onBlur={(e) => handleUpdateChild(personId, { arabicName: e.target.value })}
                      placeholder="ليام دانيال كارتر"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm font-arabic text-[#8A6233] font-medium focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Date of birth *
                    </label>
                    <input
                      type="date"
                      defaultValue={
                        child?.dob ? new Date(child.dob).toISOString().split("T")[0] : ""
                      }
                      key={`child-dob-${child?.dob}`}
                      onBlur={(e) => handleUpdateChild(personId, { dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                    />
                    {child?.dob && childAge !== null && (
                      <div
                        className={`mt-1.5 p-2.5 rounded-lg text-xs font-medium flex items-start gap-2 ${
                          childAge < 18
                            ? "bg-[#e8f4ee] text-[#1f5a3d] border border-[#b9dcc9]"
                            : "bg-[#FAF7EE] text-[#7A5B28] border border-[#E2D5BE]"
                        }`}
                      >
                        {childAge < 18 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#1f5a3d]" />
                            <span>Age {childAge}: Minor child under 18 (court guardianship applies in Section D).</span>
                          </>
                        ) : (
                          <>
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#8A6233]" />
                            <span>
                              Age {childAge}: Adult child (18+) — under UAE civil law, adult children do not require legal guardians. They will be automatically available for you to appoint as an Executor in Section C or Beneficiary in Section E.
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Relationship to you *
                    </label>
                    <select
                      defaultValue={child?.relationship || "Son"}
                      key={`child-rel-${child?.relationship}`}
                      onChange={(e) => handleUpdateChild(personId, { relationship: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                    >
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Passport number *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.passportNumber || ""}
                      key={`child-pass-${child?.passportNumber}`}
                      onBlur={(e) => handleUpdateChild(personId, { passportNumber: e.target.value })}
                      placeholder="e.g. GBR99887766"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm font-mono focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#231a30] mb-1">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      defaultValue={child?.nationality || ""}
                      key={`child-nat-${child?.nationality}`}
                      onBlur={(e) => handleUpdateChild(personId, { nationality: e.target.value })}
                      placeholder="e.g. British"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                    />
                  </div>

                  {child?.isUaeResident && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#231a30] mb-1">
                        Emirates ID number *
                      </label>
                      <input
                        type="text"
                        defaultValue={child?.emiratesId || ""}
                        key={`child-eid-input-${child?.emiratesId}`}
                        onBlur={(e) => handleUpdateChild(personId, { emiratesId: e.target.value })}
                        placeholder="784-XXXX-XXXXXXX-X"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm font-mono focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Save / Done button at bottom of child card */}
                <div className="pt-4 border-t border-[#f0ebf5] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenChildIndex(-1)}
                    className="px-6 py-2.5 rounded-full bg-[#0B1528] hover:bg-[#1a2942] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Check className="w-3.5 h-3.5 text-[#d7b48b]" />
                    <span>Done with {child?.fullName ? child.fullName.split(" ")[0] : `Child ${index + 1}`}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {childAssignments.length < 5 ? (
            <button
              type="button"
              onClick={handleAddChild}
              className="w-full py-4 px-6 bg-[#FAF7EE] hover:bg-[#F3EEDC] border-2 border-[#A37E44] text-[#0B1528] rounded-2xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] group"
            >
              <div className="w-7 h-7 rounded-full bg-[#A37E44] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[15px] font-bold">
                + Add {childAssignments.length ? "another " : "a "}child ({childAssignments.length} of 5 added)
              </span>
            </button>
          ) : (
            <p className="text-xs text-[#6c6478] text-center pt-2">
              You have added the maximum of 5 children.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
