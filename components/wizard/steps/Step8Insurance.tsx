"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { CheckSquare, Square, Shield } from "lucide-react";

export function Step8Insurance() {
  const { confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ insurance: !confirmations.insurance });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section SIX
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Insurance Proceeds
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Statutory clause governing proceeds of life insurance policies payable in the UAE, prioritizing your insurer nomination form and defaulting to estate residue.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-court-border shadow-court overflow-hidden">
        <div className="bg-court-tan/20 border-b border-court-border px-6 py-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold text-court-bronze-dark">
            English Legal Text
          </span>
          <span className="text-xs font-arabic font-bold text-court-bronze-dark" dir="rtl">
            النص القانوني باللغة العربية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-court-border">
          <div className="p-6 font-serif text-sm leading-relaxed text-gray-800 space-y-3">
            <p className="font-bold text-obsidian">SECTION SIX: INSURANCE PROCEEDS</p>
            <p>
              All proceeds of any life insurance policies situated or payable in the United Arab Emirates shall be distributed in accordance with the official policy nomination form, or failing such nomination, shall fall into and form part of the residue of my estate.
            </p>
          </div>

          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-3 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">البند السادس: عوائد وثائق التأمين</p>
            <p>
              تُوزع كافة عوائد وثائق التأمين على الحياة الكائنة أو واجبة السداد في دولة الإمارات العربية المتحدة وفقاً لنموذج الترشيح الرسمي للوثيقة، وفي حال عدم وجود ترشيح، فإنها تؤول وتُضم إلى باقي تركتي.
            </p>
          </div>
        </div>

        <div className="bg-alabaster p-6 border-t border-court-border">
          <label onClick={handleToggle} className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.insurance ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I hereby approve and confirm the statutory provisions of Section SIX above.
              </span>
              <span className="text-xs text-gray-500 mt-0.5 block">
                Standard mandatory clause in the official ADJD template Form ADJD-NM1221-06-01.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
