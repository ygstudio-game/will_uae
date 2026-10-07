"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { CheckSquare, Square, CreditCard } from "lucide-react";

export function Step5Debts() {
  const { confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ debts: !confirmations.debts });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section THREE
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Payment of Debts & Funeral Expenses
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Statutory direction instructing your executors to settle all lawful UAE debts, liabilities, and estate administration expenses prior to beneficiary distribution.
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
            <p className="font-bold text-obsidian">SECTION THREE: DEBTS AND FUNERAL EXPENSES</p>
            <p>
              I direct my Trustees to pay my lawful debts, testamentary and funeral expenses, and the costs of winding up my estate situated within the United Arab Emirates out of the proceeds of my estate as soon as conveniently practicable after my death.
            </p>
          </div>

          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-3 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">البند الثالث: الديون ونفقات الجنازة</p>
            <p>
              أوجه الأمناء بسداد ديوني المشروعة، ومصاريف تجهيز ودفن الجثمان، ونفقات وتكاليف تصفية وإنهاء تركتي الكائنة داخل دولة الإمارات العربية المتحدة من عوائد تركتي في أقرب وقت ملائم عملياً بعد وفاتي.
            </p>
          </div>
        </div>

        <div className="bg-alabaster p-6 border-t border-court-border">
          <label onClick={handleToggle} className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.debts ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I hereby approve and confirm the statutory provisions of Section THREE above.
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
