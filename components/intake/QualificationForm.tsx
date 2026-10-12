"use client";

import React, { useState } from "react";
import { User, Users, CheckCircle2, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { PackageType } from "@/types/owa";

export interface QualificationData {
  fullName: string;
  packageType: PackageType;
  testatorAge21: boolean;
  nonUaeNational: boolean;
  uaeAssets: boolean;
  married: boolean;
  childrenUnder18: boolean;
  // Partner answers
  partnerAge21?: boolean;
  partnerNonUae?: boolean;
  partnerAssets?: boolean;
  partnerMarried?: boolean;
  partnerChildrenUnder18?: boolean;
}

interface QualificationFormProps {
  onComplete: (data: QualificationData) => void;
  initialData?: Partial<QualificationData>;
}

export function QualificationForm({ onComplete, initialData }: QualificationFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [packageType, setPackageType] = useState<PackageType | null>(initialData?.packageType || null);

  // Primary Testator Answers - start unselected (null) so user must choose manually
  const [testatorAge21, setTestatorAge21] = useState<boolean | null>(initialData?.testatorAge21 ?? null);
  const [nonUaeNational, setNonUaeNational] = useState<boolean | null>(initialData?.nonUaeNational ?? null);
  const [uaeAssets, setUaeAssets] = useState<boolean | null>(initialData?.uaeAssets ?? null);
  const [married, setMarried] = useState<boolean | null>(initialData?.married ?? null);
  const [childrenUnder18, setChildrenUnder18] = useState<boolean | null>(initialData?.childrenUnder18 ?? null);

  // Partner Answers (if Couples) - start unselected
  const [partnerAge21, setPartnerAge21] = useState<boolean | null>(initialData?.partnerAge21 ?? null);
  const [partnerNonUae, setPartnerNonUae] = useState<boolean | null>(initialData?.partnerNonUae ?? null);
  const [partnerAssets, setPartnerAssets] = useState<boolean | null>(initialData?.partnerAssets ?? null);
  const [partnerMarried, setPartnerMarried] = useState<boolean | null>(initialData?.partnerMarried ?? null);
  const [partnerChildrenUnder18, setPartnerChildrenUnder18] = useState<boolean | null>(initialData?.partnerChildrenUnder18 ?? null);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please provide your full legal name.");
      return;
    }

    if (!packageType) {
      setError("Please select who you would like to prepare a Will for (Myself or My Partner & Me).");
      return;
    }

    if (
      testatorAge21 === null ||
      nonUaeNational === null ||
      uaeAssets === null ||
      married === null ||
      childrenUnder18 === null
    ) {
      setError("Please answer all eligibility questions before proceeding.");
      return;
    }

    if (!testatorAge21) {
      setError("The platform is restricted to individuals aged 21 and above per UAE court rules.");
      return;
    }

    if (packageType === "COUPLES") {
      if (
        partnerAge21 === null ||
        partnerNonUae === null ||
        partnerAssets === null ||
        partnerChildrenUnder18 === null
      ) {
        setError("Please answer all questions regarding your partner.");
        return;
      }

      if (!partnerAge21) {
        setError("Both partners must be aged 21 and above.");
        return;
      }
    }

    setError(null);
    onComplete({
      fullName: fullName.trim(),
      packageType,
      testatorAge21: Boolean(testatorAge21),
      nonUaeNational: Boolean(nonUaeNational),
      uaeAssets: Boolean(uaeAssets),
      married: Boolean(married),
      childrenUnder18: Boolean(childrenUnder18),
      ...(packageType === "COUPLES" && {
        partnerAge21: Boolean(partnerAge21),
        partnerNonUae: Boolean(partnerNonUae),
        partnerAssets: Boolean(partnerAssets),
        partnerMarried: Boolean(partnerMarried),
        partnerChildrenUnder18: Boolean(partnerChildrenUnder18),
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#E5E0D8] shadow-sm max-w-2xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#A37E44] uppercase tracking-wider font-mono">
          Stage 1 · Eligibility & Package Intake
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528] mt-1">
          Start Your UAE Will Application
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          Please answer a few short questions before proceeding to order summary and payment.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Full Legal Name */}
      <div>
        <label className="block text-xs font-bold text-[#0B1528] uppercase tracking-wider mb-1.5">
          1. Your Full Legal Name
        </label>
        <p className="text-xs text-gray-500 mb-2">
          As written on your current passport.
        </p>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. John Michael Smith"
          className="w-full px-4 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
        />
      </div>

      {/* 2. Package Selector */}
      <div>
        <label className="block text-xs font-bold text-[#0B1528] uppercase tracking-wider mb-2">
          2. Who would you like to prepare a Will for?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPackageType("INDIVIDUAL")}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              packageType === "INDIVIDUAL"
                ? "border-[#A37E44] bg-[#FAF7F2] ring-1 ring-[#A37E44]"
                : "border-[#E5E0D8] hover:border-gray-300 bg-white"
            }`}
          >
            <User className={`w-5 h-5 mt-0.5 ${packageType === "INDIVIDUAL" ? "text-[#A37E44]" : "text-gray-400"}`} />
            <div>
              <div className="text-sm font-bold text-[#0B1528]">Myself</div>
              <div className="text-xs text-gray-500 mt-0.5">Individual Will · 1 Will document</div>
              <div className="text-xs font-semibold text-[#A37E44] mt-2">AED 999 now + AED 950 court fee</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPackageType("COUPLES")}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              packageType === "COUPLES"
                ? "border-[#A37E44] bg-[#FAF7F2] ring-1 ring-[#A37E44]"
                : "border-[#E5E0D8] hover:border-gray-300 bg-white"
            }`}
          >
            <Users className={`w-5 h-5 mt-0.5 ${packageType === "COUPLES" ? "text-[#A37E44]" : "text-gray-400"}`} />
            <div>
              <div className="text-sm font-bold text-[#0B1528]">My Partner & Me</div>
              <div className="text-xs text-gray-500 mt-0.5">Wills for Couples · 2 separate Wills</div>
              <div className="text-xs font-semibold text-[#A37E44] mt-2">AED 1,799 now + AED 1,900 court fee</div>
            </div>
          </button>
        </div>
      </div>

      {/* Questions 3-7 for Primary Testator */}
      <div className="space-y-5 pt-4 border-t border-[#E5E0D8]">
        <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider">
          {packageType === "COUPLES" ? "About You" : "Eligibility Questions"}
        </h3>

        {/* Q3 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
          <div>
            <p className="text-xs font-bold text-gray-900">3. Are you aged 21 or above? *</p>
            <p className="text-[11px] text-gray-500">Legal platform age threshold for testators.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTestatorAge21(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                testatorAge21 === true
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setTestatorAge21(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                testatorAge21 === false
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Q4 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
          <div>
            <p className="text-xs font-bold text-gray-900">4. Are you a non-UAE national? *</p>
            <p className="text-[11px] text-gray-500">Governed under the Abu Dhabi Civil Family Court.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNonUaeNational(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                nonUaeNational === true
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setNonUaeNational(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                nonUaeNational === false
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Q5 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
          <div>
            <p className="text-xs font-bold text-gray-900">5. Do you own any assets in the UAE? *</p>
            <p className="text-[11px] text-gray-500">Bank accounts, property, cars, or end-of-service gratuity.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUaeAssets(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                uaeAssets === true
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setUaeAssets(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                uaeAssets === false
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Q6 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
          <div>
            <p className="text-xs font-bold text-gray-900">6. Are you married? *</p>
            <p className="text-[11px] text-gray-500">Captures legal context without forcing appointments.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMarried(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                married === true
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setMarried(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                married === false
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Q7 */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
          <div>
            <p className="text-xs font-bold text-gray-900">7. Do you have any children under 18? *</p>
            <p className="text-[11px] text-gray-500">Controls minor children declaration and guardianship section.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChildrenUnder18(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                childrenUnder18 === true
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setChildrenUnder18(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                childrenUnder18 === false
                  ? "bg-[#0B1528] text-white"
                  : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Partner Section (Only if Couples) */}
      {packageType === "COUPLES" && (
        <div className="space-y-5 pt-4 border-t border-[#E5E0D8]">
          <h3 className="text-sm font-bold text-[#A37E44] uppercase tracking-wider">
            About Your Partner
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
            <div>
              <p className="text-xs font-bold text-gray-900">Is your partner aged 21 or above? *</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPartnerAge21(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerAge21 === true
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPartnerAge21(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerAge21 === false
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
            <div>
              <p className="text-xs font-bold text-gray-900">Is your partner a non-UAE national? *</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPartnerNonUae(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerNonUae === true
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPartnerNonUae(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerNonUae === false
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
            <div>
              <p className="text-xs font-bold text-gray-900">Does your partner own assets in the UAE? *</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPartnerAssets(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerAssets === true
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPartnerAssets(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerAssets === false
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E0D8] bg-[#FAF7F2]/40">
            <div>
              <p className="text-xs font-bold text-gray-900">Does your partner have children under 18? *</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPartnerChildrenUnder18(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerChildrenUnder18 === true
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setPartnerChildrenUnder18(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  partnerChildrenUnder18 === false
                    ? "bg-[#0B1528] text-white"
                    : "bg-white border border-[#E5E0D8] text-gray-700 hover:border-gray-400"
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-[#A37E44] hover:bg-[#8C6B37] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <span>Continue to Order Summary</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
