"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Lock, Sparkles, Copy, FileText, Check, Upload } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { TestatorSignatureCard } from "@/components/signature/TestatorSignatureCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SectionF_ReviewDraft() {
  const router = useRouter();
  const {
    application,
    activeWillIndex,
    setActiveWillIndex,
    copyWillToPartnerWill,
    saveCurrentSectionToDb,
    addOrUpdatePerson,
  } = useOwaStore();

  const [agreed, setAgreed] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [editingArabicId, setEditingArabicId] = useState<string | null>(null);

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const isCouples = application?.packageType === "COUPLES";
  const existingPersons = application?.persons || [];

  const testator = activeWill?.testatorPerson;
  const otherWillIndex = activeWillIndex === 1 ? 2 : 1;
  const partnerWill = application?.wills.find((w) => w.willIndex === otherWillIndex);

  // Section Checks
  const isSectionAOk = Boolean(testator?.fullName && testator?.passportNumber && testator?.dob && testator?.address);

  const childrenAssignments = activeWill?.roleAssignments.filter((ra) => ra.role === "CHILD") || [];
  const isChildrenAnswered = Boolean(activeWill?.childrenAnswered || childrenAssignments.length > 0);
  const isSectionBOk = isChildrenAnswered && (
    !activeWill?.hasChildrenUnder18 ||
    (childrenAssignments.length > 0 &&
      childrenAssignments.every((ca) => {
        const p = ca.person || existingPersons.find((ep) => ep.id === ca.personId);
        return !!(p?.fullName && p?.passportNumber);
      }))
  );

  const executors = activeWill?.roleAssignments.filter((ra) => ra.role.startsWith("EXECUTOR_")) || [];
  const isSectionCOk = executors.some((ra) => ra.role === "EXECUTOR_PRIMARY");

  const guardians = activeWill?.roleAssignments.filter((ra) => ra.role.startsWith("GUARDIAN_")) || [];
  const minorChildren = childrenAssignments.filter((ca) => {
    const p = ca.person || existingPersons.find((ep) => ep.id === ca.personId);
    if (!p?.dob) return true;
    const birth = new Date(p.dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age < 18;
  });
  const isSectionDOk = isSectionBOk && (minorChildren.length === 0 || guardians.some((ra) => ra.role === "GUARDIAN_PERMANENT"));

  const primaries = activeWill?.roleAssignments.filter(
    (ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY"
  ) || [];
  const primaryTotal = Math.round(primaries.reduce((sum, b) => sum + (Number(b.sharePercentage) || 0), 0) * 100) / 100;

  const substitutes = activeWill?.roleAssignments.filter(
    (ra) => ra.role === "BENEFICIARY_SUBSTITUTE"
  ) || [];
  const substituteTotal = Math.round(substitutes.reduce((sum, b) => sum + (Number(b.sharePercentage) || 0), 0) * 100) / 100;

  const isSectionEOk = primaries.length >= 1 && primaryTotal === 100 && substitutes.length >= 1 && substituteTotal === 100;

  // Collect unique people in Will for Arabic Approval
  const peopleMap = new Map<string, { person: any; roles: string[] }>();

  if (testator) {
    peopleMap.set(testator.id, { person: testator, roles: ["You (Testator)"] });
  }

  executors.forEach((ex) => {
    const p = ex.person || existingPersons.find((ep) => ep.id === ex.personId);
    if (p) {
      const roleName = ex.role === "EXECUTOR_PRIMARY" ? "Executor (a)" : ex.role === "EXECUTOR_SUBSTITUTE" ? "Substitute executor (b)" : "Further executor (c)";
      const existing = peopleMap.get(p.id);
      if (existing) existing.roles.push(roleName);
      else peopleMap.set(p.id, { person: p, roles: [roleName] });
    }
  });

  guardians.forEach((gd) => {
    const p = gd.person || existingPersons.find((ep) => ep.id === gd.personId);
    if (p) {
      const roleName = gd.role === "GUARDIAN_PERMANENT" ? "Permanent guardian" : gd.role === "GUARDIAN_SUBSTITUTE_PERM" ? "Backup permanent guardian" : "Interim guardian";
      const existing = peopleMap.get(p.id);
      if (existing) existing.roles.push(roleName);
      else peopleMap.set(p.id, { person: p, roles: [roleName] });
    }
  });

  primaries.forEach((pr) => {
    const p = pr.person || existingPersons.find((ep) => ep.id === pr.personId);
    if (p) {
      const roleName = `Primary beneficiary, ${pr.sharePercentage || 0}%`;
      const existing = peopleMap.get(p.id);
      if (existing) existing.roles.push(roleName);
      else peopleMap.set(p.id, { person: p, roles: [roleName] });
    }
  });

  substitutes.forEach((sub) => {
    const p = sub.person || existingPersons.find((ep) => ep.id === sub.personId);
    if (p) {
      const roleName = `Substitute beneficiary, ${sub.sharePercentage || 0}%`;
      const existing = peopleMap.get(p.id);
      if (existing) existing.roles.push(roleName);
      else peopleMap.set(p.id, { person: p, roles: [roleName] });
    }
  });

  minorChildren.forEach((mc) => {
    const p = mc.person || existingPersons.find((ep) => ep.id === mc.personId);
    if (p) {
      const roleName = "Child under 18";
      const existing = peopleMap.get(p.id);
      if (existing) existing.roles.push(roleName);
      else peopleMap.set(p.id, { person: p, roles: [roleName] });
    }
  });

  const peopleList = Array.from(peopleMap.values());
  const allReady = isSectionAOk && isSectionBOk && isSectionCOk && isSectionDOk && isSectionEOk && agreed;

  const handleCopyPartner = async () => {
    setIsCopying(true);
    await copyWillToPartnerWill();
    setIsCopying(false);
  };

  const handleProceedToPreview = async () => {
    if (!allReady) return;
    await saveCurrentSectionToDb();
    router.push(`/preview${application?.id ? `?applicationId=${application.id}` : ""}`);
  };

  return (
    <div className="space-y-6">

      {/* Mirror Will Banner */}
      {isCouples && (
        <div className="bg-[#382852] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-semibold">
              You are reviewing Will {activeWillIndex}: {testator?.fullName || `Partner ${activeWillIndex}`}
            </h4>
            <p className="text-xs text-[#d9d0e6] mt-0.5">
              {partnerWill?.testatorPerson?.fullName || `Will ${otherWillIndex}`}&apos;s Will can reuse the same people. Copy them across to save time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveWillIndex(otherWillIndex)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              Open {partnerWill?.testatorPerson?.fullName ? partnerWill.testatorPerson.fullName.split(" ")[0] : `Will ${otherWillIndex}`}
            </button>
            <button
              type="button"
              onClick={handleCopyPartner}
              disabled={isCopying}
              className="px-3.5 py-2 bg-[#d7b48b] hover:bg-[#c5a37a] text-[#281b40] rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy people to Will {otherWillIndex}</span>
            </button>
          </div>
        </div>
      )}

      {/* 6-Item Readiness Check Grid */}
      <section className="space-y-2">
        <h2 className="text-base font-serif font-bold text-[#231a30]">
          Readiness check
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* A */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            {isSectionAOk ? (
              <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#b7791f] shrink-0 mt-0.5" />
            )}
            <div>
              <Link href="/wizard/details" className="text-xs font-bold text-[#231a30] hover:underline">
                Your details
              </Link>
              <span className="text-[11px] text-[#6c6478] block">
                {isSectionAOk ? "All fields checked" : "Needs passport and address"}
              </span>
            </div>
          </div>

          {/* B */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            <div>
              <Link href="/wizard/children" className="text-xs font-bold text-[#231a30] hover:underline">
                Children
              </Link>
              <span className="text-[11px] text-[#6c6478] block">
                {childrenAssignments.length > 0 ? `${childrenAssignments.length} child listed` : "No children"}
              </span>
            </div>
          </div>

          {/* C */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            {isSectionCOk ? (
              <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#b7791f] shrink-0 mt-0.5" />
            )}
            <div>
              <Link href="/wizard/executors" className="text-xs font-bold text-[#231a30] hover:underline">
                Executors
              </Link>
              <span className="text-[11px] text-[#6c6478] block">
                {isSectionCOk ? `${executors.length} of 3 named` : "Primary executor required"}
              </span>
            </div>
          </div>

          {/* D */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            {isSectionDOk ? (
              <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#b7791f] shrink-0 mt-0.5" />
            )}
            <div>
              <Link href="/wizard/guardians" className="text-xs font-bold text-[#231a30] hover:underline">
                Guardians
              </Link>
              <span className="text-[11px] text-[#6c6478] block">
                {minorChildren.length === 0 ? "Not needed" : `${guardians.length} of 4 named`}
              </span>
            </div>
          </div>

          {/* E */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            {isSectionEOk ? (
              <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#b7791f] shrink-0 mt-0.5" />
            )}
            <div>
              <Link href="/wizard/beneficiaries" className="text-xs font-bold text-[#231a30] hover:underline">
                Beneficiaries
              </Link>
              <span className="text-[11px] text-[#6c6478] block">
                {isSectionEOk ? `${primaries.length} primary, ${substitutes.length} substitute` : "Shares must total 100%"}
              </span>
            </div>
          </div>

          {/* Roles and Names */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            <div>
              <a href="#roles-and-names" className="text-xs font-bold text-[#231a30] hover:underline">
                Roles & names
              </a>
              <span className="text-[11px] text-[#6c6478] block">
                {peopleList.length} people appointed & transliterated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Roles and Names in your Will Card */}
      <section id="roles-and-names" className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0ebf5] pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-[#231a30]">
              Roles and names
            </h2>
            <p className="text-xs text-[#6c6478] mt-0.5">
              Review all appointed roles and verify each person&apos;s legal English name and official Arabic phonetic transliteration.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF7EE] text-[#8A6233] border border-[#e2d5be]">
            {peopleList.length} persons appointed
          </span>
        </div>

        <div className="space-y-3">
          {peopleList.map(({ person, roles }) => {
            const isEditing = editingArabicId === person.id;

            return (
              <div
                key={person.id}
                className="p-3.5 rounded-xl bg-white border border-[#e4dfe9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-[#cfc6da] transition-all"
              >
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {roles.map((r, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[1px] bg-[#FAF7EE] text-[#8A6233] border border-[#e2d5be]"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#0B1528]">
                    {person.fullName || "Unnamed"}
                  </h3>
                  <p className="text-[12px] text-[#6c6478] pt-0.5">
                    {person.nationality || "National"} · {person.isUaeResident ? "UAE resident" : "Outside UAE"}
                    {person.passportNumber ? ` · Passport ${person.passportNumber}` : ""}
                    {person.isUaeResident && person.emiratesId ? ` · EID ${person.emiratesId}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {isEditing ? (
                    <input
                      type="text"
                      dir="rtl"
                      defaultValue={person.arabicName || ""}
                      placeholder="الاسم بالعربية"
                      onBlur={async (e) => {
                        await addOrUpdatePerson({ id: person.id, arabicName: e.target.value });
                        setEditingArabicId(null);
                      }}
                      autoFocus
                      className="px-3 py-1.5 rounded-lg border border-[#A37E44] text-sm font-arabic text-[#0B1528] font-medium bg-white text-right focus:outline-none w-48 shadow-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-base font-arabic font-semibold text-[#0B1528] px-3.5 py-1.5 bg-[#FAF7EE] rounded-lg border border-[#e2d5be]" dir="rtl">
                        {person.arabicName || "—"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingArabicId(person.id)}
                        className="text-xs text-[#A37E44] hover:underline cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Signature Capture Card */}
      {testator && (
        <TestatorSignatureCard
          signatureDataUrl={
            testator?.signatureDataUrl ||
            (typeof window !== "undefined"
              ? localStorage.getItem(`owa_signature_${testator.id}`) ||
                localStorage.getItem("owa_signature_latest")
              : null)
          }
          onSaveSignature={async (dataUrl) => {
            if (typeof window !== "undefined") {
              try {
                if (dataUrl) {
                  localStorage.setItem("owa_signature_latest", dataUrl);
                  localStorage.setItem(`owa_signature_${testator.id}`, dataUrl);
                } else {
                  localStorage.removeItem("owa_signature_latest");
                  localStorage.removeItem(`owa_signature_${testator.id}`);
                }
              } catch (_) {}
            }
            if (testator?.id) {
              await addOrUpdatePerson({
                id: testator.id,
                signatureDataUrl: dataUrl,
              });
            }
          }}
        />
      )}

      {/* Final Approval Confirmation Card */}
      <section className="bg-[#FFFEFA] p-6 sm:p-7 rounded-2xl border-2 border-[#382852] shadow-sm space-y-5">
        <h2 className="text-lg font-serif font-bold text-[#0B1528] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#A37E44]" />
          Approve your Will
        </h2>

        {/* Highlighted box with rich luxury gold/bronze border and warm ivory fill */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#FAF7EE] to-[#FFFDF9] border-2 border-[#A37E44] shadow-sm hover:border-[#8A6233] transition-all">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#A37E44] rounded border-2 border-[#A37E44] text-[#A37E44] focus:ring-[#A37E44] cursor-pointer"
            />
            <span className="text-sm sm:text-base font-semibold text-[#0B1528] leading-relaxed">
              I have read my Will in English and Arabic. The names, appointments and shares are correct, and I am ready for legal review.
            </span>
          </label>
        </div>

        <div className="pt-3 border-t border-[#f0ebf5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#6c6478] max-w-lg leading-relaxed">
            Next: Review your full bilingual ADJD court document draft. After previewing, our legal expert reviews your Will before filing with ADJD.
          </p>

          <button
            type="button"
            disabled={!allReady}
            onClick={handleProceedToPreview}
            className={`px-6 py-3 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-2 shrink-0 ${
              allReady
                ? "bg-[#0B1528] hover:bg-[#1a2942] text-white cursor-pointer shadow-md"
                : "bg-[#e4dfe9] text-[#6c6478] cursor-not-allowed"
            }`}
          >
            <span>Continue to Court Will Draft Preview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!allReady && (
          <div className="text-xs text-[#b7791f] pt-1">
            {!isSectionAOk
              ? "Complete Section A (Details) before submitting."
              : !isSectionCOk
              ? "Choose a primary executor in Section C."
              : !isSectionEOk
              ? "Primary and substitute beneficiaries must total 100% in Section E."
              : !agreed
              ? "Please tick the highlighted confirmation box above to continue."
              : ""}
          </div>
        )}
      </section>
    </div>
  );
}
