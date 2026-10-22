"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  CreditCard,
  CheckCircle2,
  RotateCw,
  Sparkles,
  AlertCircle,
  Shield,
} from "lucide-react";
import { PersonData, UploadedDocumentData } from "@/types/owa";
import { transliterateToName } from "@/lib/transliterate";
import { useOwaStore } from "@/store/useOwaStore";

export const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Son",
  "Daughter",
  "Child",
  "Brother",
  "Sister",
  "Father",
  "Mother",
  "Relative",
  "Trusted Friend",
  "Professional Trustee",
  "Charity",
  "Other",
];

export interface UniversalPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (savedPerson: PersonData) => void;
  personToEdit?: PersonData | null;
  defaultRelationship?: string;
  title?: string;
  subtitle?: string;
}

export function UniversalPersonModal({
  isOpen,
  onClose,
  onSave,
  personToEdit,
  defaultRelationship = "Spouse",
  title,
  subtitle,
}: UniversalPersonModalProps) {
  const { application, activeWillIndex, addOrUpdatePerson } = useOwaStore();
  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const defaultNationality = activeWill?.testatorPerson?.nationality || "British";

  const [formData, setFormData] = useState<Partial<PersonData>>({
    fullName: "",
    arabicName: "",
    relationship: defaultRelationship,
    nationality: defaultNationality,
    dob: "",
    passportNumber: "",
    isUaeResident: true,
    emiratesId: "",
  });

  const [personDocuments, setPersonDocuments] = useState<UploadedDocumentData[]>([]);
  const [uploadedPassportName, setUploadedPassportName] = useState<string | null>(null);
  const [uploadedEmiratesIdName, setUploadedEmiratesIdName] = useState<string | null>(null);
  const [analyzingType, setAnalyzingType] = useState<"PASSPORT" | "EMIRATES_ID" | null>(null);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [autofilledFields, setAutofilledFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personToEdit) {
      setFormData({
        id: personToEdit.id,
        fullName: personToEdit.fullName || "",
        arabicName: personToEdit.arabicName || "",
        relationship: personToEdit.relationship || defaultRelationship,
        nationality: personToEdit.nationality || defaultNationality,
        dob: personToEdit.dob ? new Date(personToEdit.dob).toISOString().split("T")[0] : "",
        passportNumber: personToEdit.passportNumber || "",
        isUaeResident: personToEdit.isUaeResident ?? true,
        emiratesId: personToEdit.emiratesId || "",
      });

      const docs = personToEdit.documents || [];
      setPersonDocuments(docs);
      const passDoc = docs.find((d) => d.documentType === "PASSPORT");
      const eidDoc = docs.find((d) => d.documentType === "EMIRATES_ID");
      setUploadedPassportName(passDoc ? passDoc.fileName : personToEdit.passportNumber ? "Passport attached" : null);
      setUploadedEmiratesIdName(eidDoc ? eidDoc.fileName : personToEdit.emiratesId ? "Emirates ID attached" : null);
    } else {
      setFormData({
        fullName: "",
        arabicName: "",
        relationship: defaultRelationship,
        nationality: defaultNationality,
        dob: "",
        passportNumber: "",
        isUaeResident: true,
        emiratesId: "",
      });
      setPersonDocuments([]);
      setUploadedPassportName(null);
      setUploadedEmiratesIdName(null);
    }

    setOcrSuccessMessage(null);
    setOcrError(null);
    setAutofilledFields({});
  }, [personToEdit, defaultRelationship, defaultNationality, isOpen]);

  if (!isOpen) return null;

  // OCR Document Upload & Extraction
  const handleFileUpload = async (
    file: File | undefined,
    type: "PASSPORT" | "EMIRATES_ID"
  ) => {
    if (!file) return;

    setAnalyzingType(type);
    setOcrError(null);
    setOcrSuccessMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("documentType", type);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to process document (${res.status})`);
      }

      const ocr = json.data;
      const newAutofilled: Record<string, boolean> = { ...autofilledFields };
      const updates: Partial<PersonData> = {};

      if (ocr.fullName) {
        updates.fullName = ocr.fullName;
        newAutofilled.fullName = true;
      }

      if (ocr.arabicName) {
        updates.arabicName = ocr.arabicName;
        newAutofilled.arabicName = true;
      } else if (ocr.fullName) {
        const transliterated = await transliterateToName(ocr.fullName);
        if (transliterated) {
          updates.arabicName = transliterated;
          newAutofilled.arabicName = true;
        }
      }

      if (ocr.dob) {
        updates.dob = ocr.dob;
        newAutofilled.dob = true;
      }

      if (ocr.nationality) {
        updates.nationality = ocr.nationality;
        newAutofilled.nationality = true;
      }

      if (ocr.passportNumber) {
        updates.passportNumber = ocr.passportNumber;
        newAutofilled.passportNumber = true;
        setUploadedPassportName(file.name);
      }

      if (ocr.emiratesId) {
        updates.emiratesId = ocr.emiratesId;
        updates.isUaeResident = true;
        newAutofilled.emiratesId = true;
        setUploadedEmiratesIdName(file.name);
      }

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      setAutofilledFields(newAutofilled);

      if (type === "PASSPORT") {
        setUploadedPassportName(file.name);
      } else {
        setUploadedEmiratesIdName(file.name);
      }

      // Record uploaded document
      const docEntry: UploadedDocumentData = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        personId: personToEdit?.id || "",
        documentType: type,
        fileName: file.name,
        fileUrl: "",
        ocrConfidence: ocr.confidence || 98,
        extractedData: ocr,
      };

      setPersonDocuments((prev) => [
        ...prev.filter((d) => d.documentType !== type),
        docEntry,
      ]);

      const docLabel = type === "PASSPORT" ? "Passport" : "Emirates ID";
      setOcrSuccessMessage(
        `Autofilled from ${docLabel} (${ocr.confidence || 98}% match). Please review details below.`
      );
    } catch (err: any) {
      console.error("UniversalPersonModal OCR upload error:", err);
      setOcrError(err.message || "Could not read document. You can still type details manually.");
    } finally {
      setAnalyzingType(null);
    }
  };

  const handleNameBlur = async () => {
    const name = formData.fullName?.trim();
    if (name && !formData.arabicName?.trim()) {
      const transliterated = await transliterateToName(name);
      if (transliterated) {
        setFormData((prev) => ({ ...prev, arabicName: transliterated }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) return;

    setIsSubmitting(true);
    try {
      let finalArabic = formData.arabicName?.trim() || "";
      if (!finalArabic) {
        const transliterated = await transliterateToName(formData.fullName.trim());
        if (transliterated) finalArabic = transliterated;
      }

      const saved = await addOrUpdatePerson({
        id: personToEdit?.id,
        fullName: formData.fullName.trim(),
        arabicName: finalArabic,
        relationship: formData.relationship || defaultRelationship,
        nationality: formData.nationality?.trim() || defaultNationality,
        dob: formData.dob || null,
        passportNumber: formData.passportNumber?.trim() || null,
        isUaeResident: Boolean(formData.isUaeResident),
        emiratesId: formData.isUaeResident ? formData.emiratesId?.trim() || null : null,
        documents: personDocuments,
      });

      if (saved && onSave) {
        onSave(saved);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save person:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle =
    title ||
    (personToEdit
      ? `Edit ${personToEdit.fullName || "person"}`
      : defaultRelationship.toLowerCase() === "spouse"
      ? "Add your spouse"
      : "Add a person");

  const modalSubtitle =
    subtitle ||
    "Upload a passport or Emirates ID to autofill, or enter official details manually.";

  const isAnalyzingPassport = analyzingType === "PASSPORT";
  const isAnalyzingEmiratesId = analyzingType === "EMIRATES_ID";

  return (
    <div className="fixed inset-0 z-50 bg-[#231a30]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-[#cfc6da] max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#f0ebf5]">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#231a30]">
              {modalTitle}
            </h2>
            <p className="text-xs text-[#6c6478] mt-0.5">{modalSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#6c6478] hover:text-[#231a30] hover:bg-[#efeaf7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCR Document Upload Cards */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#382852] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8A6233]" />
              Quick document autofill
            </span>
            <span className="text-[11px] text-[#6c6478]">Instant OCR extraction</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Passport Tile */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                formData.passportNumber || uploadedPassportName
                  ? "border-[#b9dcc9] bg-[#f3faf6]"
                  : "border-2 border-dashed border-[#cfc6da] bg-[#faf8fc] hover:border-[#5b3fb0]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-[#231a30] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#8a6233]" />
                    <span>Passport photo page</span>
                  </span>
                  {formData.passportNumber || uploadedPassportName ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Read
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#6c6478] bg-[#f1eef5] px-1.5 py-0.5 rounded-full">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6c6478] leading-tight mb-2">
                  Extracts legal name, nationality, DOB, and passport number.
                </p>
                {(uploadedPassportName || formData.passportNumber) && (
                  <div className="text-[10px] font-mono text-[#1f5a3d] truncate mb-2 bg-white px-2 py-1 rounded border border-[#b9dcc9]">
                    📄 {uploadedPassportName || `Passport ${formData.passportNumber}`}
                  </div>
                )}
              </div>

              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all text-center ${
                  isAnalyzingPassport
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : formData.passportNumber || uploadedPassportName
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40]"
                }`}
              >
                {isAnalyzingPassport ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reading passport...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {formData.passportNumber || uploadedPassportName
                        ? "Replace passport"
                        : "Upload passport"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={Boolean(analyzingType)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "PASSPORT");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {/* Emirates ID Tile */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                formData.emiratesId || uploadedEmiratesIdName
                  ? "border-[#b9dcc9] bg-[#f3faf6]"
                  : "border-2 border-dashed border-[#cfc6da] bg-[#faf8fc] hover:border-[#5b3fb0]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-[#231a30] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#8a6233]" />
                    <span>Emirates ID card</span>
                  </span>
                  {formData.emiratesId || uploadedEmiratesIdName ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Read
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#6c6478] bg-[#f1eef5] px-1.5 py-0.5 rounded-full">
                      UAE Residents
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6c6478] leading-tight mb-2">
                  Extracts official Arabic name and 15-digit Emirates ID number.
                </p>
                {(uploadedEmiratesIdName || formData.emiratesId) && (
                  <div className="text-[10px] font-mono text-[#1f5a3d] truncate mb-2 bg-white px-2 py-1 rounded border border-[#b9dcc9]">
                    💳 {uploadedEmiratesIdName || `EID ${formData.emiratesId}`}
                  </div>
                )}
              </div>

              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all text-center ${
                  isAnalyzingEmiratesId
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : formData.emiratesId || uploadedEmiratesIdName
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40]"
                }`}
              >
                {isAnalyzingEmiratesId ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reading Emirates ID...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {formData.emiratesId || uploadedEmiratesIdName
                        ? "Replace Emirates ID"
                        : "Upload Emirates ID"}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={Boolean(analyzingType)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "EMIRATES_ID");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {/* OCR Feedback Message */}
          {ocrSuccessMessage && (
            <div className="p-2.5 rounded-lg bg-[#e8f4ee] border border-[#b9dcc9] text-xs text-[#1f5a3d] flex items-center gap-2 animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-[#1f5a3d] shrink-0" />
              <span>{ocrSuccessMessage}</span>
            </div>
          )}

          {ocrError && (
            <div className="p-2.5 rounded-lg bg-[#fef3f2] border border-[#fecdca] text-xs text-[#b42318] flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-[#b42318] shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f0ebf5]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2.5 text-[11px] font-semibold text-[#8A6233]">
              Official Identity Information
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full name in English */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#231a30]">
                Full name in English *
              </label>
              {autofilledFields.fullName && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  <Sparkles className="w-2.5 h-2.5" /> Autofilled
                </span>
              )}
            </div>
            <input
              type="text"
              required
              autoFocus
              value={formData.fullName || ""}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              onBlur={handleNameBlur}
              placeholder={
                defaultRelationship.toLowerCase() === "spouse"
                  ? "e.g. Sarah Elizabeth Carter"
                  : "e.g. David Alan Whitfield"
              }
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white text-[#231a30]"
            />
          </div>

          {/* Name in Arabic */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#231a30]">
                Name in Arabic <span className="font-normal text-[#6c6478]">(optional)</span>
              </label>
              {autofilledFields.arabicName && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  <Sparkles className="w-2.5 h-2.5" /> Autofilled
                </span>
              )}
            </div>
            <input
              type="text"
              dir="rtl"
              value={formData.arabicName || ""}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
              placeholder="سارة إليزابيث كارتر"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] font-arabic text-[#8A6233] font-medium bg-white"
            />
            <span className="text-[11px] text-[#6c6478] mt-1 block">
              Spelled phonetically by sound. You can edit and verify in Section F.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Relationship to you */}
            <div>
              <label className="block text-xs font-semibold text-[#231a30] mb-1">
                Relationship to you *
              </label>
              <select
                value={formData.relationship || defaultRelationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] bg-white text-[#231a30]"
              >
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            {/* Nationality */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#231a30]">
                  Nationality *
                </label>
                {autofilledFields.nationality && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" /> Autofilled
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={formData.nationality || ""}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. British"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] bg-white text-[#231a30]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#231a30]">
                  Date of birth <span className="font-normal text-[#6c6478]">(optional)</span>
                </label>
                {autofilledFields.dob && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" /> Autofilled
                  </span>
                )}
              </div>
              <input
                type="date"
                value={formData.dob || ""}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] bg-white text-[#231a30]"
              />
            </div>

            {/* Passport number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#231a30]">
                  Passport number <span className="font-normal text-[#6c6478]">(optional)</span>
                </label>
                {autofilledFields.passportNumber && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" /> Autofilled
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.passportNumber || ""}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                placeholder="e.g. 509876543"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] font-mono bg-white text-[#231a30]"
              />
            </div>
          </div>

          {/* UAE Residency Segment */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-[#231a30]">
              Does this person live in the UAE?
            </label>
            <div className="inline-flex p-1 bg-[#efeaf7] rounded-full border border-[#cfc6da]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isUaeResident: true })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  formData.isUaeResident
                    ? "bg-[#382852] text-white shadow-xs"
                    : "text-[#3b3346] hover:text-[#231a30]"
                }`}
              >
                In the UAE
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isUaeResident: false })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  !formData.isUaeResident
                    ? "bg-[#382852] text-white shadow-xs"
                    : "text-[#3b3346] hover:text-[#231a30]"
                }`}
              >
                Outside the UAE
              </button>
            </div>
          </div>

          {/* Emirates ID (if UAE resident) */}
          {formData.isUaeResident && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#231a30]">
                  Emirates ID number <span className="font-normal text-[#6c6478]">(optional)</span>
                </label>
                {autofilledFields.emiratesId && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                    <Sparkles className="w-2.5 h-2.5" /> Autofilled
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.emiratesId || ""}
                onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
                placeholder="784-XXXX-XXXXXXX-X"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#cfc6da] focus:outline-none focus:border-[#5b3fb0] font-mono bg-white text-[#231a30]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ebf5]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-full border border-[#cfc6da] hover:border-[#382852] text-xs font-semibold text-[#231a30] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.fullName?.trim()}
              className="px-5 py-2.5 rounded-full bg-[#c73a30] hover:bg-[#ad3128] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting
                ? "Saving..."
                : personToEdit
                ? "Save changes"
                : "Add to my Will"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
