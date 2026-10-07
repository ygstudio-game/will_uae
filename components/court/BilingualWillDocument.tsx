import React from "react";
import { CourtHeader } from "./CourtHeader";
import { CourtFooter } from "./CourtFooter";
import { TestatorDetails, Party, Child } from "@/types/will";

interface BilingualWillProps {
  testator: TestatorDetails;
  parties: Party[];
  children?: Child[];
}

export function BilingualWillDocument({ testator, parties, children = [] }: BilingualWillProps) {
  const primaryExec = parties.find((p) => p.role === "PRIMARY_EXECUTOR");
  const substituteExec = parties.find((p) => p.role === "SUBSTITUTE_EXECUTOR");
  const primaryBen = parties.find((p) => p.role === "PRIMARY_BENEFICIARY");
  const substituteBens = parties.filter((p) => p.role === "SUBSTITUTE_BENEFICIARY");
  const permGuardian = parties.find((p) => p.role === "PERMANENT_GUARDIAN");
  const tempGuardian = parties.find((p) => p.role === "TEMPORARY_GUARDIAN");

  return (
    <article className="bg-white p-6 sm:p-12 max-w-5xl mx-auto shadow-court rounded-xl border border-court-border print:shadow-none print:border-none print:p-0">
      <CourtHeader />

      {/* Synchronized Dual-Column Table */}
      <div className="border border-court-border rounded-lg overflow-hidden my-6">
        {/* Table Header Band */}
        <div className="bg-court-tan/30 border-b border-court-border grid grid-cols-2 text-xs font-bold text-obsidian tracking-wider uppercase py-3 px-4">
          <div>English Version (LTR)</div>
          <div className="text-right font-arabic font-bold text-sm" dir="rtl">
            النسخة العربية (RTL)
          </div>
        </div>

        {/* Section 0: Preamble */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold uppercase tracking-wider text-obsidian text-xs">Preamble</p>
            <p>
              THIS IS THE LAST WILL AND TESTAMENT of me, <strong>{testator.fullName}</strong>, holder of passport number <strong>{testator.passportNumber}</strong>, a national of <strong>{testator.nationality}</strong>, currently residing at <strong>{testator.residentialAddress}</strong>, in the United Arab Emirates.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian text-xs">الديباجة والمقدمة</p>
            <p>
              هذه هي الوصية الأخيرة والتصرف في التركة الصادرة مني أنا، <strong>{testator.arabicName || testator.fullName}</strong>، حامل جواز سفر رقم <strong>{testator.passportNumber}</strong>، ومن رعايا دولة <strong>{testator.nationality}</strong>، والمقيم حالياً في <strong>{testator.residentialAddress}</strong>، داخل دولة الإمارات العربية المتحدة.
            </p>
          </div>
        </div>

        {/* Section ONE: Declaration */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION ONE: DECLARATION</p>
            <p>
              1.1 I declare that I am of sound mind, memory and understanding and over the age of twenty-one (21) years.
            </p>
            <p>
              1.2 I make this Will freely and voluntarily without duress, coercion, or undue influence from any person.
            </p>
            <p>
              1.3 This Will applies exclusively to my assets and property situated within the United Arab Emirates.
            </p>
            <p>
              1.4 I hereby revoke, cancel and annul all previous testamentary dispositions, wills and codicils relating to my UAE assets.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند الأول: الإقرار والتصريح</p>
            <p>
              1.1 أقر وأصرح بأنني بكامل قواي العقلية وذاكرتي وإدراكي السليم، وأتجاوز سن الحادية والعشرين (21) عاماً.
            </p>
            <p>
              1.2 حررت هذه الوصية بمحض إرادتي الحرة ودون أي إكراه أو إجبار أو تدليس من أي شخص كائناً من كان.
            </p>
            <p>
              1.3 تسري هذه الوصية حصراً على أموالي وممتلكاتي الواقعة داخل دولة الإمارات العربية المتحدة فقط.
            </p>
            <p>
              1.4 ألغي وأبطل كافة التصرفات الإيصائية والوصايا السابقة المتعلقة بأموالي في دولة الإمارات.
            </p>
          </div>
        </div>

        {/* Section TWO: Executors */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION TWO: APPOINTMENT OF EXECUTORS AND TRUSTEES</p>
            <p>
              2.1 I appoint <strong>{primaryExec?.fullName}</strong> (holder of passport no. {primaryExec?.passportNumber}) to be the Executor and Trustee of this my Will ("my Trustees").
            </p>
            {substituteExec && (
              <p>
                2.2 If the said {primaryExec?.fullName} shall die before me or be unable or unwilling to act, I appoint <strong>{substituteExec.fullName}</strong> (holder of passport no. {substituteExec.passportNumber}) to be the substitute Executor and Trustee of this my Will.
              </p>
            )}
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند الثاني: تعيين المنفذين والأمناء</p>
            <p>
              2.1 أعين السيد/السيدة <strong>{primaryExec?.arabicName || primaryExec?.fullName}</strong> (حامل جواز سفر رقم {primaryExec?.passportNumber}) ليكون منفذاً لوصيتي وأميناً على تركتي ("الأمناء").
            </p>
            {substituteExec && (
              <p>
                2.2 وفي حال وفاة المنفذ المذكور قبلي أو عدم قدرته أو رغبته في تولي المهمة، فإنني أعين <strong>{substituteExec.arabicName || substituteExec.fullName}</strong> (حامل جواز سفر رقم {substituteExec.passportNumber}) منفذاً وأميناً بديلاً.
              </p>
            )}
          </div>
        </div>

        {/* Section THREE: Debts */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION THREE: DEBTS AND FUNERAL EXPENSES</p>
            <p>
              I direct my Trustees to pay my lawful debts, funeral expenses and testamentary winding-up costs out of the proceeds of my estate in the United Arab Emirates as soon as practicable.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند الثالث: الديون ونفقات الجنازة</p>
            <p>
              أوجه الأمناء بسداد ديوني المشروعة ومصاريف تجهيز ودفن الجثمان ونفقات تصفية التركة من عوائد تركتي في دولة الإمارات العربية المتحدة في أقرب وقت ملائم عملياً بعد وفاتي.
            </p>
          </div>
        </div>

        {/* Section FOUR: Letter of Wishes */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION FOUR: LETTER OF WISHES</p>
            <p>
              I request my Trustees to give full effect to any signed Letter of Wishes addressed to them and deposited with this Will relating to personal property or testamentary desires.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند الرابع: خطاب النوايا والرغبات</p>
            <p>
              أطلب من الأمناء إعطاء كامل الأثر لأي خطاب نوايا أو رغبات موقع مني وموجه إليهم ومودع مع هذه الوصية بشأن ممتلكاتي الشخصية.
            </p>
          </div>
        </div>

        {/* Section FIVE: Jurisdiction */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION FIVE: JURISDICTION</p>
            <p>
              This Will shall be governed by, construed and take effect in accordance with the laws of the United Arab Emirates and the secular personal status jurisdiction of the Abu Dhabi Civil Family Court under Abu Dhabi Law No. 14 of 2021.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند الخامس: الاختصاص القضائي</p>
            <p>
              تخضع هذه الوصية وتُفسر وتُنفذ في جميع جوانبها وفقاً لقوانين دولة الإمارات العربية المتحدة والاختصاص القضائي لمحكمة الأسرة المدنية في أبوظبي بموجب القانون رقم (14) لسنة 2021.
            </p>
          </div>
        </div>

        {/* Section SIX: Insurance */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION SIX: INSURANCE PROCEEDS</p>
            <p>
              All proceeds of life insurance policies payable in the UAE shall be distributed per the official policy nomination form, or failing such nomination, shall form part of my estate residue.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند السادس: عوائد وثائق التأمين</p>
            <p>
              تُوزع كافة عوائد وثائق التأمين على الحياة الكائنة أو واجبة السداد في دولة الإمارات وفقاً لنموذج الترشيح الرسمي للوثيقة، وتؤول لباقي التركة في حال غياب الترشيح.
            </p>
          </div>
        </div>

        {/* Section SEVEN: Distribution of Estate */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-3">
            <p className="font-bold text-obsidian">SECTION SEVEN: DISTRIBUTION OF ESTATE</p>
            <p>
              7.1 I give, devise and bequeath the whole of my real and personal estate in the United Arab Emirates to my Trustees upon trust to pay the whole residue of my estate to my spouse, <strong>{primaryBen?.fullName}</strong> (holder of passport no. {primaryBen?.passportNumber}), for her/his own use and benefit absolutely.
            </p>
            {substituteBens.length > 0 && (
              <p>
                7.2 If my said spouse shall die before me, my Trustees shall hold the residue of my estate upon trust for the following substitute beneficiaries in the specified percentage shares:
              </p>
            )}
            {substituteBens.map((ben, idx) => (
              <p key={idx} className="pl-3">
                • <strong>{ben.fullName}</strong> ({ben.sharePercentage}% share)
              </p>
            ))}
            <p>
              7.3 If any beneficiary entitled hereunder has not attained 21 years of age, their share shall be held in trust with full discretionary powers of maintenance and education until they reach 21.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-3 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند السابع: توزيع التركة</p>
            <p>
              7.1 أوصي وأهب كامل أموالي العقارية والمنقولة في دولة الإمارات العربية المتحدة إلى الأمناء لدفع ونقل كامل التركة إلى زوجي/زوجتي، <strong>{primaryBen?.arabicName || primaryBen?.fullName}</strong> (حامل جواز سفر رقم {primaryBen?.passportNumber})، لتكون ملكاً خالصاً له/لها.
            </p>
            {substituteBens.length > 0 && (
              <p>
                7.2 وفي حال وفاة زوجي/زوجتي قبلي، يحتفظ الأمناء بتركتي لصالح المستفيدين البدلاء الآتين بالنسب والأنصبة المحددة:
              </p>
            )}
            {substituteBens.map((ben, idx) => (
              <p key={idx} className="pr-3">
                • <strong>{ben.arabicName || ben.fullName}</strong> (بنسبة {ben.sharePercentage}%)
              </p>
            ))}
            <p>
              7.3 وإذا لم يبلغ أي مستفيد سن 21 عاماً، فتُحفظ حصته على سبيل الأمانة مع كامل سلطات الصرف لنفقات الرعاية والتعليم حتى بلوغه سن 21 عاماً.
            </p>
          </div>
        </div>

        {/* Section EIGHT: Powers of Trustees */}
        <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
            <p className="font-bold text-obsidian">SECTION EIGHT: POWERS OF EXECUTORS AND TRUSTEES</p>
            <p>
              My Trustees shall have full administrative powers of sale, mortgage, compromise of claims, employment of legal counsel, and investment in respect of all UAE assets.
            </p>
          </div>
          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">البند الثامن: صلاحيات الأوصياء والأمناء</p>
            <p>
              يتمتع الأمناء بكامل الصلاحيات الإدارية في البيع والرهن وتسوية المطالبات وتوظيف المحامين والمستشارين والاستثمار فيما يخص تركتي في دولة الإمارات.
            </p>
          </div>
        </div>

        {/* Section NINTH: Guardianship */}
        {(permGuardian || tempGuardian) && (
          <div className="grid grid-cols-2 divide-x divide-court-border border-b border-court-border">
            <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-2">
              <p className="font-bold text-obsidian">SECTION NINTH: GUARDIANSHIP APPOINTMENTS</p>
              {permGuardian && (
                <p>
                  9.1 I appoint <strong>{permGuardian.fullName}</strong> (passport no. {permGuardian.passportNumber}) to be the Permanent Guardian of my minor children.
                </p>
              )}
              {tempGuardian && (
                <p>
                  9.2 I appoint <strong>{tempGuardian.fullName}</strong> (passport no. {tempGuardian.passportNumber}) to be the Temporary Guardian to exercise immediate physical custody in the UAE until the Permanent Guardian takes custody.
                </p>
              )}
            </div>
            <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-2 bg-alabaster/30" dir="rtl">
              <p className="font-bold text-obsidian">البند التاسع: تعيين الأوصياء على القصر</p>
              {permGuardian && (
                <p>
                  9.1 أعين السيد/السيدة <strong>{permGuardian.arabicName || permGuardian.fullName}</strong> وصياً دائماً على أطفالي القصر.
                </p>
              )}
              {tempGuardian && (
                <p>
                  9.2 أعين السيد/السيدة <strong>{tempGuardian.arabicName || tempGuardian.fullName}</strong> وصياً مؤقتاً لتولي الحضانة والرعاية الفعلية داخل الإمارات لحين استلام الوصي الدائم.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Execution & Attestation */}
        <div className="grid grid-cols-2 divide-x divide-court-border">
          <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900 space-y-4">
            <p className="font-bold text-obsidian">EXECUTION AND ATTESTATION</p>
            <p>
              IN WITNESS WHEREOF I, the said Testator, have signed this my Will on this day in the United Arab Emirates.
            </p>
            <div className="pt-8">
              <div className="border-t border-gray-400 w-48 pt-1 text-xs font-sans text-gray-600">
                Signature of Testator: <strong>{testator.fullName}</strong>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 space-y-4 bg-alabaster/30" dir="rtl">
            <p className="font-bold text-obsidian">التوقيع والإشهاد</p>
            <p>
              وإشهاداً على ما تقدم، قمت أنا الموصي المذكور بالتوقيع على وصيتي هذه في هذا اليوم داخل دولة الإمارات العربية المتحدة.
            </p>
            <div className="pt-8">
              <div className="border-t border-gray-400 w-48 pt-1 text-xs font-sans text-gray-600">
                توقيع الموصي: <strong>{testator.arabicName || testator.fullName}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CourtFooter />
    </article>
  );
}
