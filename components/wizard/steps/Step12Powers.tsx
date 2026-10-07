"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { CheckSquare, Square, Briefcase } from "lucide-react";

export function Step12Powers() {
  const { confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ powers: !confirmations.powers });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section EIGHT
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Powers of Executors & Trustees
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Comprehensive administrative powers conferred by court law onto your Trustees to manage, insure, invest, compromise claims, and appoint lawyers on behalf of your UAE estate.
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
            <p className="font-bold text-obsidian">SECTION EIGHT: POWERS OF EXECUTORS AND TRUSTEES</p>
            <p>
              In addition to all statutory powers conferred upon them by the laws of the United Arab Emirates, my Trustees shall have the following administrative powers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-700">
              <li>To retain any asset or property in its present state of investment for as long as they see fit.</li>
              <li>To sell, transfer, exchange, mortgage, lease or otherwise dispose of any real or personal property.</li>
              <li>To compromise, settle, abandon or submit to arbitration any claims, debts or liabilities.</li>
              <li>To employ and pay solicitors, accountants, brokers, agents or other professionals out of the capital or income of my estate.</li>
              <li>To insure any property against loss, damage or public liability.</li>
            </ul>
          </div>

          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-3 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">البند الثامن: صلاحيات وسلطات الأوصياء والأمناء</p>
            <p>
              بالإضافة إلى كافة الصلاحيات القانونية المخولة لهم بموجب قوانين دولة الإمارات العربية المتحدة، يتمتع الأمناء بالصلاحيات الإدارية الآتية:
            </p>
            <ul className="list-disc pr-5 space-y-1.5 text-sm text-gray-800">
              <li>الاحتفاظ بأي أصل أو ملكية في حالتها الاستثمارية الراهنة طالما رأوا ذلك مناسباً.</li>
              <li>بيع أو نقل أو مقايضة أو رهن أو تأجير أو التصرف في أي أموال عقارية أو منقولة.</li>
              <li>تسوية أو مصالحة أو إبراء أو إحالة أي مطالبات أو ديون أو التزامات للتحكيم.</li>
              <li>توظيف ودفع أتعاب المحامين والمحاسبين والوكلاء من رأس مال أو دخل التركة.</li>
              <li>التأمين على ممتلكات التركة ضد الخسارة أو التلف أو المسؤولية المدنية.</li>
            </ul>
          </div>
        </div>

        <div className="bg-alabaster p-6 border-t border-court-border">
          <label onClick={handleToggle} className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.powers ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I hereby grant and approve the statutory administrative powers of Section EIGHT.
              </span>
              <span className="text-xs text-gray-500 mt-0.5 block">
                Official court statutory wording from ADJD Form ADJD-NM1221-06-01.
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
