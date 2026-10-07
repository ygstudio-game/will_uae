"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { CheckSquare, Square, PenTool, Globe } from "lucide-react";

export function Step14Execution() {
  const { testator, updateTestator, confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ execution: !confirmations.execution });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Final Statutory Clause · Execution & Attestation
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Execution, Domicile & Court Attestation
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Confirm your country of domicile and acknowledge the formal execution requirements of the Abu Dhabi Civil Family Court.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-court-border shadow-court space-y-6">
        {/* Country of Domicile */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block mb-1.5">
            Country of Domicile (بلد الموطن الأصلي)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={testator.domicileCountry}
              onChange={(e) => updateTestator({ domicileCountry: e.target.value })}
              placeholder="e.g. England and Wales / India / France"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze font-medium text-gray-900"
            />
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">
            The legal jurisdiction you consider your permanent homeland or origin. Required by the ADJD court template.
          </span>
        </div>

        {/* Dual-column execution clause display */}
        <div className="border border-court-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-court-border">
            <div className="p-5 font-serif text-xs leading-relaxed text-gray-800 space-y-2">
              <p className="font-bold text-obsidian uppercase">Execution Clause (English)</p>
              <p>
                IN WITNESS WHEREOF I, the Testator, have hereunto set my hand to this my Last Will and Testament, drafted in dual English and Arabic columns, on this day in the United Arab Emirates.
              </p>
            </div>
            <div className="p-5 font-arabic text-sm leading-loose text-gray-900 space-y-2 bg-alabaster/40" dir="rtl">
              <p className="font-bold text-obsidian uppercase">صيغة التوقيع والإشهاد (العربية)</p>
              <p>
                وإشهاداً على ما تقدم، قمت أنا الموصي بالتوقيع على وصيتي وتصرفي في التركة، المحررة في عمودين باللغتين الإنجليزية والعربية، في هذا اليوم داخل دولة الإمارات العربية المتحدة.
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Confirmation */}
        <div className="p-4 bg-alabaster rounded-xl border border-court-border">
          <label onClick={handleToggle} className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.execution ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I confirm my legal domicile and acknowledge the execution and witness requirements.
              </span>
              <span className="text-xs text-gray-500 mt-0.5 block">
                Under ADJD rules, this document will be generated for your review and subsequent filing with the Abu Dhabi Civil Family Court.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
