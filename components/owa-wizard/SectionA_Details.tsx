"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";

export function SectionA_Details() {
  const { application, activeWillIndex, addOrUpdatePerson } = useOwaStore();

  const activeWill = application?.wills.find((w) => w.willIndex === activeWillIndex);
  const testator = activeWill?.testatorPerson;

  const [fullName, setFullName] = useState(testator?.fullName || "");
  const [arabicName, setArabicName] = useState(testator?.arabicName || "");
  const [dob, setDob] = useState(
    testator?.dob ? new Date(testator.dob).toISOString().split("T")[0] : ""
  );
  const [nationality, setNationality] = useState(testator?.nationality || "British");
  const [passportNumber, setPassportNumber] = useState(testator?.passportNumber || "");
  const [emiratesId, setEmiratesId] = useState(testator?.emiratesId || "");
  const [isUaeResident, setIsUaeResident] = useState(testator?.isUaeResident ?? true);
  const [address, setAddress] = useState(testator?.address || "");
  const [domicileCountry, setDomicileCountry] = useState(activeWill?.domicileCountry || "United Kingdom");
  const [email, setEmail] = useState(testator?.email || "");
  const [phone, setPhone] = useState(testator?.phone || "");

  // Upload state indicators
  const [passportUploaded, setPassportUploaded] = useState(true);
  const [addressProofUploaded, setAddressProofUploaded] = useState(true);

  const handleBlur = async () => {
    if (!testator?.id && !fullName) return;

    await addOrUpdatePerson({
      id: testator?.id,
      fullName: fullName.trim(),
      arabicName: arabicName.trim() || null,
      dob: dob || null,
      nationality: nationality.trim() || null,
      passportNumber: passportNumber.trim() || null,
      emiratesId: emiratesId.trim() || null,
      isUaeResident,
      address: address.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Section A · Testator Identification
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Your Personal Details & Proof of Address
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Provide the official details to be recorded in the court preamble and Section TEN attestation clause of your Will.
        </p>
      </div>

      {/* Identity Fields */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider border-b border-[#E5E0D8] pb-3">
          1. Official Identity Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Full Legal Name (English) *
            </label>
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Phonetic Arabic Name (الاسم باللغة العربية)
            </label>
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Date of Birth * (Must be 21+ years)
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              onBlur={handleBlur}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nationality *
            </label>
            <input
              type="text"
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              onBlur={handleBlur}
              placeholder="British"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Passport Number *
            </label>
            <input
              type="text"
              required
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              onBlur={handleBlur}
              placeholder="GB98765432"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Emirates ID Number (If UAE Resident)
            </label>
            <input
              type="text"
              value={emiratesId}
              onChange={(e) => setEmiratesId(e.target.value)}
              onBlur={handleBlur}
              placeholder="784-1985-1234567-1"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono focus:outline-none focus:border-[#A37E44]"
            />
          </div>
        </div>
      </div>

      {/* Address & Domicile */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider border-b border-[#E5E0D8] pb-3">
          2. Residential Address & Country of Domicile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Actual Current Residential Address *
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Enter your current home address in the UAE. (A UAE asset address cannot be substituted).
            </p>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={handleBlur}
              placeholder="Villa 14, Al Reef, Abu Dhabi, United Arab Emirates"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Country of Domicile * (Country of Origin)
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Separate statutory field for Page 8 of the court template.
            </p>
            <input
              type="text"
              required
              value={domicileCountry}
              onChange={(e) => setDomicileCountry(e.target.value)}
              placeholder="United Kingdom"
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
        </div>
      </div>

      {/* Compulsory Uploads for Testators */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider border-b border-[#E5E0D8] pb-3">
          3. Compulsory Document Uploads (Testators Only)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Passport Upload */}
          <div className="p-4 rounded-xl border border-dashed border-[#A37E44]/40 bg-[#FAF7F2]/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B1528] uppercase">Current Passport *</span>
              {passportUploaded && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#047857] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Color scan or high-resolution photo of identity and photo page.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E5E0D8] hover:border-[#A37E44] text-xs font-semibold text-gray-700 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-[#A37E44]" />
              <span>{passportUploaded ? "Replace Passport" : "Upload Passport"}</span>
            </button>
          </div>

          {/* Proof of Address Upload */}
          <div className="p-4 rounded-xl border border-dashed border-[#A37E44]/40 bg-[#FAF7F2]/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B1528] uppercase">Proof of Address *</span>
              {addressProofUploaded && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#047857] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Recent utility bill (DEWA / ADDC), bank statement, or tenancy contract (Tawtheeq / Ejari).
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#E5E0D8] hover:border-[#A37E44] text-xs font-semibold text-gray-700 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-[#A37E44]" />
              <span>{addressProofUploaded ? "Replace Proof of Address" : "Upload Document"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
