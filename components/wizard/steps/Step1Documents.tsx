"use client";

import React, { useState } from "react";
import { useWillStore } from "@/store/useWillStore";
import { Upload, FileText, CheckCircle2, AlertCircle, Shield, Eye, Trash2 } from "lucide-react";
import { DocumentReviewModal } from "@/components/documents/DocumentReviewModal";

export function Step1Documents() {
  const { testator, updateTestator, documents, addDocument, removeDocument, loadSampleData } = useWillStore();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleResidentToggle = (isResident: boolean) => {
    updateTestator({ isUaeResident: isResident });
  };

  const handleSimulatedUpload = (type: "PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL") => {
    const fileNames: Record<string, string> = {
      PASSPORT: "Daniel_Carter_Passport_Bio.pdf",
      EMIRATES_ID: "Daniel_Carter_EmiratesID.jpg",
      UTILITY_BILL: "DEWA_Dubai_Marina_Bill.pdf",
    };

    addDocument({
      id: `doc-${Date.now()}`,
      type,
      fileName: fileNames[type],
      fileSize: 1240000,
      extracted: true,
      confidence: 99,
    });
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
            Upload Identity Documents
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            Upload official identification documents to auto-populate your personal and legal details. All documents are encrypted and retained for 1 year before automatic purging.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadSampleData();
          }}
          className="self-start sm:self-auto flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-court-bronze/40 bg-court-tan/15 hover:bg-court-tan/25 text-court-bronze-dark text-xs font-semibold tracking-wide transition-colors"
          title="Pre-fill with Daniel Carter sample court data for quick review"
        >
          <span>Fill with Sample Court Data</span>
        </button>
      </div>

      {/* UAE Resident Toggle */}
      <div className="bg-white p-5 rounded-xl border border-court-border shadow-court flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
            Residency Status
          </span>
          <span className="text-sm font-medium text-obsidian">
            Are you currently a UAE Resident with an Emirates ID?
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleResidentToggle(true)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              testator.isUaeResident
                ? "bg-obsidian text-white"
                : "bg-alabaster text-gray-600 border border-court-border hover:bg-gray-100"
            }`}
          >
            Yes, UAE Resident
          </button>
          <button
            type="button"
            onClick={() => handleResidentToggle(false)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              !testator.isUaeResident
                ? "bg-obsidian text-white"
                : "bg-alabaster text-gray-600 border border-court-border hover:bg-gray-100"
            }`}
          >
            No, Non-Resident
          </button>
        </div>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Passport */}
        <div className="bg-white p-5 rounded-xl border border-court-border shadow-court flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-court-bronze">
                Required
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                Auto-Extract
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-obsidian">Passport Copy</h3>
            <p className="text-xs text-gray-500 mt-1">
              Clear color scan of photo & bio page. Must show passport number and date of birth clearly.
            </p>
          </div>

          {documents.some((d) => d.type === "PASSPORT") ? (
            <div className="bg-alabaster p-3.5 rounded-lg border border-court-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                  {documents.find((d) => d.type === "PASSPORT")?.fileName}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99%
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="text-court-bronze font-semibold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review extraction</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const doc = documents.find((d) => d.type === "PASSPORT");
                    if (doc) removeDocument(doc.id);
                  }}
                  className="text-gray-400 hover:text-red-700"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSimulatedUpload("PASSPORT")}
              className="border-2 border-dashed border-court-border hover:border-court-bronze rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-alabaster/50 hover:bg-alabaster"
            >
              <Upload className="w-6 h-6 text-court-bronze" />
              <span className="text-xs font-semibold text-gray-700">Upload Passport Bio Page</span>
              <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
            </button>
          )}
        </div>

        {/* Card 2: Emirates ID */}
        <div className="bg-white p-5 rounded-xl border border-court-border shadow-court flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-court-bronze">
                {testator.isUaeResident ? "Required" : "Optional"}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                Arabic Name Direct
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-obsidian">Emirates ID</h3>
            <p className="text-xs text-gray-500 mt-1">
              Front and back of Emirates ID. Official Arabic name will be drawn directly from this card.
            </p>
          </div>

          {documents.some((d) => d.type === "EMIRATES_ID") ? (
            <div className="bg-alabaster p-3.5 rounded-lg border border-court-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                  {documents.find((d) => d.type === "EMIRATES_ID")?.fileName}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 98%
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="text-court-bronze font-semibold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review extraction</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const doc = documents.find((d) => d.type === "EMIRATES_ID");
                    if (doc) removeDocument(doc.id);
                  }}
                  className="text-gray-400 hover:text-red-700"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSimulatedUpload("EMIRATES_ID")}
              className="border-2 border-dashed border-court-border hover:border-court-bronze rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-alabaster/50 hover:bg-alabaster"
            >
              <Upload className="w-6 h-6 text-court-bronze" />
              <span className="text-xs font-semibold text-gray-700">Upload Emirates ID</span>
              <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
            </button>
          )}
        </div>

        {/* Card 3: Proof of Address */}
        <div className="bg-white p-5 rounded-xl border border-court-border shadow-court flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-court-bronze">
                Required
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                Address Verification
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-obsidian">Proof of Address</h3>
            <p className="text-xs text-gray-500 mt-1">
              Utility bill (DEWA, SEWA, ADDC), title deed, or tenancy agreement showing current residence.
            </p>
          </div>

          {documents.some((d) => d.type === "UTILITY_BILL") ? (
            <div className="bg-alabaster p-3.5 rounded-lg border border-court-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                  {documents.find((d) => d.type === "UTILITY_BILL")?.fileName}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 95%
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                <span className="text-xs text-gray-500">Address verified</span>
                <button
                  type="button"
                  onClick={() => {
                    const doc = documents.find((d) => d.type === "UTILITY_BILL");
                    if (doc) removeDocument(doc.id);
                  }}
                  className="text-gray-400 hover:text-red-700"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSimulatedUpload("UTILITY_BILL")}
              className="border-2 border-dashed border-court-border hover:border-court-bronze rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-alabaster/50 hover:bg-alabaster"
            >
              <Upload className="w-6 h-6 text-court-bronze" />
              <span className="text-xs font-semibold text-gray-700">Upload Proof of Address</span>
              <span className="text-[10px] text-gray-400">Utility bill or Tenancy contract</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-extraction summary note */}
      <div className="p-4 rounded-xl bg-court-tan/10 border border-court-tan/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-court-bronze flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong>Smart Auto-Extraction Active:</strong> Your legal identity information will be automatically pre-filled on the next step. You can review, adjust, and approve all personal values before proceeding to legal clauses.
        </div>
      </div>

      {/* Modal */}
      <DocumentReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        initialData={{
          fullName: testator.fullName || "Daniel Michael Carter",
          arabicName: testator.arabicName || "دانيال مايكل كارتر",
          dob: testator.dob || "1984-06-15",
          nationality: testator.nationality || "British",
          passportNumber: testator.passportNumber || "GB12345678",
          expiryDate: "2031-08-10",
          confidence: 99,
        }}
        onConfirm={(data) => {
          updateTestator({
            fullName: data.fullName,
            arabicName: data.arabicName,
            dob: data.dob,
            nationality: data.nationality,
            passportNumber: data.passportNumber,
          });
          setReviewModalOpen(false);
        }}
      />
    </div>
  );
}
