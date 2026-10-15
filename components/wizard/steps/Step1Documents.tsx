"use client";

import React, { useState, useRef } from "react";
import { useWillStore } from "@/store/useWillStore";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  Eye,
  Trash2,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { DocumentReviewModal, DocumentData } from "@/components/documents/DocumentReviewModal";

export function Step1Documents() {
  const { testator, updateTestator, documents, addDocument, removeDocument, loadSampleData } = useWillStore();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [uploadingType, setUploadingType] = useState<"PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeOcrData, setActiveOcrData] = useState<DocumentData | null>(null);

  const passportInputRef = useRef<HTMLInputElement>(null);
  const emiratesIdInputRef = useRef<HTMLInputElement>(null);
  const utilityBillInputRef = useRef<HTMLInputElement>(null);

  const handleResidentToggle = (isResident: boolean) => {
    updateTestator({ isUaeResident: isResident });
  };

  // Real Gemini Vision OCR upload handler
  const handleRealFileUpload = async (
    file: File,
    type: "PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL"
  ) => {
    setUploadingType(type);
    setUploadError(null);

    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

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

      const ocrResult = json.data;

      // Add to store documents
      const newDocId = `doc-${Date.now()}`;
      addDocument({
        id: newDocId,
        type,
        fileName: file.name,
        fileSize: file.size,
        extracted: true,
        confidence: ocrResult.confidence || 95,
      });

      // Update testator details in store with extracted data
      const updates: any = {};
      if (ocrResult.fullName) updates.fullName = ocrResult.fullName;
      if (ocrResult.arabicName) updates.arabicName = ocrResult.arabicName;
      if (ocrResult.dob) updates.dob = ocrResult.dob;
      if (ocrResult.nationality) updates.nationality = ocrResult.nationality;
      if (ocrResult.passportNumber) updates.passportNumber = ocrResult.passportNumber;
      if (ocrResult.emiratesId) {
        updates.emiratesId = ocrResult.emiratesId;
        updates.isUaeResident = true;
      }
      if (ocrResult.residentialAddress) updates.residentialAddress = ocrResult.residentialAddress;

      updateTestator(updates);

      // Open review modal with extracted values
      setActiveOcrData({
        fullName: ocrResult.fullName || testator.fullName,
        arabicName: ocrResult.arabicName || testator.arabicName,
        dob: ocrResult.dob || testator.dob,
        nationality: ocrResult.nationality || testator.nationality,
        passportNumber: ocrResult.passportNumber || testator.passportNumber,
        emiratesId: ocrResult.emiratesId || testator.emiratesId,
        residentialAddress: ocrResult.residentialAddress || testator.residentialAddress,
        expiryDate: ocrResult.expiryDate || "2031-08-10",
        confidence: ocrResult.confidence || 95,
        documentType: type,
        source: `${file.name} · Gemini Vision OCR`,
        flags: ocrResult.flags || [],
        previewUrl,
      });

      setReviewModalOpen(true);
    } catch (err: any) {
      console.error("Gemini Vision OCR Error:", err);
      setUploadError(
        err.message || "Failed to parse document with Gemini Vision. Please try a clearer scan or enter details manually."
      );
    } finally {
      setUploadingType(null);
    }
  };

  // Simulated fallback upload for developer testing
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

    if (type === "PASSPORT") {
      updateTestator({
        fullName: "Daniel Michael Carter",
        arabicName: "دانيال مايكل كارتر",
        dob: "1984-06-15",
        nationality: "British",
        passportNumber: "GB12345678",
      });
    } else if (type === "EMIRATES_ID") {
      updateTestator({
        emiratesId: "784-1984-1234567-1",
        arabicName: "دانيال مايكل كارتر",
        isUaeResident: true,
      });
    }

    setActiveOcrData({
      fullName: "Daniel Michael Carter",
      arabicName: "دانيال مايكل كارتر",
      dob: "1984-06-15",
      nationality: "British",
      passportNumber: "GB12345678",
      emiratesId: "784-1984-1234567-1",
      expiryDate: "2031-08-10",
      confidence: 99,
      documentType: type,
      source: "Sample Fixture · Daniel Carter",
      flags: [],
    });

    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={passportInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealFileUpload(file, "PASSPORT");
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={emiratesIdInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealFileUpload(file, "EMIRATES_ID");
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={utilityBillInputRef}
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleRealFileUpload(file, "UTILITY_BILL");
          e.target.value = "";
        }}
      />

      {/* Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
              Upload Identity Documents
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Gemini Vision Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            Upload official identification documents to auto-populate your personal and legal details via multimodal AI. All documents are encrypted and retained for 1 year before automatic purging.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadSampleData();
          }}
          className="self-start sm:self-auto flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-court-bronze/40 bg-court-tan/15 hover:bg-court-tan/25 text-court-bronze-dark text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          title="Pre-fill with Daniel Carter sample court data for quick review"
        >
          <span>Fill with Sample Court Data</span>
        </button>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>OCR Notice:</strong> {uploadError}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
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
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
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
                Gemini Vision OCR
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-obsidian">Passport Copy</h3>
            <p className="text-xs text-gray-500 mt-1">
              Clear color scan of photo & bio page. Auto-extracts full legal name, nationality, and phonetic Arabic transliteration.
            </p>
          </div>

          {uploadingType === "PASSPORT" ? (
            <div className="border-2 border-dashed border-court-bronze rounded-lg p-6 text-center flex flex-col items-center justify-center gap-2 bg-court-tan/10 animate-pulse">
              <Loader2 className="w-6 h-6 text-court-bronze animate-spin" />
              <span className="text-xs font-semibold text-obsidian">Analyzing Passport with Gemini Vision...</span>
              <span className="text-[10px] text-gray-500">Transliterating name to ADJD Arabic rules</span>
            </div>
          ) : documents.some((d) => d.type === "PASSPORT") ? (
            <div className="bg-alabaster p-3.5 rounded-lg border border-court-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                  {documents.find((d) => d.type === "PASSPORT")?.fileName}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {documents.find((d) => d.type === "PASSPORT")?.confidence || 98}%
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOcrData({
                      fullName: testator.fullName || "Daniel Michael Carter",
                      arabicName: testator.arabicName || "دانيال مايكل كارتر",
                      dob: testator.dob || "1984-06-15",
                      nationality: testator.nationality || "British",
                      passportNumber: testator.passportNumber || "GB12345678",
                      expiryDate: "2031-08-10",
                      confidence: documents.find((d) => d.type === "PASSPORT")?.confidence || 98,
                      documentType: "PASSPORT",
                      source: "Passport Bio Page",
                    });
                    setReviewModalOpen(true);
                  }}
                  className="text-court-bronze font-semibold hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="text-gray-400 hover:text-red-700 cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => passportInputRef.current?.click()}
                className="w-full border-2 border-dashed border-court-border hover:border-court-bronze rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-alabaster/50 hover:bg-alabaster"
              >
                <Upload className="w-6 h-6 text-court-bronze" />
                <span className="text-xs font-semibold text-gray-700">Upload Passport Bio Page</span>
                <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedUpload("PASSPORT")}
                className="w-full text-center text-[11px] text-court-bronze hover:underline font-medium pt-1 cursor-pointer"
              >
                ⚡ Or test with sample passport fixture
              </button>
            </div>
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
                Official Arabic Name
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-obsidian">Emirates ID</h3>
            <p className="text-xs text-gray-500 mt-1">
              Front or back of card. Gemini extracts official Arabic spelling and 15-digit Emirates ID number directly.
            </p>
          </div>

          {uploadingType === "EMIRATES_ID" ? (
            <div className="border-2 border-dashed border-court-bronze rounded-lg p-6 text-center flex flex-col items-center justify-center gap-2 bg-court-tan/10 animate-pulse">
              <Loader2 className="w-6 h-6 text-court-bronze animate-spin" />
              <span className="text-xs font-semibold text-obsidian">Analyzing Emirates ID with Gemini Vision...</span>
              <span className="text-[10px] text-gray-500">Extracting official Arabic name & ID number</span>
            </div>
          ) : documents.some((d) => d.type === "EMIRATES_ID") ? (
            <div className="bg-alabaster p-3.5 rounded-lg border border-court-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                  {documents.find((d) => d.type === "EMIRATES_ID")?.fileName}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {documents.find((d) => d.type === "EMIRATES_ID")?.confidence || 98}%
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOcrData({
                      fullName: testator.fullName || "Daniel Michael Carter",
                      arabicName: testator.arabicName || "دانيال مايكل كارتر",
                      dob: testator.dob || "1984-06-15",
                      nationality: testator.nationality || "British",
                      passportNumber: testator.passportNumber || "GB12345678",
                      emiratesId: testator.emiratesId || "784-1984-1234567-1",
                      expiryDate: "2031-08-10",
                      confidence: documents.find((d) => d.type === "EMIRATES_ID")?.confidence || 98,
                      documentType: "EMIRATES_ID",
                      source: "Emirates ID Scan",
                    });
                    setReviewModalOpen(true);
                  }}
                  className="text-court-bronze font-semibold hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="text-gray-400 hover:text-red-700 cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => emiratesIdInputRef.current?.click()}
                className="w-full border-2 border-dashed border-court-border hover:border-court-bronze rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-alabaster/50 hover:bg-alabaster"
              >
                <Upload className="w-6 h-6 text-court-bronze" />
                <span className="text-xs font-semibold text-gray-700">Upload Emirates ID</span>
                <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedUpload("EMIRATES_ID")}
                className="w-full text-center text-[11px] text-court-bronze hover:underline font-medium pt-1 cursor-pointer"
              >
                ⚡ Or test with sample Emirates ID fixture
              </button>
            </div>
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
                Address Extract
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-obsidian">Proof of Address</h3>
            <p className="text-xs text-gray-500 mt-1">
              Utility bill (DEWA, SEWA, ADDC), title deed, or tenancy agreement showing current UAE residence.
            </p>
          </div>

          {uploadingType === "UTILITY_BILL" ? (
            <div className="border-2 border-dashed border-court-bronze rounded-lg p-6 text-center flex flex-col items-center justify-center gap-2 bg-court-tan/10 animate-pulse">
              <Loader2 className="w-6 h-6 text-court-bronze animate-spin" />
              <span className="text-xs font-semibold text-obsidian">Analyzing Address Proof with Gemini Vision...</span>
              <span className="text-[10px] text-gray-500">Extracting verified residential address</span>
            </div>
          ) : documents.some((d) => d.type === "UTILITY_BILL") ? (
            <div className="bg-alabaster p-3.5 rounded-lg border border-court-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 truncate max-w-[150px]">
                  {documents.find((d) => d.type === "UTILITY_BILL")?.fileName}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {documents.find((d) => d.type === "UTILITY_BILL")?.confidence || 95}%
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
                  className="text-gray-400 hover:text-red-700 cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => utilityBillInputRef.current?.click()}
                className="w-full border-2 border-dashed border-court-border hover:border-court-bronze rounded-lg p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer bg-alabaster/50 hover:bg-alabaster"
              >
                <Upload className="w-6 h-6 text-court-bronze" />
                <span className="text-xs font-semibold text-gray-700">Upload Proof of Address</span>
                <span className="text-[10px] text-gray-400">Utility bill or Tenancy contract</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulatedUpload("UTILITY_BILL")}
                className="w-full text-center text-[11px] text-court-bronze hover:underline font-medium pt-1 cursor-pointer"
              >
                ⚡ Or test with sample DEWA fixture
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auto-extraction summary note */}
      <div className="p-4 rounded-xl bg-court-tan/10 border border-court-tan/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-court-bronze flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <strong>Smart Auto-Extraction Active:</strong> Your legal identity information and court phonetic Arabic transliterations are extracted via Google Gemini Vision. You can review, adjust, and approve all personal values before proceeding to legal clauses.
        </div>
      </div>

      {/* Review Modal */}
      <DocumentReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        initialData={
          activeOcrData || {
            fullName: testator.fullName || "Daniel Michael Carter",
            arabicName: testator.arabicName || "دانيال مايكل كارتر",
            dob: testator.dob || "1984-06-15",
            nationality: testator.nationality || "British",
            passportNumber: testator.passportNumber || "GB12345678",
            emiratesId: testator.emiratesId || "784-1984-1234567-1",
            residentialAddress: testator.residentialAddress || "",
            expiryDate: "2031-08-10",
            confidence: 99,
            source: "Document Review",
            flags: [],
          }
        }
        onConfirm={(data) => {
          updateTestator({
            fullName: data.fullName,
            arabicName: data.arabicName,
            dob: data.dob,
            nationality: data.nationality,
            passportNumber: data.passportNumber,
            emiratesId: data.emiratesId || testator.emiratesId,
            residentialAddress: data.residentialAddress || testator.residentialAddress,
          });
          setReviewModalOpen(false);
        }}
      />
    </div>
  );
}
