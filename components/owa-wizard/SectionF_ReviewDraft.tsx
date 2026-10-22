"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Eye, ArrowRight, ShieldCheck, Lock, Sparkles, Copy, FileText, Check, Upload } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { ADJDBilingualWillDocument } from "@/components/court/ADJDBilingualWillDocument";
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
  const approvedPeople = peopleList.filter((item) => Boolean(item.person.arabicName && item.person.isArabicApproved));
  const areAllArabicApproved = peopleList.length > 0 && approvedPeople.length === peopleList.length;

  const allReady = isSectionAOk && isSectionBOk && isSectionCOk && isSectionDOk && isSectionEOk && areAllArabicApproved && agreed;

  const handleApprovePersonArabic = async (personId: string) => {
    await addOrUpdatePerson({ id: personId, isArabicApproved: true });
    setEditingArabicId(null);
  };

  const handleApproveAllArabic = async () => {
    for (const item of peopleList) {
      if (item.person.arabicName && !item.person.isArabicApproved) {
        await addOrUpdatePerson({ id: item.person.id, isArabicApproved: true });
      }
    }
  };

  const handleCopyPartner = async () => {
    setIsCopying(true);
    await copyWillToPartnerWill();
    setIsCopying(false);
  };

  const handleProceedToSubmission = async () => {
    if (!allReady) return;
    await saveCurrentSectionToDb();
    router.push(`/checkout/court-fee?applicationId=${application?.id}`);
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

          {/* Arabic Names */}
          <div className="bg-[#FFFEFA] p-3.5 rounded-xl border border-[#e4dfe9] flex items-start gap-2.5">
            {areAllArabicApproved ? (
              <CheckCircle2 className="w-4 h-4 text-[#2f7a55] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#b7791f] shrink-0 mt-0.5" />
            )}
            <div>
              <a href="#arabic-names" className="text-xs font-bold text-[#231a30] hover:underline">
                Arabic names
              </a>
              <span className="text-[11px] text-[#6c6478] block">
                {approvedPeople.length} of {peopleList.length} approved
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Arabic Spelling Approval Card */}
      <section id="arabic-names" className="bg-[#FFFEFA] p-5 sm:p-6 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0ebf5] pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-[#231a30]">
              Arabic spelling of every name
            </h2>
            <p className="text-xs text-[#6c6478] mt-0.5">
              ADJD&apos;s template spells each name in Arabic by sound. Check that each one reads the way the name sounds.
            </p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            areAllArabicApproved ? "bg-[#e8f4ee] text-[#1f5a3d]" : "bg-[#fbf3e4] text-[#7a4f0e]"
          }`}>
            {approvedPeople.length} of {peopleList.length} approved
          </span>
        </div>

        <div className="space-y-3">
          {peopleList.map(({ person, roles }) => {
            const isApproved = Boolean(person.arabicName && person.isArabicApproved);
            const isEditing = editingArabicId === person.id;

            return (
              <div
                key={person.id}
                className="p-3 rounded-xl bg-white border border-[#e4dfe9] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#C73A30] block">
                    {roles.join(" · ").toUpperCase()}
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#0B1528]">
                    {person.fullName || "Unnamed"}
                  </h3>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {isApproved && !isEditing ? (
                    <span className="text-base font-arabic text-[#231a30] font-normal" dir="rtl">
                      {person.arabicName}
                    </span>
                  ) : (
                    <input
                      type="text"
                      dir="rtl"
                      defaultValue={person.arabicName || ""}
                      placeholder="الاسم بالعربية"
                      onBlur={async (e) => {
                        await addOrUpdatePerson({ id: person.id, arabicName: e.target.value });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#cfc6da] text-sm font-arabic text-[#8A6233] font-medium bg-white text-right focus:outline-none focus:border-[#5b3fb0] w-48"
                    />
                  )}

                  {isApproved && !isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1f5a3d] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingArabicId(person.id)}
                        className="text-xs text-[#5b3fb0] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApprovePersonArabic(person.id)}
                      disabled={!person.arabicName}
                      className="px-3 py-1 rounded-full border border-[#382852] text-[#382852] hover:bg-[#382852] hover:text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!areAllArabicApproved && (
          <button
            type="button"
            onClick={handleApproveAllArabic}
            className="px-4 py-2 rounded-full border border-[#382852] text-[#382852] hover:bg-[#382852] hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Approve all names that have an Arabic spelling
          </button>
        )}
      </section>

      {/* Official Court Bilingual Will Preview Card */}
      <section className="bg-white rounded-2xl border border-[#e4dfe9] shadow-sm overflow-hidden">
        <div className="bg-[#382852] text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide">
              Official ADJD Bilingual Will Draft (ADJD-NM0723-07-03)
            </h3>
            <span className="text-xs text-[#d7b48b]">Side-by-side English LTR & Arabic RTL</span>
          </div>
          <Link
            href="/preview"
            className="text-xs text-[#d7b48b] hover:underline flex items-center gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open full 10 sections</span>
          </Link>
        </div>

        <div className="p-4 sm:p-6 bg-[#fbfaf8] max-h-[600px] overflow-y-auto">
          {activeWill && testator ? (
            <ADJDBilingualWillDocument
              will={activeWill}
              testator={testator}
              assignments={activeWill.roleAssignments}
            />
          ) : (
            <div className="text-center py-8 text-xs text-[#6c6478]">
              Details loading...
            </div>
          )}
        </div>
      </section>

      {/* Signature Capture Card */}
      {testator && (
        <TestatorSignatureCard
          signatureDataUrl={testator?.signatureDataUrl}
          onSaveSignature={async (dataUrl) => {
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
      <section className="bg-[#FFFEFA] p-6 sm:p-7 rounded-2xl border-2 border-[#382852] shadow-sm space-y-4">
        <h2 className="text-base font-serif font-bold text-[#231a30]">
          Approve your Will
        </h2>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#382852] rounded border-gray-300 focus:ring-[#382852]"
          />
          <span className="text-xs sm:text-sm text-[#231a30] leading-relaxed">
            I have read my Will in English and Arabic. The names, appointments and shares are correct, and I am ready for legal review.
          </span>
        </label>

        <div className="pt-3 border-t border-[#f0ebf5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#6c6478] max-w-lg">
            Next: our legal expert reviews your Will, then we file it with ADJD. You pay ADJD&apos;s AED 950 court fee on its portal after ADJD approves it.
          </p>

          <button
            type="button"
            disabled={!allReady}
            onClick={handleProceedToSubmission}
            className={`px-6 py-3 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-2 shrink-0 ${
              allReady
                ? "bg-[#c73a30] hover:bg-[#ad3128] text-white cursor-pointer shadow-sm"
                : "bg-[#e4dfe9] text-[#6c6478] cursor-not-allowed"
            }`}
          >
            <span>Approve and send for legal review</span>
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
              : !areAllArabicApproved
              ? "Approve the Arabic spelling of all names above."
              : !agreed
              ? "Tick the confirmation checkbox above to continue."
              : ""}
          </div>
        )}
      </section>
    </div>
  );
}
