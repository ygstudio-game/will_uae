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

  // --- Document Handlers & Autofill Simulation ---
  const handlePassportUpload = (file?: File) => {
    const filename = file ? file.name : "Daniel_Carter_Passport_Bio.pdf";
    setPassportUploaded(true);
    setPassportFileName(filename);

    // Autofill from Passport
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
      fullName: "Passport",
      arabicName: "Passport (Transliterated)",
      dob: "Passport",
      nationality: "Passport",
      passportNumber: "Passport",
      domicileCountry: "Passport",
    }));

    setJustExtractedBanner("Passport parsed successfully! Personal details autofilled below for your review.");
    syncToStore(extractedData as any);
  };

  const handleEmiratesIdUpload = (file?: File) => {
    const filename = file ? file.name : "Daniel_Carter_Emirates_ID.jpg";
    setEmiratesIdUploaded(true);
    setEmiratesIdFileName(filename);
    setIsUaeResident(true);

    // Emirates ID officially provides the Arabic name and Emirates ID number
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
    syncToStore(extractedData as any);
  };

  const handleAddressProofUpload = (file?: File) => {
    const filename = file ? file.name : "DEWA_Abu_Dhabi_Tenancy_Contract.pdf";
    setAddressProofUploaded(true);
    setAddressProofFileName(filename);

    const extractedAddress = address || "Villa 14, Saadiyat Beach Residences, Abu Dhabi, UAE";
    setAddress(extractedAddress);

    setAutofilledFields((prev) => ({
      ...prev,
      address: "Proof of Address",
    }));

    syncToStore({ address: extractedAddress } as any);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section A · Testator Identification & Document Verification
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Upload Documents & Personal Details
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Upload your identification documents first to automatically extract and populate your personal details. You can review and edit every field before proceeding.
        </p>
      </div>

      {/* TOP SECTION: Document Uploads for Autofill */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#A37E44]/30 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#A37E44]/30 text-[#A37E44] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5 text-[#A37E44]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider">
                  Step 1 · Upload Documents to Autofill Details
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A37E44]/15 text-[#A37E44] uppercase tracking-wider">
                  Autofill Active
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload your Passport and Emirates ID to populate fields automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Just Extracted Banner */}
        {justExtractedBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{justExtractedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setJustExtractedBanner(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3 Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Passport Upload */}
          <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
            passportUploaded
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-dashed border-[#A37E44]/50 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B1528] uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#A37E44]" />
                  <span>Passport *</span>
                </span>
                {passportUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Attached
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-semibold uppercase">Required</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Color scan or photo of passport identity page. Extracts name, DOB, nationality & number.
              </p>
              {passportUploaded && (
                <div className="text-[11px] font-mono text-gray-600 truncate mb-3 bg-white p-1.5 rounded border border-gray-200">
                  📄 {passportFileName || "Passport_Document.pdf"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-semibold shadow-sm transition-all text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>{passportUploaded ? "Replace Passport" : "Upload Passport"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePassportUpload(file);
                  }}
                />
              </label>

              {!passportUploaded && (
                <button
                  type="button"
                  onClick={() => handlePassportUpload()}
                  className="text-[11px] text-[#A37E44] hover:text-[#8C6B37] font-semibold underline text-center pt-1"
                >
                  ⚡ Simulate OCR with sample passport
                </button>
              )}
            </div>
          </div>

          {/* 2. Emirates ID Upload */}
          <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
            emiratesIdUploaded
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-dashed border-[#A37E44]/50 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B1528] uppercase flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#A37E44]" />
                  <span>Emirates ID</span>
                </span>
                {emiratesIdUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Attached
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-medium">UAE Residents</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Front and back scan. Extracts official Arabic spelling and 15-digit Emirates ID number.
              </p>
              {emiratesIdUploaded && (
                <div className="text-[11px] font-mono text-gray-600 truncate mb-3 bg-white p-1.5 rounded border border-gray-200">
                  🪪 {emiratesIdFileName || "Emirates_ID_Front_Back.jpg"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-semibold shadow-sm transition-all text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>{emiratesIdUploaded ? "Replace Emirates ID" : "Upload Emirates ID"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleEmiratesIdUpload(file);
                  }}
                />
              </label>

              {!emiratesIdUploaded && (
                <button
                  type="button"
                  onClick={() => handleEmiratesIdUpload()}
                  className="text-[11px] text-[#A37E44] hover:text-[#8C6B37] font-semibold underline text-center pt-1"
                >
                  ⚡ Simulate OCR with sample ID
                </button>
              )}
            </div>
          </div>

          {/* 3. Proof of Address Upload */}
          <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
            addressProofUploaded
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-dashed border-[#A37E44]/50 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B1528] uppercase flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#A37E44]" />
                  <span>Proof of Address *</span>
                </span>
                {addressProofUploaded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Attached
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-semibold uppercase">Required</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Recent utility bill (DEWA / ADDC), bank statement, or Tawtheeq/Ejari tenancy contract.
              </p>
              {addressProofUploaded && (
                <div className="text-[11px] font-mono text-gray-600 truncate mb-3 bg-white p-1.5 rounded border border-gray-200">
                  🏠 {addressProofFileName || "Proof_Of_Address.pdf"}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-1.5">
              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-semibold shadow-sm transition-all text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>{addressProofUploaded ? "Replace Document" : "Upload Document"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAddressProofUpload(file);
                  }}
                />
              </label>

              {!addressProofUploaded && (
                <button
                  type="button"
                  onClick={() => handleAddressProofUpload()}
                  className="text-[11px] text-[#A37E44] hover:text-[#8C6B37] font-semibold underline text-center pt-1"
                >
                  ⚡ Simulate sample proof of address
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: Editable Identity & Legal Fields */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
        <div className="border-b border-[#E5E0D8] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider">
              Step 2 · Verify & Edit Personal Details
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and edit the details populated from your uploaded documents.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md self-start sm:self-auto flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> All fields are fully editable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Full Legal Name (English) *
              </label>
              {autofilledFields.fullName && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Autofilled
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. Daniel Michael Carter"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          {/* Arabic Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Phonetic Arabic Name (الاسم باللغة العربية) *
              </label>
              {autofilledFields.arabicName && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-arabic focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          {/* DOB */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date of Birth * (Must be 21+ years)
              </label>
              {autofilledFields.dob && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          {/* Nationality */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nationality *
              </label>
              {autofilledFields.nationality && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
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
              placeholder="e.g. British, French, Indian"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          {/* Passport Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Passport Number *
              </label>
              {autofilledFields.passportNumber && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
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
              placeholder="e.g. GBR12345678"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          {/* Emirates ID Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Emirates ID Number (For UAE Residents)
              </label>
              {autofilledFields.emiratesId && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
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
              placeholder="784-1985-1234567-1"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
            />
          </div>
        </div>
      </div>

      {/* STEP 3: Address & Domicile */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider border-b border-[#E5E0D8] pb-3">
          Step 3 · Residential Address & Domicile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actual Current Residential Address *
              </label>
              {autofilledFields.address && (
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Autofilled from Document
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Enter your current residential address in the UAE. (A UAE asset address cannot be substituted).
            </p>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={handleBlur}
              placeholder="Villa 14, Saadiyat Beach Residences, Abu Dhabi, United Arab Emirates"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Country of Domicile * (Country of Origin)
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Statutory declaration field for Abu Dhabi Civil Court records.
            </p>
            <input
              type="text"
              required
              value={domicileCountry}
              onChange={(e) => setDomicileCountry(e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. United Kingdom"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Contact Number *
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Including international country code.
            </p>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handleBlur}
              placeholder="+971 50 123 4567"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              For court draft notifications and updates.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
