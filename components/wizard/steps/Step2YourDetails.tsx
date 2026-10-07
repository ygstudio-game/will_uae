"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { User, MapPin, Mail, Phone, Calendar, Flag, Hash, Sparkles } from "lucide-react";

export function Step2YourDetails() {
  const { testator, updateTestator } = useWillStore();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Your Personal Details (Testator)
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          These details identify you as the testator in the opening preamble of the official ADJD Will template.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-6">
        {/* Full Name & Arabic Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Full Legal Name (English)
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Source: Passport · 99%
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={testator.fullName}
                onChange={(e) => updateTestator({ fullName: e.target.value })}
                placeholder="e.g. John Michael Smith"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-medium text-gray-900"
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              Must match exactly as printed on your passport photo page.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Arabic Name (الاسم باللغة العربية)
              </label>
              <span className="text-[10px] font-semibold text-court-bronze-dark bg-court-tan/20 px-2 py-0.5 rounded border border-court-tan/40">
                {testator.isUaeResident ? "Source: Emirates ID" : "Phonetic AI · 98%"}
              </span>
            </div>
            <input
              type="text"
              dir="rtl"
              value={testator.arabicName}
              onChange={(e) => updateTestator({ arabicName: e.target.value })}
              placeholder="دانيال مايكل كارتر"
              className="w-full px-3 py-2.5 text-base rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-arabic font-bold text-gray-900 text-right"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Phonetically transliterated into Arabic. Reviewed by you on Step 15.
            </span>
          </div>
        </div>

        {/* Date of Birth & Nationality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={testator.dob}
                onChange={(e) => updateTestator({ dob: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900 font-medium"
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              Must be aged 21 or older under ADJD court requirements.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Nationality
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Flag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={testator.nationality}
                onChange={(e) => updateTestator({ nationality: e.target.value })}
                placeholder="e.g. British"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Passport & Emirates ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Passport Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={testator.passportNumber}
                onChange={(e) => updateTestator({ passportNumber: e.target.value })}
                placeholder="e.g. GB12345678"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono font-semibold text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Emirates ID Number (if resident)
            </label>
            <input
              type="text"
              value={testator.emiratesId}
              onChange={(e) => updateTestator({ emiratesId: e.target.value })}
              placeholder="784-XXXX-XXXXXXX-X"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-mono text-gray-900"
            />
          </div>
        </div>

        {/* Current Residential Address */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
            Current Full Residential Address
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 text-gray-400">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea
              rows={2}
              value={testator.residentialAddress}
              onChange={(e) => updateTestator({ residentialAddress: e.target.value })}
              placeholder="Apartment/Villa No., Building Name, Street, Area/Emirate, UAE"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900 leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* Country of Domicile & Contact info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Country of Domicile
            </label>
            <input
              type="text"
              value={testator.domicileCountry}
              onChange={(e) => updateTestator({ domicileCountry: e.target.value })}
              placeholder="e.g. England and Wales"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Contact Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={testator.emailAddress}
                onChange={(e) => updateTestator({ emailAddress: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
              Contact Mobile
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={testator.contactNumber}
                onChange={(e) => updateTestator({ contactNumber: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
