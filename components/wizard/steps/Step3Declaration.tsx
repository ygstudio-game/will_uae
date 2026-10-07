"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { ShieldCheck, Scale, CheckSquare, Square } from "lucide-react";

export function Step3Declaration() {
  const { confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ declaration: !confirmations.declaration });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section ONE
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Section ONE: Declaration
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Statutory court clause confirming mental capacity, voluntary execution, age 21+, UAE territorial scope, and revocation of prior UAE wills.
        </p>
      </div>

      {/* Bilingual Court Clause Display */}
      <div className="bg-white rounded-2xl border border-court-border shadow-court overflow-hidden">
        {/* Table Header Band */}
        <div className="bg-court-tan/20 border-b border-court-border px-6 py-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold text-court-bronze-dark">
            English Legal Text
          </span>
          <span className="text-xs font-arabic font-bold text-court-bronze-dark" dir="rtl">
            النص القانوني باللغة العربية
          </span>
        </div>

        {/* Dual Column Legal Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-court-border">
          {/* English Column */}
          <div className="p-6 font-serif text-sm leading-relaxed text-gray-800 space-y-3">
            <p className="font-bold text-obsidian">
              SECTION ONE: DECLARATION
            </p>
            <p>
              I, the Testator, declare that I am of sound mind, memory and understanding and over the age of twenty-one (21) years.
            </p>
            <p>
              I declare that I make this Will freely and voluntarily without any duress, coercion, fraud or undue influence from any person whomsoever.
            </p>
            <p>
              I declare that this Will applies exclusively to my assets and property situated within the United Arab Emirates.
            </p>
            <p>
              I hereby revoke, cancel and annul all testamentary dispositions, wills and codicils previously made by me in respect of my assets and estate situated in the United Arab Emirates.
            </p>
          </div>

          {/* Arabic Column */}
          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-3 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">
              البند الأول: الإقرار والتصريح
            </p>
            <p>
              أقر وأصرح أنا الموصي بأنني بكامل قواي العقلية، وذاكرتي وإدراكي السليم، وأتجاوز سن الحادية والعشرين (21) عاماً.
            </p>
            <p>
              وأقر بأنني قد حررت هذه الوصية بمحض إرادتي الحرة واختياري الطوعي، دون إكراه أو إجبار أو تدليس أو تأثير من أي شخص كائناً من كان.
            </p>
            <p>
              وأقر بأن هذه الوصية تسري حصراً وتقتصر على أموالي وممتلكاتي الكائنة داخل دولة الإمارات العربية المتحدة فقط.
            </p>
            <p>
              وبموجب هذه الوصية، فإنني ألغي وأبطل كافة التصرفات الإيصائية والوصايا السابقة التي أجريتها بشأن ممتلكاتي وتركتي في دولة الإمارات العربية المتحدة.
            </p>
          </div>
        </div>

        {/* Mandatory Agreement Checkbox */}
        <div className="bg-alabaster p-6 border-t border-court-border">
          <label
            onClick={handleToggle}
            className="flex items-start gap-3 cursor-pointer group select-none"
          >
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.declaration ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I hereby declare, confirm and agree to all statutory provisions of Section ONE above.
              </span>
              <span className="text-xs text-gray-500 mt-0.5 block">
                This declaration is required by the Abu Dhabi Civil Family Court under Law No. 14 of 2021.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
