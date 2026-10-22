"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  CreditCard,
  FileCheck,
  RotateCw,
  X,
  Info,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { transliterateToName } from "@/lib/transliterate";
import { UploadedDocumentData, DocumentType } from "@/types/owa";

export function SectionA_Details() {
  const { application, activeWillIndex, addOrUpdatePerson, updateActiveWill } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const testator = activeWill?.testatorPerson;

  // Form Fields - No hardcoded defaults (start empty unless loaded or autofilled)
  const [fullName, setFullName] = useState(testator?.fullName || "");
  const [arabicName, setArabicName] = useState(testator?.arabicName || "");
  const [dob, setDob] = useState(
    testator?.dob ? new Date(testator.dob).toISOString().split("T")[0] : ""
  );
  const [nationality, setNationality] = useState(testator?.nationality || "");
  const [passportNumber, setPassportNumber] = useState(testator?.passportNumber || "");
  const [emiratesId, setEmiratesId] = useState(testator?.emiratesId || "");
  const [isUaeResident, setIsUaeResident] = useState<boolean | null>(
    testator?.isUaeResident ?? null
  );
  const [address, setAddress] = useState(testator?.address || "");
  const [domicileCountry, setDomicileCountry] = useState(activeWill?.domicileCountry || "");
  const [email, setEmail] = useState(testator?.email || "");
  const [phone, setPhone] = useState(testator?.phone || "");

  // Document Upload States
  const [passportUploaded, setPassportUploaded] = useState(Boolean(testator?.passportNumber));
  const [passportFileName, setPassportFileName] = useState(
    testator?.passportNumber ? "Current_Passport.pdf" : ""
  );

  const [emiratesIdUploaded, setEmiratesIdUploaded] = useState(Boolean(testator?.emiratesId));
  const [emiratesIdFileName, setEmiratesIdFileName] = useState(
    testator?.emiratesId ? "Emirates_ID_Front_Back.jpg" : ""
  );

  const [addressProofUploaded, setAddressProofUploaded] = useState(false);
  const [addressProofFileName, setAddressProofFileName] = useState("");

  // Track autofilled tags for user feedback
  const [autofilledFields, setAutofilledFields] = useState<Record<string, string>>({});
  const [justExtractedBanner, setJustExtractedBanner] = useState<string | null>(null);
  const [analyzingType, setAnalyzingType] = useState<string | null>(null);

  // Helper to persist uploaded documents to testator record
  const saveDocument = async (
    docType: DocumentType,
    fileName: string,
    ocrConfidence?: number,
    extracted?: Record<string, unknown>
  ) => {
    const existingDocs = testator?.documents || [];
    const filtered = existingDocs.filter((d) => d.documentType !== docType);
    const newDoc: UploadedDocumentData = {
      id: `doc-${docType.toLowerCase()}-${Date.now()}`,
      personId: testator?.id || "",
      documentType: docType,
      fileName,
      fileUrl: "",
      fileSizeBytes: 1024 * 50,
      mimeType: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      extractedData: extracted || null,
      ocrConfidence: ocrConfidence || 95,
      isExpired: false,
    };
    const updatedDocs = [...filtered, newDoc];
    if (testator?.id) {
      await addOrUpdatePerson({
        id: testator.id,
        documents: updatedDocs,
      });
    }
    return updatedDocs;
  };

  // Sync state if active testator changes
  useEffect(() => {
    if (testator) {
      if (testator.fullName) setFullName(testator.fullName);
      if (testator.arabicName) setArabicName(testator.arabicName);
      if (testator.dob) setDob(new Date(testator.dob).toISOString().split("T")[0]);
      if (testator.nationality) setNationality(testator.nationality);
      if (testator.passportNumber) {
        setPassportNumber(testator.passportNumber);
        setPassportUploaded(true);
      }
      if (testator.emiratesId) {
        setEmiratesId(testator.emiratesId);
        setEmiratesIdUploaded(true);
      }
      if (testator.address) setAddress(testator.address);
      if (testator.email) setEmail(testator.email);
      if (testator.phone) setPhone(testator.phone);

      // Restore document upload states if present in store
      if (testator.documents && testator.documents.length > 0) {
        const pDoc = testator.documents.find((d) => d.documentType === "PASSPORT");
        if (pDoc) {
          setPassportUploaded(true);
          setPassportFileName(pDoc.fileName);
        }
        const eDoc = testator.documents.find((d) => d.documentType === "EMIRATES_ID");
        if (eDoc) {
          setEmiratesIdUploaded(true);
          setEmiratesIdFileName(eDoc.fileName);
        }
        const aDoc = testator.documents.find((d) => d.documentType === "PROOF_OF_ADDRESS");
        if (aDoc) {
          setAddressProofUploaded(true);
          setAddressProofFileName(aDoc.fileName);
        }
      }
    }
    if (activeWill?.domicileCountry) {
      setDomicileCountry(activeWill.domicileCountry);
    }
  }, [testator, activeWill]);

  // Save changes to store
  const syncToStore = async (
    overrides?: Partial<typeof testator> & { domicileCountry?: string },
    willCountryOverride?: string
  ) => {
    if (!testator?.id && !fullName && !overrides?.fullName) return;

    await addOrUpdatePerson({
      id: testator?.id,
      fullName: (overrides?.fullName ?? fullName).trim(),
      arabicName: (overrides?.arabicName ?? arabicName).trim() || null,
      dob: overrides?.dob ?? (dob || null),
      nationality: (overrides?.nationality ?? nationality).trim() || null,
      passportNumber: (overrides?.passportNumber ?? passportNumber).trim() || null,
      emiratesId: (overrides?.emiratesId ?? emiratesId).trim() || null,
      isUaeResident: overrides?.isUaeResident ?? (isUaeResident ?? false),
      address: (overrides?.address ?? address).trim() || null,
      email: (overrides?.email ?? email).trim() || null,
      phone: (overrides?.phone ?? phone).trim() || null,
    });

    const targetDomicile = (willCountryOverride ?? overrides?.domicileCountry ?? domicileCountry).trim();
    if (targetDomicile) {
      updateActiveWill({ domicileCountry: targetDomicile });
    }
  };

  const handleBlur = () => {
    syncToStore();
  };

  const handleFullNameBlur = async () => {
    syncToStore();
    if (fullName.trim() && !arabicName.trim()) {
      const transliterated = await transliterateToName(fullName);
      if (transliterated) {
        setArabicName(transliterated);
        setAutofilledFields((prev) => ({
          ...prev,
          arabicName: "Auto-Transliterated",
        }));
        syncToStore({ arabicName: transliterated });
      }
    }
  };

  // --- Document Handlers & Gemini Vision OCR Integration ---
  const handlePassportUpload = async (file?: File) => {
    if (!file) return;

    setAnalyzingType("Passport");
    setPassportFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "PASSPORT");

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to process passport (${res.status})`);
      }

      const ocr = json.data;
      setPassportUploaded(true);
      await saveDocument("PASSPORT", file.name, ocr.confidence, ocr);
      const extractedData: any = {};
      if (ocr.fullName) {
        setFullName(ocr.fullName);
        extractedData.fullName = ocr.fullName;
      }
      if (ocr.arabicName) {
        setArabicName(ocr.arabicName);
        extractedData.arabicName = ocr.arabicName;
      }
      if (ocr.dob) {
        setDob(ocr.dob);
        extractedData.dob = ocr.dob;
      }
      if (ocr.nationality) {
        setNationality(ocr.nationality);
        extractedData.nationality = ocr.nationality;
        if (!domicileCountry) {
          setDomicileCountry(ocr.nationality);
          extractedData.domicileCountry = ocr.nationality;
          updateActiveWill({ domicileCountry: ocr.nationality });
        }
      }
      if (ocr.passportNumber) {
        setPassportNumber(ocr.passportNumber);
        extractedData.passportNumber = ocr.passportNumber;
      }

      setAutofilledFields((prev) => ({
        ...prev,
        fullName: `Passport · ${ocr.confidence}%`,
        arabicName: "Gemini Phonetic Transliteration",
        dob: "Passport",
        nationality: "Passport",
        passportNumber: "Passport",
      }));

      const flagsMsg = ocr.flags?.length ? ` (Flags: ${ocr.flags.join(", ")})` : "";
      setJustExtractedBanner(`Passport analyzed by Gemini Vision (${ocr.confidence}% confidence)! Details autofilled below${flagsMsg}.`);
      syncToStore(extractedData);
    } catch (err: any) {
      console.error("Passport OCR error:", err);
      setJustExtractedBanner(`OCR Note: ${err.message || "Could not auto-read file"}. You may fill details manually.`);
      setPassportUploaded(true);
      await saveDocument("PASSPORT", file.name, 75);
    } finally {
      setAnalyzingType(null);
    }
  };

  const handleEmiratesIdUpload = async (file?: File) => {
    if (!file) return;

    setAnalyzingType("Emirates ID");
    setEmiratesIdFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "EMIRATES_ID");

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to process Emirates ID (${res.status})`);
      }

      const ocr = json.data;
      setEmiratesIdUploaded(true);
      setIsUaeResident(true);
      await saveDocument("EMIRATES_ID", file.name, ocr.confidence, ocr);

      const extractedData: any = { isUaeResident: true };
      if (ocr.arabicName) {
        setArabicName(ocr.arabicName);
        extractedData.arabicName = ocr.arabicName;
      }
      if (ocr.emiratesId) {
        setEmiratesId(ocr.emiratesId);
        extractedData.emiratesId = ocr.emiratesId;
      }
      if (ocr.fullName && !fullName) {
        setFullName(ocr.fullName);
        extractedData.fullName = ocr.fullName;
      }

      setAutofilledFields((prev) => ({
        ...prev,
        arabicName: `Emirates ID Official · ${ocr.confidence}%`,
        emiratesId: "Emirates ID",
      }));

      setJustExtractedBanner(`Emirates ID analyzed by Gemini Vision (${ocr.confidence}% confidence)! Official Arabic name & ID populated.`);
      syncToStore(extractedData);
    } catch (err: any) {
      console.error("Emirates ID OCR error:", err);
      setJustExtractedBanner(`OCR Note: ${err.message || "Could not auto-read file"}. You may fill details manually.`);
      setEmiratesIdUploaded(true);
      await saveDocument("EMIRATES_ID", file.name, 75);
    } finally {
      setAnalyzingType(null);
    }
  };

  const handleAddressProofUpload = async (file?: File) => {
    if (!file) return;

    setAnalyzingType("Proof of Address");
    setAddressProofFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "UTILITY_BILL");

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to process Proof of Address (${res.status})`);
      }

      const ocr = json.data;
      setAddressProofUploaded(true);
      await saveDocument("PROOF_OF_ADDRESS", file.name, ocr.confidence, ocr);
      setJustExtractedBanner(`Proof of address document attached! Please enter your residential address manually below.`);
    } catch (err: any) {
      console.error("Proof of Address OCR error:", err);
      setAddressProofUploaded(true);
      await saveDocument("PROOF_OF_ADDRESS", file.name, 75);
    } finally {
      setAnalyzingType(null);
    }
  };

  return (
    <div className="owa-cols">
      <div className="space-y-6">

      {/* Just Extracted Banner */}
      {justExtractedBanner && (
        <div className="p-4 rounded-xl bg-[#e8f4ee] border border-[#2f7a55]/20 text-xs sm:text-sm text-[#1f5a3d] flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#2f7a55] flex-shrink-0" />
            <span className="font-medium">{justExtractedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setJustExtractedBanner(null)}
            className="text-[#1f5a3d] hover:opacity-75 transition-opacity"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Document Upload Tiles */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#e4dfe9] shadow-xs space-y-5">
        <div className="border-b border-[#f0ebf5] pb-3.5">
          <h2 className="text-[19px] font-serif font-bold text-[#231a30] leading-snug">
            1. Upload documents
          </h2>
          <p className="text-[14px] text-[#6c6478] mt-1">
            PDF, JPG or PNG, up to 10 MB each.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Passport */}
          <div
            className={`p-5 rounded-xl border flex flex-col justify-between transition-all min-h-[165px] ${
              passportUploaded
                ? "border-[#b9dcc9] bg-[#f3faf6]"
                : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#382852]/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[15px] font-bold text-[#231a30] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8a6233]" />
                  <span>Passport</span>
                </span>
                {passportUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Read
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-[#6c6478] bg-[#f1eef5] px-2.5 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#6c6478] leading-relaxed mb-3">
                {passportUploaded
                  ? "Read: name, date of birth, nationality, passport number."
                  : "The photo page. Fills the name, date of birth, nationality and passport number."}
              </p>
              {passportUploaded && (
                <div className="text-[12px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded-md border border-[#e4dfe9]">
                  📄 {passportFileName || "Passport_Identity.pdf"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all text-center min-h-[42px] ${
                  analyzingType === "Passport"
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : passportUploaded
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40] shadow-sm"
                }`}
              >
                {analyzingType === "Passport" ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reading passport...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{passportUploaded ? "Replace document" : "Upload document"}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={Boolean(analyzingType)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePassportUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {/* Tile 2: Emirates ID */}
          <div
            className={`p-5 rounded-xl border flex flex-col justify-between transition-all min-h-[165px] ${
              emiratesIdUploaded
                ? "border-[#b9dcc9] bg-[#f3faf6]"
                : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#382852]/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[15px] font-bold text-[#231a30] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#8a6233]" />
                  <span>Emirates ID</span>
                </span>
                {emiratesIdUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Read
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-[#6c6478] bg-[#f1eef5] px-2.5 py-0.5 rounded-full">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#6c6478] leading-relaxed mb-3">
                {emiratesIdUploaded
                  ? "Read: Emirates ID number and official Arabic name."
                  : "Front and back, if you live in the UAE."}
              </p>
              {emiratesIdUploaded && (
                <div className="text-[12px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded-md border border-[#e4dfe9]">
                  🪪 {emiratesIdFileName || "Emirates_ID_Front_Back.jpg"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all text-center min-h-[42px] ${
                  analyzingType === "Emirates ID"
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : emiratesIdUploaded
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40] shadow-sm"
                }`}
              >
                {analyzingType === "Emirates ID" ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reading ID...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{emiratesIdUploaded ? "Replace document" : "Upload document"}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={Boolean(analyzingType)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleEmiratesIdUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {/* Tile 3: Proof of Address */}
          <div
            className={`p-5 rounded-xl border flex flex-col justify-between transition-all min-h-[165px] ${
              addressProofUploaded
                ? "border-[#b9dcc9] bg-[#f3faf6]"
                : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#382852]/60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[15px] font-bold text-[#231a30] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#8a6233]" />
                  <span>Proof of address</span>
                </span>
                {addressProofUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-[#6c6478] bg-[#f1eef5] px-2.5 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#6c6478] leading-relaxed mb-3">
                {addressProofUploaded
                  ? "Matched to the residential address below."
                  : "A recent utility bill, bank statement or tenancy contract (Ejari or Tawtheeq)."}
              </p>
              {addressProofUploaded && (
                <div className="text-[12px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded-md border border-[#e4dfe9]">
                  🏠 {addressProofFileName || "Proof_Of_Address.pdf"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all text-center min-h-[42px] ${
                  analyzingType === "Proof of Address"
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : addressProofUploaded
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40] shadow-sm"
                }`}
              >
                {analyzingType === "Proof of Address" ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Attaching...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{addressProofUploaded ? "Replace document" : "Upload document"}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={Boolean(analyzingType)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAddressProofUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Personal Details */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#e4dfe9] shadow-xs space-y-5">
        <div className="border-b border-[#f0ebf5] pb-3.5 flex items-center justify-between gap-2">
          <h2 className="text-[19px] font-serif font-bold text-[#231a30] leading-snug">
            2. Personal details
          </h2>
          <span className="text-[13.5px] text-[#6c6478]">
            Every field can be edited.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name in English */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-fullName" className="block text-[14px] font-semibold text-[#231a30]">
                Full name in English *
              </label>
              {autofilledFields.fullName && (
                <span className="text-[11px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-2 py-0.5 rounded-md">
                  {autofilledFields.fullName}
                </span>
              )}
            </div>
            <input
              id="field-fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleFullNameBlur}
              placeholder="e.g. Daniel Michael Carter"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
          </div>

          {/* Full Name in Arabic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-arabicName" className="block text-[14px] font-semibold text-[#231a30]">
                Full name in Arabic <span className="font-normal text-[#6c6478]">(optional)</span>
              </label>
              {autofilledFields.arabicName && (
                <span className="text-[11px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-2 py-0.5 rounded-md">
                  {autofilledFields.arabicName}
                </span>
              )}
            </div>
            <input
              id="field-arabicName"
              type="text"
              dir="rtl"
              value={arabicName}
              onChange={(e) => setArabicName(e.target.value)}
              onBlur={handleBlur}
              placeholder="دانيال مايكل كارتر"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] font-arabic text-[#8A6233] font-medium focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              Spelled by sound, not translated. You approve it in Section F.
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-dob" className="block text-[14px] font-semibold text-[#231a30]">
                Date of birth *
              </label>
              {autofilledFields.dob && (
                <span className="text-[11px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-2 py-0.5 rounded-md">
                  Autofilled
                </span>
              )}
            </div>
            <input
              id="field-dob"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              onBlur={handleBlur}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              You must be over 21 to make an ADJD civil Will.
            </p>
          </div>

          {/* Nationality */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-nationality" className="block text-[14px] font-semibold text-[#231a30]">
                Nationality *
              </label>
              {autofilledFields.nationality && (
                <span className="text-[11px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-2 py-0.5 rounded-md">
                  Autofilled
                </span>
              )}
            </div>
            <input
              id="field-nationality"
              type="text"
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. British"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
          </div>

          {/* Passport Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-passportNumber" className="block text-[14px] font-semibold text-[#231a30]">
                Passport number *
              </label>
              {autofilledFields.passportNumber && (
                <span className="text-[11px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-2 py-0.5 rounded-md">
                  Autofilled
                </span>
              )}
            </div>
            <input
              id="field-passportNumber"
              type="text"
              required
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              onBlur={handleBlur}
              placeholder="GBR12345678"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] font-mono text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
          </div>

          {/* Emirates ID Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="field-emiratesId" className="block text-[14px] font-semibold text-[#231a30]">
                Emirates ID number <span className="font-normal text-[#6c6478]">(optional)</span>
              </label>
              {autofilledFields.emiratesId && (
                <span className="text-[11px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-2 py-0.5 rounded-md">
                  Autofilled
                </span>
              )}
            </div>
            <input
              id="field-emiratesId"
              type="text"
              value={emiratesId}
              onChange={(e) => {
                setEmiratesId(e.target.value);
                if (e.target.value.trim().length > 0) setIsUaeResident(true);
              }}
              onBlur={handleBlur}
              placeholder="784-1982-1234567-1"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] font-mono text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              If you live in the UAE.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Address, Domicile and Contact */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#e4dfe9] shadow-xs space-y-5">
        <div className="border-b border-[#f0ebf5] pb-3.5">
          <h2 className="text-[19px] font-serif font-bold text-[#231a30] leading-snug">
            3. Address, domicile and contact
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home Address in UAE */}
          <div className="sm:col-span-2">
            <label htmlFor="field-address" className="block text-[14px] font-semibold text-[#231a30] mb-1.5">
              Current home address in the UAE *
            </label>
            <input
              id="field-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. Villa 14, Saadiyat Beach Residences, Abu Dhabi"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              Where you live now. The address of a property you own does not count.
            </p>
          </div>

          {/* Country of Domicile */}
          <div>
            <label htmlFor="field-domicileCountry" className="block text-[14px] font-semibold text-[#231a30] mb-1.5">
              Country of domicile *
            </label>
            <input
              id="field-domicileCountry"
              type="text"
              required
              value={domicileCountry}
              onChange={(e) => {
                const val = e.target.value;
                setDomicileCountry(val);
                updateActiveWill({ domicileCountry: val.trim() });
              }}
              onBlur={() => {
                const val = domicileCountry.trim();
                updateActiveWill({ domicileCountry: val });
                syncToStore(undefined, val);
              }}
              placeholder="e.g. United Kingdom"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              Section Ten of your Will records it.
            </p>
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="field-phone" className="block text-[14px] font-semibold text-[#231a30] mb-1.5">
              Mobile number *
            </label>
            <input
              id="field-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handleBlur}
              placeholder="+971 50 000 0000"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              Include country code, for example +971 50 000 0000.
            </p>
          </div>

          {/* Email Address */}
          <div className="sm:col-span-2">
            <label htmlFor="field-email" className="block text-[14px] font-semibold text-[#231a30] mb-1.5">
              Email address *
            </label>
            <input
              id="field-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder="name@example.com"
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-[15px] text-[#231a30] focus:outline-none focus:border-[#382852] focus:ring-2 focus:ring-[#d7b48b]/30 bg-white transition-all"
            />
            <p className="text-[13px] text-[#6c6478] mt-1.5">
              We send updates on your Will here.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Right Column: Aside Notes */}
      <div className="aside-notes space-y-4">
        <div className="p-5 rounded-xl bg-[#efeaf7] border border-[#e4dfe9] flex items-start gap-3.5 text-[#231a30]">
          <Shield className="w-5 h-5 text-[#5b3fb0] shrink-0 mt-0.5" />
          <div>
            <strong className="block text-[14px] font-bold text-[#231a30] mb-1">
              Checked by a person
            </strong>
            <p className="text-[13px] text-[#6c6478] leading-relaxed">
              AI can suggest details and flag issues. OWA manually verifies every application before filing with ADJD.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#e4dfe9] rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-[17px] font-serif font-bold text-[#231a30] mb-1.5">Have these ready</h3>
            <p className="text-[13.5px] text-[#6c6478] leading-relaxed">
              Your passport, Emirates ID if applicable, and an address document such as a utility bill or tenancy contract.
            </p>
          </div>
          <hr className="border-t border-[#f0ebf5]" />
          <div>
            <h3 className="text-[17px] font-serif font-bold text-[#231a30] mb-1.5">Living outside the UAE?</h3>
            <p className="text-[13.5px] text-[#6c6478] leading-relaxed">
              Enter your actual current residential address. OWA will review your documents and court template details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
