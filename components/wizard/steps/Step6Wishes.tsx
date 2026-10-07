"use client";

import React from "react";
import { useWillStore } from "@/store/useWillStore";
import { CheckSquare, Square, HeartHandshake } from "lucide-react";

export function Step6Wishes() {
  const { confirmations, updateConfirmations } = useWillStore();

  const handleToggle = () => {
    updateConfirmations({ wishes: !confirmations.wishes });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-court-bronze mb-1">
          Official Court Clause · Section FOUR
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-obsidian tracking-tight">
          Letter of Wishes
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
          Statutory clause enabling you to deposit a private, signed Letter of Wishes guiding your trustees on personal items, funeral preferences, or family guidelines.
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
            <p className="font-bold text-obsidian">SECTION FOUR: LETTER OF WISHES</p>
            <p>
              I request my Trustees to give full effect to any Letter of Wishes signed by me and addressed to them, or to any other written statement of my wishes signed by me after the date of this Will, relating to any personal property or other testamentary matters.
            </p>
          </div>

          <div className="p-6 font-arabic text-base leading-loose text-gray-900 space-y-3 bg-alabaster/40" dir="rtl">
            <p className="font-bold text-obsidian">البند الرابع: خطاب النوايا والرغبات</p>
            <p>
              أطلب من الأمناء إعطاء كامل الأثر لأي خطاب رغبات موقع مني وموجه إليهم، أو لأي بيان مكتوب آخر يعبر عن رغباتي وموقع مني بعد تاريخ تحرير هذه الوصية، فيما يتعلق بأي ممتلكات شخصية أو أي شؤون إيصائية أخرى.
            </p>
          </div>
        </div>

        <div className="bg-alabaster p-6 border-t border-court-border">
          <label onClick={handleToggle} className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="mt-0.5 text-court-bronze group-hover:text-court-bronze-dark transition-colors">
              {confirmations.wishes ? (
                <CheckSquare className="w-5 h-5 text-court-bronze" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-obsidian transition-colors block">
                I hereby approve and confirm the statutory provisions of Section FOUR above.
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
