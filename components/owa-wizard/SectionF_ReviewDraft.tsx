"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Eye, ArrowRight, ShieldCheck, Lock, Sparkles, Copy, FileText } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { ADJDBilingualWillDocument } from "@/components/court/ADJDBilingualWillDocument";
import { TestatorSignatureCard } from "@/components/signature/TestatorSignatureCard";
import { useRouter } from "next/navigation";

export function SectionF_ReviewDraft() {
  const router = useRouter();
  const {
    application,
    activeWillIndex,
    setActiveWillIndex,
    copyWillToPartnerWill,
    saveCurrentSectionToDb,
  } = useOwaStore();

  const [confirmed, setConfirmed] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const isCouples = application?.packageType === "COUPLES";

  // Section completion audits
  const testator = activeWill?.testatorPerson;
  const hasTestator = !!(testator?.fullName && testator?.passportNumber);

  // Document verification audits
  const testatorDocs = testator?.documents || [];
  const hasPassportDoc =
    testatorDocs.some((d) => d.documentType === "PASSPORT") ||
    Boolean(testator?.passportNumber);
  const isResident = testator?.isUaeResident ?? false;
  const hasEmiratesIdDoc =
    testatorDocs.some((d) => d.documentType === "EMIRATES_ID") ||
    Boolean(testator?.emiratesId);
  const hasAddressDoc =
    testatorDocs.some((d) => d.documentType === "PROOF_OF_ADDRESS") ||
    Boolean(testator?.address);

  // Court document audit: Passport mandatory, Emirates ID if resident, Address required
  const isDocsAuditPassed = hasPassportDoc && (!isResident || hasEmiratesIdDoc) && hasAddressDoc;

  const executors = activeWill?.roleAssignments.filter((ra) => ra.role.startsWith("EXECUTOR_")) || [];
  const hasPrimaryExecutor = executors.some((ra) => ra.role === "EXECUTOR_PRIMARY");
  const primaries = activeWill?.roleAssignments.filter(
    (ra) =>
      (ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY") &&
      (ra.person || application?.persons.some((p) => p.id === ra.personId))
  ) || [];
  const primaryTotal = primaries.reduce((sum, b) => sum + (Number(b.sharePercentage) || 0), 0);
  const isPrimaryValid =
    primaries.length >= 1 &&
    primaries.length <= 3 &&
    Math.abs(primaryTotal - 100) < 0.01;

  const substitutes = activeWill?.roleAssignments.filter(
    (ra) =>
      ra.role === "BENEFICIARY_SUBSTITUTE" &&
      (ra.person || application?.persons.some((p) => p.id === ra.personId))
  ) || [];
  const substituteTotal = substitutes.reduce((sum, b) => sum + (Number(b.sharePercentage) || 0), 0);
  const isSubstituteValid =
    substitutes.length >= 1 &&
    substitutes.length <= 2 &&
    Math.abs(substituteTotal - 100) < 0.01;

  const allAuditsPassed =
    hasTestator &&
    isDocsAuditPassed &&
    hasPrimaryExecutor &&
    isPrimaryValid &&
    isSubstituteValid;

  const handleConfirmAndProceed = async () => {
    if (!confirmed || !allAuditsPassed) return;

    // Save and redirect to Stage 2 Court Fee checkout
    await saveCurrentSectionToDb();
    router.push(`/checkout/court-fee?applicationId=${application?.id}`);
  };

  const handleCopyPartner = async () => {
    setIsCopying(true);
    await copyWillToPartnerWill();
    setIsCopying(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section F · Final Review & Verification
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Review Your Official ADJD Non-Muslim Will Draft
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Carefully review your bilingual will. Under court guidelines, drafts are presented in dual-column format (English LTR / Arabic RTL) for your review prior to court registry fee submission.
        </p>
      </div>

      {/* Couples Will Switcher & Mirror Action */}
      {isCouples && (
        <div className="bg-[#0B1528] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#A37E44] shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">Couples Mirror Package Active</h4>
              <p className="text-xs text-gray-300 mt-0.5">
                Currently reviewing: <strong>Will #{activeWillIndex} ({activeWill?.testatorPerson?.fullName || "Partner"})</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveWillIndex(activeWillIndex === 1 ? 2 : 1)}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all"
            >
              Switch to Will #{activeWillIndex === 1 ? 2 : 1}
            </button>
            {activeWillIndex === 1 && (
              <button
                type="button"
                onClick={handleCopyPartner}
                disabled={isCopying}
                className="px-3.5 py-1.5 bg-[#A37E44] hover:bg-[#B38D48] text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Mirror to Spouse
              </button>
            )}
          </div>
        </div>
      )}

      {/* Compliance Audit Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#A37E44]" />
          Pre-Court Registration Readiness Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* 1. Testator Details */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] flex items-start gap-3">
            {hasTestator ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold text-[#0B1528]">Testator Details</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {hasTestator ? "Verified personal details" : "Passport or details missing"}
              </p>
            </div>
          </div>

          {/* 2. Documents Audit */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] flex items-start gap-3">
            {isDocsAuditPassed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold text-[#0B1528]">Court Documents</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isDocsAuditPassed
                  ? `${testatorDocs.length > 0 ? `${testatorDocs.length} files attached` : "Identity verified"}`
                  : !hasPassportDoc
                  ? "Passport required"
                  : isResident && !hasEmiratesIdDoc
                  ? "Emirates ID required"
                  : "Address doc required"}
              </p>
            </div>
          </div>

          {/* 3. Primary Executor */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] flex items-start gap-3">
            {hasPrimaryExecutor ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold text-[#0B1528]">Primary Executor</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {hasPrimaryExecutor ? "Clause 4 valid" : "Primary executor required"}
              </p>
            </div>
          </div>

          {/* 4. Primary Residue */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] flex items-start gap-3">
            {isPrimaryValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold text-[#0B1528]">Primary (100%)</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isPrimaryValid
                  ? `${primaries.length} primary · 100%`
                  : `Currently ${primaryTotal}%`}
              </p>
            </div>
          </div>

          {/* 5. Substitute Group */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] flex items-start gap-3">
            {isSubstituteValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold text-[#0B1528]">Substitute (100%)</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isSubstituteValid
                  ? `${substitutes.length} substitute · 100%`
                  : `Currently ${substituteTotal}%`}
              </p>
            </div>
          </div>
        </div>

        {/* Attached Evidence Pills */}
        {testatorDocs.length > 0 && (
          <div className="pt-3 border-t border-[#E5E0D8]/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">Attached Evidence:</span>
            {testatorDocs.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#A37E44]/30 text-[#0B1528] text-[11px] font-mono"
              >
                <FileText className="w-3 h-3 text-[#A37E44]" />
                <span>{doc.fileName || doc.documentType}</span>
                {doc.ocrConfidence && (
                  <span className="text-[9px] text-[#A37E44] font-bold">({doc.ocrConfidence}%)</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Live Dual-Column Court Document Preview (View-Only) */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
        <div className="bg-[#0B1528] text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#A37E44]" />
            <h3 className="text-sm font-semibold tracking-wide">
              Live Official Court Document Preview (ADJD-NM0723-07-03)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#A37E44] bg-white/10 px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure In-App Preview · Court Certified</span>
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-[#FBF9F5] max-h-[700px] overflow-y-auto">
          {activeWill && activeWill.testatorPerson ? (
            <ADJDBilingualWillDocument
              will={activeWill}
              testator={activeWill.testatorPerson}
              assignments={activeWill.roleAssignments}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 text-xs">
              Complete Section A details to preview your official ADJD bilingual will.
            </div>
          )}
        </div>
      </div>

      {/* Testator Signature Capture */}
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

      {/* Confirmation and Final CTA */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#A37E44] rounded border-gray-300 focus:ring-[#A37E44]"
          />
          <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            I confirm that I have reviewed the generated Abu Dhabi Civil Family Court Non-Muslim Will draft. All personal details, transliterated names, executor appointments, and 100% estate allocations are accurate. I am ready to proceed to official court registration submission.
          </span>
        </label>

        <div className="pt-4 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <span>Stage 2 Court Fee Due: </span>
            <span className="font-bold text-[#0B1528]">
              {isCouples ? "AED 1,900" : "AED 950"} (Inclusive of ADJD Registry Filing)
            </span>
          </div>

          <button
            type="button"
            disabled={!confirmed || !allAuditsPassed}
            onClick={handleConfirmAndProceed}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
              confirmed && allAuditsPassed
                ? "bg-[#0B1528] hover:bg-[#1a2844] text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>Proceed to Court Registration Fee Settlement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
