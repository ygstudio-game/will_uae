"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { ShieldCheck, Baby, CheckSquare, Square } from "lucide-react";

export function Step11Minors() {
  const { confirmations, updateConfirmations } = useWillStore();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section SEVEN (c & d)
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Trust Provisions for Beneficiaries Under 21
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Statutory trust protection provisions ensuring that any estate share left to a beneficiary under 21 years old is safeguarded and managed by your appointed Trustees.
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
          <div className="p-6 font-serif text-sm leading-relaxed text-gray-800 space-y-4">
            <p className="font-bold text-obsidian">
              SECTION SEVEN (c & d): TRUSTS FOR BENEFICIARIES UNDER 21
            </p>
            <p>
              (c) If any beneficiary entitled to a share in my estate has not attained the age of twenty-one (21) years at the date of my death, my Trustees shall hold such share on trust for such beneficiary until they attain the age of twenty-one (21) years.
            </p>
            <p>
              (d) My Trustees may at their absolute discretion apply the whole or any part of the income or capital of such share for or towards the maintenance, education, advancement or benefit of such minor beneficiary, and shall accumulate any unapplied surplus income.
            </p>
          </div>

          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-4 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">
              البند السابع (ج، د): أحكام الائتمان للمستفيدين دون سن 21
            </p>
            <p>
              (ج) إذا كان أي مستفيد يستحق حصة في تركتي لم يبلغ سن الحادية والعشرين (21) عاماً عند تاريخ وفاتي، فيحتفظ الأمناء بتلك الحصة على سبيل الأمانة والائتمان لصالح ذلك المستفيد حتى يبلغ سن الحادية والعشرين (21) عاماً.
            </p>
            <p>
              (د) يجوز للأمناء وفقاً لتقديرهم المطلق صرف واستخدام كامل أو أي جزء من دخل أو أصل تلك الحصة في أو نحو نفقات معيشة أو تعليم أو رعاية أو منفعة ذلك المستفيد القاصر، مع استثمار وتجميع أي فائض لم يُصرف.
            </p>
          </div>
        </div>

        <div className="bg-alabaster p-6 border-t border-court-border">
          <div className="flex items-center gap-3 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              This statutory trust clause is automatically incorporated into your ADJD Will to guarantee legal protection for minor beneficiaries.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
