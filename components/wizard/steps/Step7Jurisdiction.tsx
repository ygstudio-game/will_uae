"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { CheckSquare, Square, Scale } from "lucide-react";

export function Step7Jurisdiction() {
  const { confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ jurisdiction: !confirmations.jurisdiction });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section FIVE
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Jurisdiction & Governing Law
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Statutory confirmation that this Will is governed exclusively by the laws of the United Arab Emirates and the secular jurisdiction of the Abu Dhabi Civil Family Court.
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
            <p className="font-bold text-obsidian">SECTION FIVE: JURISDICTION</p>
            <p>
              This Will shall be governed by, construed and take effect in all respects in accordance with the laws of the United Arab Emirates and the substantive personal status jurisdiction of the Abu Dhabi Civil Family Court under Abu Dhabi Law No. 14 of 2021 on Civil Marriage and its Effects.
            </p>
          </div>

          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-3 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">البند الخامس: الاختصاص القضائي والقانون الواجب التطبيق</p>
            <p>
              تخضع هذه الوصية وتُفسر وتُنفذ في جميع جوانبها وفقاً لقوانين دولة الإمارات العربية المتحدة، وللاختصاص القضائي الموضوعي لمحكمة الأسرة المدنية في أبوظبي وفقاً لأحكام القانون رقم (14) لسنة 2021 بشأن الزواج المدني وآثاره في إمارة أبوظبي.
            </p>
          </div>
        </div>

        <div className="bg-alabaster p-6 border-t border-court-border">
          <label onClick={handleToggle} className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.jurisdiction ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I hereby approve and submit to the exclusive jurisdiction of the Abu Dhabi Civil Family Court.
              </span>
              <span className="text-xs text-gray-500 mt-0.5 block">
                Mandatory statutory provision under the ADJD Civil Family Court Will template.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
