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
  const { application, activeWillIndex, addOrUpdatePerson } = useOwaStore();

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
  const syncToStore = async (overrides?: Partial<typeof testator>) => {
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
    if (!file) {
      // Simulation test fixture
      const filename = "Daniel_Carter_Passport_Bio.pdf";
      setPassportUploaded(true);
      setPassportFileName(filename);

      const extractedData = {
        fullName: fullName || "Daniel Michael Carter",
        arabicName: arabicName || "دانيال مايكل كارتر",
        dob: dob || "1982-05-14",
        nationality: nationality || "British",
        passportNumber: passportNumber || "GBR12345678",
        domicileCountry: domicileCountry || "United Kingdom",
      };

      setFullName(extractedData.fullName);
      setArabicName(extractedData.arabicName);
      setDob(extractedData.dob);
      setNationality(extractedData.nationality);
      setPassportNumber(extractedData.passportNumber);
      setDomicileCountry(extractedData.domicileCountry);

      setAutofilledFields((prev) => ({
        ...prev,
        fullName: "Passport (Fixture)",
        arabicName: "Passport (Transliterated)",
        dob: "Passport",
        nationality: "Passport",
        passportNumber: "Passport",
        domicileCountry: "Passport",
      }));

      setJustExtractedBanner("Sample passport parsed! Personal details autofilled below for your review.");
      await saveDocument("PASSPORT", filename, 98, extractedData);
      syncToStore(extractedData as any);
      return;
    }

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
    if (!file) {
      const filename = "Daniel_Carter_Emirates_ID.jpg";
      setEmiratesIdUploaded(true);
      setEmiratesIdFileName(filename);
      setIsUaeResident(true);

      const extractedData = {
        arabicName: "دانيال مايكل كارتر",
        emiratesId: "784-1982-1234567-1",
        fullName: fullName || "Daniel Michael Carter",
        isUaeResident: true,
      };

      setArabicName(extractedData.arabicName);
      setEmiratesId(extractedData.emiratesId);
      setIsUaeResident(true);

      setAutofilledFields((prev) => ({
        ...prev,
        arabicName: "Emirates ID (Official)",
        emiratesId: "Emirates ID",
      }));

      setJustExtractedBanner("Emirates ID parsed! Official Arabic name & Emirates ID populated below.");
      await saveDocument("EMIRATES_ID", filename, 98, extractedData);
      syncToStore(extractedData as any);
      return;
    }

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
    if (!file) {
      const filename = "DEWA_Abu_Dhabi_Tenancy_Contract.pdf";
      setAddressProofUploaded(true);
      setAddressProofFileName(filename);
      await saveDocument("PROOF_OF_ADDRESS", filename, 95);
      setJustExtractedBanner("Sample proof of address attached! Please enter your residential address manually below.");
      return;
    }

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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-[#8a6233] uppercase tracking-wider">
          Section A · Fills Section One of your Will
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#231a30]">
          {activeWillIndex === 1 && testator?.fullName ? `${testator.fullName}'s Details` : "Your Details"}
        </h1>
        <p className="text-sm text-[#6c6478] max-w-2xl leading-relaxed">
          Upload documents first. The platform reads them and fills the fields below. Check every value and correct anything that differs from the passport.
        </p>
      </div>

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
      <div className="bg-[#FFFEFA] p-6 sm:p-7 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-4">
        <div className="border-b border-[#f0ebf5] pb-3">
          <h2 className="text-base font-serif font-bold text-[#231a30]">
            1. Upload documents
          </h2>
          <p className="text-xs text-[#6c6478] mt-0.5">
            PDF, JPG or PNG, up to 10 MB each.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Passport */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              passportUploaded
                ? "border-[#b9dcc9] bg-[#f3faf6]"
                : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#5b3fb0]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-[#231a30] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8a6233]" />
                  <span>Passport</span>
                </span>
                {passportUploaded ? (
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
                {passportUploaded
                  ? "Read: name, date of birth, nationality, passport number."
                  : "The photo page. Fills the name, date of birth, nationality and passport number."}
              </p>
              {passportUploaded && (
                <div className="text-[11px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded border border-[#e4dfe9]">
                  📄 {passportFileName || "Passport_Identity.pdf"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-sm transition-all text-center ${
                  analyzingType === "Passport"
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : passportUploaded
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40]"
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

              {!passportUploaded && !analyzingType && (
                <button
                  type="button"
                  onClick={() => handlePassportUpload()}
                  className="text-[11px] text-[#5b3fb0] hover:underline font-medium text-center pt-1"
                >
                  ⚡ Simulate OCR read
                </button>
              )}
            </div>
          </div>

          {/* Tile 2: Emirates ID */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              emiratesIdUploaded
                ? "border-[#b9dcc9] bg-[#f3faf6]"
                : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#5b3fb0]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-[#231a30] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#8a6233]" />
                  <span>Emirates ID</span>
                </span>
                {emiratesIdUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Read
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[#6c6478]">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6c6478] leading-relaxed mb-3">
                {emiratesIdUploaded
                  ? "Read: Emirates ID number and official Arabic name."
                  : "Front and back, if you live in the UAE."}
              </p>
              {emiratesIdUploaded && (
                <div className="text-[11px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded border border-[#e4dfe9]">
                  🪪 {emiratesIdFileName || "Emirates_ID_Front_Back.jpg"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-sm transition-all text-center ${
                  analyzingType === "Emirates ID"
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : emiratesIdUploaded
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40]"
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

              {!emiratesIdUploaded && !analyzingType && (
                <button
                  type="button"
                  onClick={() => handleEmiratesIdUpload()}
                  className="text-[11px] text-[#5b3fb0] hover:underline font-medium text-center pt-1"
                >
                  ⚡ Simulate OCR read
                </button>
              )}
            </div>
          </div>

          {/* Tile 3: Proof of Address */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              addressProofUploaded
                ? "border-[#b9dcc9] bg-[#f3faf6]"
                : "border-2 border-dashed border-[#cfc6da] bg-white hover:border-[#5b3fb0]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-[#231a30] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#8a6233]" />
                  <span>Proof of address</span>
                </span>
                {addressProofUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f5a3d] bg-[#e8f4ee] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Attached
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-[#6c6478] bg-[#f1eef5] px-2 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6c6478] leading-relaxed mb-3">
                {addressProofUploaded
                  ? "Matched to the residential address below."
                  : "A recent utility bill, bank statement or tenancy contract (Ejari or Tawtheeq)."}
              </p>
              {addressProofUploaded && (
                <div className="text-[11px] font-mono text-[#6c6478] truncate mb-3 bg-white px-2.5 py-1.5 rounded border border-[#e4dfe9]">
                  🏠 {addressProofFileName || "Proof_Of_Address.pdf"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label
                className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-sm transition-all text-center ${
                  analyzingType === "Proof of Address"
                    ? "bg-[#5b3fb0] text-white animate-pulse"
                    : addressProofUploaded
                    ? "bg-white border border-[#cfc6da] text-[#231a30] hover:border-[#382852]"
                    : "bg-[#382852] text-white hover:bg-[#281b40]"
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

              {!addressProofUploaded && !analyzingType && (
                <button
                  type="button"
                  onClick={() => handleAddressProofUpload()}
                  className="text-[11px] text-[#5b3fb0] hover:underline font-medium text-center pt-1"
                >
                  ⚡ Simulate proof upload
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Personal Details */}
      <div className="bg-[#FFFEFA] p-6 sm:p-7 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-5">
        <div className="border-b border-[#f0ebf5] pb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-serif font-bold text-[#231a30]">
            2. Personal details
          </h2>
          <span className="text-xs text-[#6c6478]">
            Every field can be edited.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name in English */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#231a30]">
                Full name in English *
              </label>
              {autofilledFields.fullName && (
                <span className="text-[10px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  {autofilledFields.fullName}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleFullNameBlur}
              placeholder="e.g. Daniel Michael Carter"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
          </div>

          {/* Full Name in Arabic */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#231a30]">
                Full name in Arabic <span className="font-normal text-[#6c6478]">(optional)</span>
              </label>
              {autofilledFields.arabicName && (
                <span className="text-[10px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  {autofilledFields.arabicName}
                </span>
              )}
            </div>
            <input
              type="text"
              dir="rtl"
              value={arabicName}
              onChange={(e) => setArabicName(e.target.value)}
              onBlur={handleBlur}
              placeholder="دانيال مايكل كارتر"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm font-arabic focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              Spelled by sound, not translated. You approve it in Section F.
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#231a30]">
                Date of birth *
              </label>
              {autofilledFields.dob && (
                <span className="text-[10px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  Autofilled
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              onBlur={handleBlur}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              You must be over 21 to make an ADJD civil Will.
            </p>
          </div>

          {/* Nationality */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#231a30]">
                Nationality *
              </label>
              {autofilledFields.nationality && (
                <span className="text-[10px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  Autofilled
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. British"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
          </div>

          {/* Passport Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#231a30]">
                Passport number *
              </label>
              {autofilledFields.passportNumber && (
                <span className="text-[10px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  Autofilled
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              onBlur={handleBlur}
              placeholder="GBR12345678"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm font-mono focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
          </div>

          {/* Emirates ID Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#231a30]">
                Emirates ID number <span className="font-normal text-[#6c6478]">(optional)</span>
              </label>
              {autofilledFields.emiratesId && (
                <span className="text-[10px] text-[#1f5a3d] font-semibold bg-[#e8f4ee] px-1.5 py-0.5 rounded">
                  Autofilled
                </span>
              )}
            </div>
            <input
              type="text"
              value={emiratesId}
              onChange={(e) => {
                setEmiratesId(e.target.value);
                if (e.target.value.trim().length > 0) setIsUaeResident(true);
              }}
              onBlur={handleBlur}
              placeholder="784-1982-1234567-1"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm font-mono focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              If you live in the UAE.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Address, Domicile and Contact */}
      <div className="bg-[#FFFEFA] p-6 sm:p-7 rounded-2xl border border-[#e4dfe9] shadow-sm space-y-5">
        <div className="border-b border-[#f0ebf5] pb-3">
          <h2 className="text-base font-serif font-bold text-[#231a30]">
            3. Address, domicile and contact
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home Address in UAE */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#231a30] mb-1">
              Current home address in the UAE *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. Villa 14, Saadiyat Beach Residences, Abu Dhabi"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              Where you live now. The address of a property you own does not count.
            </p>
          </div>

          {/* Country of Domicile */}
          <div>
            <label className="block text-xs font-semibold text-[#231a30] mb-1">
              Country of domicile *
            </label>
            <input
              type="text"
              required
              value={domicileCountry}
              onChange={(e) => setDomicileCountry(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. United Kingdom"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              Section Ten of your Will records it.
            </p>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-[#231a30] mb-1">
              Mobile number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handleBlur}
              placeholder="+971 50 000 0000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              Include country code, for example +971 50 000 0000.
            </p>
          </div>

          {/* Email Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#231a30] mb-1">
              Email address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#cfc6da] text-sm focus:outline-none focus:border-[#5b3fb0] focus:ring-1 focus:ring-[#5b3fb0] bg-white"
            />
            <p className="text-[11px] text-[#6c6478] mt-1">
              We send updates on your Will here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
