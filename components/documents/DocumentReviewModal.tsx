"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ShieldCheck, FileText, User, Calendar, Flag, Hash, AlertTriangle, AlertCircle } from "lucide-react";

export interface DocumentData {
  fullName: string;
  arabicName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  emiratesId?: string;
  residentialAddress?: string;
  expiryDate: string;
  confidence: number;
  documentType?: "PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL" | "UNKNOWN";
  source?: string;
  flags?: string[];
  previewUrl?: string;
}

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (data: DocumentData) => void;
  initialData?: DocumentData;
}

export function DocumentReviewModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}: DocumentReviewModalProps) {
  const [formData, setFormData] = useState<DocumentData>(
    initialData || {
      fullName: "Sarah Elizabeth Carter",
      arabicName: "سارة إليزابيث كارتر",
      dob: "1988-03-20",
      nationality: "British",
      passportNumber: "GB55443322",
      emiratesId: "",
      residentialAddress: "",
      expiryDate: "2031-05-15",
      confidence: 99,
      documentType: "PASSPORT",
      source: "Passport Bio Page",
      flags: [],
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof DocumentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onConfirm) onConfirm(formData);
    onClose();
  };

  const isEmiratesId = formData.documentType === "EMIRATES_ID";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-court-border shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-obsidian text-white px-6 py-4 flex items-center justify-between border-b border-obsidian-light">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-court-bronze/20 text-court-bronze flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Review Extracted Document
              </h3>
              <p className="text-xs text-white/60">
                {formData.source || "Gemini Multimodal OCR"} · Confidence {formData.confidence}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Side-by-side Layout */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
          {/* Left Column: Document Image or Preview */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center justify-between">
              <span>{isEmiratesId ? "Scanned Emirates ID" : "Scanned Passport Bio Page"}</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Verified Readable · {formData.confidence}%
              </span>
            </div>

            {formData.previewUrl ? (
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-inner max-h-[320px] bg-slate-900 flex items-center justify-center relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.previewUrl}
                  alt="Uploaded document preview"
                  className="max-h-[320px] w-full object-contain"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-[10px] py-1 px-2 rounded backdrop-blur-sm truncate">
                  {formData.source || "Original Uploaded Scan"}
                </div>
              </div>
            ) : (
              /* Passport / ID Card mockup */
              <div className="bg-[#1C2C4E] rounded-xl p-5 text-white shadow-inner border border-slate-700 flex flex-col justify-between aspect-[1.42/1] relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-white/10 pb-2">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-court-tan">
                      {isEmiratesId ? "United Arab Emirates" : (formData.nationality || "United Kingdom")}
                    </div>
                    <div className="text-xs font-serif font-bold tracking-wider">
                      {isEmiratesId ? "RESIDENT IDENTITY CARD" : "PASSPORT"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-white/60">Type / Code</div>
                    <div className="text-[10px] font-mono font-bold">
                      {isEmiratesId ? "ID / ARE" : "P / GBR"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 my-2 items-center">
                  <div className="w-20 h-24 rounded bg-slate-600/80 border border-white/20 flex flex-col items-center justify-center text-white/40 flex-shrink-0">
                    <User className="w-8 h-8" />
                    <span className="text-[8px] mt-1 uppercase font-mono">PHOTO</span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono flex-1 overflow-hidden">
                    <div>
                      <span className="text-[8px] text-white/50 block">Legal Name</span>
                      <span className="font-bold text-white text-xs truncate block">
                        {formData.fullName || "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-[8px] text-white/50 block">Nationality</span>
                        <span>{formData.nationality || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-white/50 block">Date of Birth</span>
                        <span>{formData.dob || "—"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-white/50 block">
                        {isEmiratesId ? "ID Number" : "Passport No."}
                      </span>
                      <span className="font-bold text-court-tan">
                        {isEmiratesId ? formData.emiratesId : formData.passportNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MRZ Band at bottom */}
                <div className="bg-black/40 rounded p-1.5 font-mono text-[9px] text-emerald-400 tracking-wider truncate">
                  {isEmiratesId ? (
                    <>
                      I&lt;ARE{formData.emiratesId || "784-1984-1234567-1"}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                      {formData.dob?.replace(/-/g, "") || "840615"}4M{formData.expiryDate?.replace(/-/g, "") || "310810"}2ARE&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;01
                    </>
                  ) : (
                    <>
                      P&lt;GBR{formData.fullName?.split(" ")[0]?.toUpperCase() || "CARTER"}&lt;&lt;{formData.fullName?.split(" ")[1]?.toUpperCase() || "DANIEL"}&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
                      {formData.passportNumber || "GB12345678"}4GBR{formData.dob?.replace(/-/g, "") || "840615"}6M{formData.expiryDate?.replace(/-/g, "") || "310810"}2&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Flags & Warnings */}
            {formData.flags && formData.flags.length > 0 && (
              <div className="space-y-1.5">
                {formData.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-gray-500 leading-relaxed bg-alabaster p-3 rounded-lg border border-court-border">
              Privacy Notice: This document file is encrypted and processed via Google Gemini Multimodal Vision API per UAE court requirements.
            </div>
          </div>

          {/* Right Column: Editable Extracted Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Extracted Values for Will
              </span>
              <span className="text-[11px] text-gray-500">Edit any field to correct</span>
            </div>

            {/* Field: Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Full Legal Name</label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Source: {formData.source || "Passport"} · {formData.confidence}%
                </span>
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-medium text-gray-900"
              />
            </div>

            {/* Field: Arabic Transliterated Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">
                  Arabic Name (الاسم باللغة العربية)
                </label>
                <span className="text-[10px] font-semibold text-court-bronze-dark bg-court-tan/20 px-2 py-0.5 rounded">
                  {isEmiratesId ? "Official ID · 99%" : "Phonetic ADJD · 98%"}
                </span>
              </div>
              <input
                type="text"
                dir="rtl"
                value={formData.arabicName}
                onChange={(e) => handleFieldChange("arabicName", e.target.value)}
                className="w-full text-base px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-arabic font-bold text-gray-900 text-right"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                {isEmiratesId
                  ? "Official Arabic name extracted from Emirates ID."
                  : "Phonetic transliteration according to ADJD court registry rules."}
              </span>
            </div>

            {/* Grid: DOB and Nationality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleFieldChange("dob", e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleFieldChange("nationality", e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
                />
              </div>
            </div>

            {/* Identification Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => handleFieldChange("passportNumber", e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleFieldChange("expiryDate", e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900"
                />
              </div>
            </div>

            {/* Emirates ID Field */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Emirates ID (if applicable)
              </label>
              <input
                type="text"
                placeholder="784-XXXX-XXXXXXX-X"
                value={formData.emiratesId || ""}
                onChange={(e) => handleFieldChange("emiratesId", e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-alabaster px-6 py-4 border-t border-court-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-court-border bg-white hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-court-bronze hover:bg-court-bronze-dark text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Apply to Will</span>
          </button>
        </div>
      </div>
    </div>
  );
}
