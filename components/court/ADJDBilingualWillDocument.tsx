import React from "react";
import { ADJDCourtHeader } from "./ADJDCourtHeader";
import { ADJDCourtFooter } from "./ADJDCourtFooter";
import { PersonData, RoleAssignmentData, WillData } from "@/types/owa";

interface ADJDBilingualWillDocumentProps {
  will: WillData;
  testator: PersonData;
  assignments: RoleAssignmentData[];
}

export function ADJDBilingualWillDocument({
  will,
  testator,
  assignments,
}: ADJDBilingualWillDocumentProps) {
  // Extract Executors
  const exec1 = assignments.find((a) => a.role === "EXECUTOR_PRIMARY")?.person;
  const exec2 = assignments.find((a) => a.role === "EXECUTOR_SUBSTITUTE")?.person;
  const exec3 = assignments.find((a) => a.role === "EXECUTOR_FURTHER")?.person;

  // Extract Primary Beneficiaries (1 to 3)
  const primaryBeneficiaries = assignments
    .filter((a) => (a.role === "BENEFICIARY_PRIMARY" || a.role === "BENEFICIARY") && a.person)
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  // Extract Substitute Beneficiaries (A and optional B)
  const substituteBeneficiaries = assignments
    .filter((a) => a.role === "BENEFICIARY_SUBSTITUTE" && a.person)
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  // Extract Guardians
  const permGuardian = assignments.find((a) => a.role === "GUARDIAN_PERMANENT")?.person;
  const subPermGuardian = assignments.find((a) => a.role === "GUARDIAN_SUBSTITUTE_PERM")?.person;
  const tempGuardian = assignments.find((a) => a.role === "GUARDIAN_TEMPORARY")?.person;

  // Extract Children
  const children = assignments
    .filter((a) => a.role === "CHILD" && a.person)
    .map((a) => a.person!);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "_______________";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="bg-white p-6 sm:p-10 max-w-5xl mx-auto shadow-court rounded-xl border border-[#E5E0D8] text-gray-900 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
      {/* =========================================================================
          PAGE 1: Preamble & Section ONE: Declaration
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div>
          <ADJDCourtHeader />

          {/* Dual Column Preamble */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden my-4">
            <div className="bg-[#FAF7F2] border-b border-[#E5E0D8] grid grid-cols-2 text-xs font-bold text-[#0B1528] uppercase py-2.5 px-4 tracking-wider">
              <div>English Version (LTR)</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                النسخة العربية (RTL)
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              {/* English Left */}
              <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-3" dir="ltr">
                <p>
                  I, <strong>{testator.fullName}</strong>
                </p>
                <p>nationality: <strong>{testator.nationality || "_______________"}</strong></p>
                <p>born on: <strong>{formatDate(testator.dob)}</strong></p>
                <p>holder of Passport Number: <strong>{testator.passportNumber || "_______________"}</strong></p>
                <p>with UAE Identity Card No (if applicable): <strong>{testator.emiratesId || "N/A"}</strong></p>
                <p>residing at: <strong>{testator.address || "_______________"}</strong></p>
                <p className="pt-2 font-medium">
                  In order to settle the succession of my estate upon my death do provide as follows, namely:
                </p>
              </div>

              {/* Arabic Right */}
              <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                <p>
                  أنا، <strong>{testator.arabicName || testator.fullName}</strong>
                </p>
                <p>احمل الجنسية: <strong>{testator.nationality || "_______________"}</strong></p>
                <p>مولود في: <strong>{formatDate(testator.dob)}</strong></p>
                <p>أحمل جواز سفر رقم: <strong>{testator.passportNumber || "_______________"}</strong></p>
                <p>بطاقة هوية الإمارات رقم (إن وجدت): <strong>{testator.emiratesId || "لا ينطبق"}</strong></p>
                <p>عنواني في دولة الإمارات العربية المتحدة: <strong>{testator.address || "_______________"}</strong></p>
                <p className="pt-2 font-medium">
                  أكتب هذه الوصية من أجل وراثة ممتلكاتي بعد وفاتي، وذلك حسب الشروط والأحكام التالية، تحديداً:
                </p>
              </div>
            </div>
          </div>

          {/* Section ONE: Declaration */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden my-4">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2.5 px-4 tracking-wider">
              <div>ONE: Declaration</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                أولاً: إقرار
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-900">
                Being of sound mind and memory and over the age of twenty-one (21) years and not being actuated by duress, fraud, mistake, or undue influence, do hereby make, publish, and declare that this Will, including the revocation provision hereinafter contained, is made for the purpose of settling my properties situated or arising in the UNITED ARAB EMIRATES only. Any Wills or codicils made prior to this Will, relating to my estate in UAE are now cancelled.
              </div>
              <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-900 bg-[#FAF7F2]/40" dir="rtl">
                أكتب وصيتي هذه بمحض إرادتي وأنا بكامل قواي العقلية وبذاكرة سليمة، وفي سن تعدت الحادي والعشرين (21) عاماً، ومن دون أن أتعرض لأي نوع من الإكراه أو التأثير غير المشروع أو أن يكون لدي نية في الاحتيال أو بارتكاب أي خطأ، أقر وأعلن بموجبه أن وصيتي هذه هي لغرض توزيع ممتلكاتي الموجودة أو الناشئة في دولة الإمارات العربية المتحدة (إ.ع.م) فقط، وأي وصايا كتبتها أو عدلتها قبل هذه الوصية في دولة الإمارات العربية المتحدة (إ.ع.م.) تعتبر لاغية.
              </div>
            </div>
          </div>
        </div>

        <ADJDCourtFooter pageNumber={1} />
      </section>

      {/* =========================================================================
          PAGE 2: Section TWO: Appointment of Executors and Trustees
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div>
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden my-4">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2.5 px-4 tracking-wider">
              <div>TWO: Appointment of Executors and Trustees</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                ثانياً: تعيين منفذي الوصية
              </div>
            </div>

            {/* Appointment a (Primary) */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                <p className="font-bold">a) I appoint</p>
                <p><strong>{exec1?.fullName || "_______________"}</strong></p>
                <p>born on: <strong>{formatDate(exec1?.dob)}</strong></p>
                <p>holder of Passport Number: <strong>{exec1?.passportNumber || "_______________"}</strong></p>
                <p>with UAE Identity Card No (if applicable): <strong>{exec1?.emiratesId || "N/A"}</strong></p>
                <p className="pt-1">
                  to be my executor and trustee, but if he /she is unable or unwilling to act or if he/she dies before proving my Will, the following provision shall apply instead.
                </p>
              </div>
              <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                <p className="font-bold">أ) أعين</p>
                <p><strong>{exec1?.arabicName || exec1?.fullName || "_______________"}</strong></p>
                <p>المولود في: <strong>{formatDate(exec1?.dob)}</strong></p>
                <p>حامل جواز سفر رقم: <strong>{exec1?.passportNumber || "_______________"}</strong></p>
                <p>وبطاقة هوية الإمارات رقم (إن وجدت): <strong>{exec1?.emiratesId || "لا ينطبق"}</strong></p>
                <p className="pt-1">
                  ليكون المنفذ والوصي على وصيتي، وإذا كان غير قادر أو غير راغب في ذلك أو إذا مات قبل تنفيذ وصيتي، يطبق البند التالي بدلاً من ذلك.
                </p>
              </div>
            </div>

            {/* Appointment b (Substitute) */}
            {exec2 && (
              <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
                <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                  <p className="font-bold">b) I appoint</p>
                  <p><strong>{exec2.fullName}</strong></p>
                  <p>born on: <strong>{formatDate(exec2.dob)}</strong></p>
                  <p>holder of Passport Number: <strong>{exec2.passportNumber || "_______________"}</strong></p>
                  <p>with UAE Identity Card No (if applicable): <strong>{exec2.emiratesId || "N/A"}</strong></p>
                  <p className="pt-1">to act as my substitute executor and trustee.</p>
                </div>
                <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                  <p className="font-bold">ب) أعين</p>
                  <p><strong>{exec2.arabicName || exec2.fullName}</strong></p>
                  <p>المولود في: <strong>{formatDate(exec2.dob)}</strong></p>
                  <p>حامل جواز سفر رقم: <strong>{exec2.passportNumber || "_______________"}</strong></p>
                  <p>وبطاقة هوية الإمارات رقم (إن وجدت): <strong>{exec2.emiratesId || "لا ينطبق"}</strong></p>
                  <p className="pt-1">للتصرف كالمنفذ على وصيتي.</p>
                </div>
              </div>
            )}

            {/* Appointment c & d (Further Substitute) */}
            {exec3 && (
              <>
                <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8] bg-gray-50/50">
                  <div className="p-3 font-serif text-xs text-gray-700">
                    c) If all of the above appointed executors and trustees die before proving my Will, I revoke their appointments and I make the following further appointment instead.
                  </div>
                  <div className="p-3 font-arabic text-sm text-gray-700" dir="rtl">
                    ج) في حال وفاة كل المنفذين المذكورين أعلاه قبل تنفيذ وصيتي، أعين المذكور أدناه عوضاً عن ذلك.
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
                  <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                    <p className="font-bold">d) I appoint</p>
                    <p><strong>{exec3.fullName}</strong></p>
                    <p>born on: <strong>{formatDate(exec3.dob)}</strong></p>
                    <p>holder of Passport Number: <strong>{exec3.passportNumber || "_______________"}</strong></p>
                    <p>with UAE Identity Card No (if applicable): <strong>{exec3.emiratesId || "N/A"}</strong></p>
                    <p className="pt-1">to act as my substitute executor and trustee.</p>
                  </div>
                  <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                    <p className="font-bold">د) أعين</p>
                    <p><strong>{exec3.arabicName || exec3.fullName}</strong></p>
                    <p>المولود في: <strong>{formatDate(exec3.dob)}</strong></p>
                    <p>حامل جواز سفر رقم: <strong>{exec3.passportNumber || "_______________"}</strong></p>
                    <p>وبطاقة هوية الإمارات رقم (إن وجدت): <strong>{exec3.emiratesId || "لا ينطبق"}</strong></p>
                    <p className="pt-1">للتصرف كالمنفذ على وصيتي.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <ADJDCourtFooter pageNumber={2} />
      </section>

      {/* =========================================================================
          PAGE 3: Sections THREE, FOUR, FIVE, SIX
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div className="space-y-4">
          {/* THREE: Debts and Funeral Expenses */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2 px-4 tracking-wider">
              <div>THREE: Debts and Funeral Expenses</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                ثالثاً: الديون ومصاريف الدفن
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-4 font-serif text-xs sm:text-sm leading-relaxed">
                I direct my trustees to make payment of my lawful debts and funeral expenses and of the expenses of winding up my estate.
              </div>
              <div className="p-4 font-arabic text-sm sm:text-base leading-loose bg-[#FAF7F2]/40" dir="rtl">
                أوجه أوصيائي بأداء ديوني القانونية ونفقات جنازتي ونفقات تصفية تركتي.
              </div>
            </div>
          </div>

          {/* FOUR: Letter of Wishes */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2 px-4 tracking-wider">
              <div>FOUR: Letter of Wishes</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                رابعاً: خطاب الرغبات
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-4 font-serif text-xs sm:text-sm leading-relaxed">
                I direct my trustees to give effect to any writings granted by me, however informal they may be, provided they are signed by me, dated after the date hereof and are clearly expressive of my intention, as to which my trustees shall be the sole judges.
              </div>
              <div className="p-4 font-arabic text-sm sm:text-base leading-loose bg-[#FAF7F2]/40" dir="rtl">
                أوجه أوصيائي بتنفيذ أي تفويضات قمت بإصدارها مهما كانت غير رسمية، على أن تكون موقعة من طرفي، وتحمل تاريخاً لاحقاً لتاريخ هذه الوصية وتفصح بوضوح عن نيتي والتي سيكون أوصيائي هم الوحيدون المخول لهم الحكم بشأنها.
              </div>
            </div>
          </div>

          {/* FIVE: Jurisdiction */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2 px-4 tracking-wider">
              <div>FIVE: Jurisdiction</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                خامساً: القانون
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-4 font-serif text-xs sm:text-sm leading-relaxed space-y-1">
                <p>a) The laws of the United Arab Emirates (UAE) applies.</p>
                <p>b) The substantive provisions governing testamentary disposition and other dispositions taking effect after my death shall govern the provisions of this Will.</p>
              </div>
              <div className="p-4 font-arabic text-sm sm:text-base leading-loose bg-[#FAF7F2]/40" dir="rtl">
                <p>أ) تطبق قوانين دولة الامارات العربية المتحدة.</p>
                <p>ب) والأحكام الموضوعية التي تحكم التصرفات المتعلقة بالوصايا والتصرفات الأخرى التي قد تصبح نافذة بعد وفاتي.</p>
              </div>
            </div>
          </div>

          {/* SIX: Entitlements of Insurance Proceeds */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2 px-4 tracking-wider">
              <div>SIX: Entitlements of Insurance Proceeds</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                سادساً: مستحقات إيرادات التأمين
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-4 font-serif text-xs sm:text-sm leading-relaxed">
                I direct my trustees that all proceeds from any insurance policies shall be distributed according to the existing nomination/beneficiary form completed by me and in the absence of such form, the following beneficiary provisions of this Will shall apply instead.
              </div>
              <div className="p-4 font-arabic text-sm sm:text-base leading-loose bg-[#FAF7F2]/40" dir="rtl">
                أوجه أوصيائي بأن يتم توزيع جميع الإيرادات المتأتية من أي بوالص تأمين وفق نموذج المستفيدين القائم والمعبأ من قبلي. وفي حال عدم وجود هذا النموذج تنطبق بنود الانتفاع التالية المذكورة في هذه الوصية بدلاً من ذلك.
              </div>
            </div>
          </div>
        </div>

        <ADJDCourtFooter pageNumber={3} />
      </section>

      {/* =========================================================================
          PAGE 4: Section SEVEN: Distribution of My Estate Proceeds (Part 1)
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div>
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden my-4">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2.5 px-4 tracking-wider">
              <div>SEVEN: Distribution of My Estate Proceeds</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                سابعاً: توزيع تركتي
              </div>
            </div>

            {/* Residue Preamble Clause */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed text-gray-800">
                I direct my trustees to make over the whole residue and remainder of my means and estate, moveable and immoveable properties, all financial assets including but not limited to bank accounts, including savings, current and fixed deposits and any other accounts, motorcycles, motor cars, art and antiques, jewels, jewellery, furniture and fixtures, debentures, leasehold, bonds, security lockers, stocks, shares, investments, inheritance, mutual funds, capital, death in service benefits, gratuity payments, reserves, all insurance policies and any shareholding in any companies and any other assets to the following:
              </div>
              <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose text-gray-800 bg-[#FAF7F2]/40" dir="rtl">
                أوجه أوصيائي بأن يحولوا كل الباقي من أموالي وممتلكاتي، المنقولة وغير المنقولة وكافة الأصول المالية بما في ذلك على سبيل المثال لا الحصر الحسابات المصرفية متضمنة حسابات التوفير والودائع وأي حسابات أخرى والدراجات النارية والسيارات والقطع الفنية والأثرية والحلي والمجوهرات والأثاث والتجهيزات وسندات الدين وأثمان الإيجار والصكوك وخزائن الإيداع الآمن والسندات والأسهم والاستثمارات والتركات وصناديق الاستثمار ورؤوس الأموال وتعويضات الوفاة على رأس العمل ومكافآت نهاية الخدمة والمدخرات وجميع تعويضات بوالص التأمين وأي حصص في أي شركات وأي أصول أخرى بشكل مطلق إلى:
              </div>
            </div>

            {/* Primary Beneficiaries List (1 to 3) */}
            {primaryBeneficiaries.map((ben, idx) => {
              const letter = String.fromCharCode(97 + idx); // a, b, c...
              const p = ben.person;
              return (
                <div key={ben.id} className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
                  <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                    <p className="font-bold text-[#0B1528]">
                      {letter}) As to a (<strong>{ben.sharePercentage || 100}%</strong>) percentage share of residue to:
                    </p>
                    <p><strong>{p?.fullName}</strong></p>
                    <p>born on: <strong>{formatDate(p?.dob)}</strong></p>
                    <p>holder of Passport Number: <strong>{p?.passportNumber || "_______________"}</strong></p>
                    <p>with UAE Identity Card No (if applicable): <strong>{p?.emiratesId || "N/A"}</strong></p>
                  </div>
                  <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                    <p className="font-bold text-[#0B1528]">
                      نسبة (<strong>{ben.sharePercentage || 100} ٪</strong>) بالمائة من حصصي الباقية تؤول إلى:
                    </p>
                    <p><strong>{p?.arabicName || p?.fullName}</strong></p>
                    <p>المولود في: <strong>{formatDate(p?.dob)}</strong></p>
                    <p>حامل جواز سفر رقم: <strong>{p?.passportNumber || "_______________"}</strong></p>
                    <p>وبطاقة هوية الإمارات رقم (إن وجدت): <strong>{p?.emiratesId || "لا ينطبق"}</strong></p>
                  </div>
                </div>
              );
            })}

            {/* Proportional Redistribution Clause among Surviving Primaries */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8] bg-[#FAF7F2]/20">
              <div className="p-3.5 sm:p-4 font-serif text-xs leading-relaxed text-gray-800">
                If any of my said primary beneficiaries shall predecease me, then I direct that their share of the residue shall be divided among my surviving primary beneficiaries in proportion to their original percentage shares. If only one primary beneficiary survives me, such sole surviving primary beneficiary shall receive the whole of my estate residue.
              </div>
              <div className="p-3.5 sm:p-4 font-arabic text-xs sm:text-sm leading-relaxed text-gray-800 bg-[#FAF7F2]/40" dir="rtl">
                وفي حال وفاة أيٍّ من المستفيدين الأساسيين المذكورين أعلاه قبلي، فإنني أوجه بأن تُوزع حصته من التركة على المستفيدين الأساسيين الباقين على قيد الحياة تناسبياً وفقاً لنسب حصصهم الأصلية. وفي حال بقي مستفيد أساسي واحد فقط على قيد الحياة، فإنه يحوز كامل باقي تركتي.
              </div>
            </div>

            {/* Shared Substitute Group (Trigger: If none of the primaries survive) */}
            {substituteBeneficiaries.length > 0 && (
              <>
                <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8] bg-[#A37E44]/10 text-xs font-bold py-2 px-4 text-[#0B1528]">
                  <div>SUBSTITUTE BENEFICIARY CLAUSE (IF NO PRIMARY SURVIVES):</div>
                  <div className="text-right font-arabic" dir="rtl">
                    بند المستفيدين البدلاء (في حال عدم بقاء أي مستفيد أساسي):
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
                  <div className="p-3.5 sm:p-4 font-serif text-xs leading-relaxed text-gray-800">
                    If none of my above-named primary beneficiaries survives me, then I direct my trustees to hold the residue of my estate upon trust for the following substitute beneficiaries:
                  </div>
                  <div className="p-3.5 sm:p-4 font-arabic text-xs sm:text-sm leading-relaxed text-gray-800 bg-[#FAF7F2]/40" dir="rtl">
                    وفي حال لم يبقَ أيٌّ من المستفيدين الأساسيين المذكورين أعلاه على قيد الحياة، فإنني أوجه أوصيائي بالاحتفاظ بباقي تركتي كأمانة لصالح المستفيدين البدلاء التاليين:
                  </div>
                </div>

                {substituteBeneficiaries.map((sub, idx) => {
                  const slotLabel = idx === 0 ? "A" : "B";
                  const p = sub.person;
                  return (
                    <div key={sub.id} className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
                      <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                        <p className="font-bold text-[#0B1528]">
                          Substitute Beneficiary {slotLabel}) As to a (<strong>{sub.sharePercentage || 100}%</strong>) percentage share of residue to:
                        </p>
                        <p><strong>{p?.fullName}</strong></p>
                        <p>born on: <strong>{formatDate(p?.dob)}</strong></p>
                        <p>holder of Passport Number: <strong>{p?.passportNumber || "_______________"}</strong></p>
                        <p>with UAE Identity Card No (if applicable): <strong>{p?.emiratesId || "N/A"}</strong></p>
                        {idx === 0 && (
                          <p className="pt-2 text-xs text-gray-700 italic border-t border-gray-100">
                            If the said <strong>{p?.fullName}</strong> does not survive me or fails to take a vested interest, then his/her share of residue shall pass to his/her surviving children in equal shares.
                          </p>
                        )}
                      </div>
                      <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                        <p className="font-bold text-[#0B1528]">
                          المستفيد البديل {slotLabel}) نسبة (<strong>{sub.sharePercentage || 100} ٪</strong>) بالمائة من حصصي الباقية تؤول إلى:
                        </p>
                        <p><strong>{p?.arabicName || p?.fullName}</strong></p>
                        <p>المولود في: <strong>{formatDate(p?.dob)}</strong></p>
                        <p>حامل جواز سفر رقم: <strong>{p?.passportNumber || "_______________"}</strong></p>
                        <p>وبطاقة هوية الإمارات رقم (إن وجدت): <strong>{p?.emiratesId || "لا ينطبق"}</strong></p>
                        {idx === 0 && (
                          <p className="pt-2 text-xs sm:text-sm text-gray-700 italic border-t border-gray-200">
                            وفي حال لم يبقَ المذكور/ المذكورة أعلاه على قيد الحياة أو لم يحز على حصة مستقرة، تؤول حصته من التركة إلى أولاده الباقين على قيد الحياة بالتساوي بينهم.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <ADJDCourtFooter pageNumber={4} />
      </section>

      {/* =========================================================================
          PAGE 5: Section SEVEN (Minor Trust & Pro-rata) & EIGHT: Powers of Trustees
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div className="space-y-4">
          {/* Statutory Minor Trust & Pro-rata clauses */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#FAF7F2] border-b border-[#E5E0D8] grid grid-cols-2 text-xs font-bold text-[#0B1528] uppercase py-2 px-4 tracking-wider">
              <div>Distribution Provisions (Cont.)</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                أحكام توزيع التركة (تابع)
              </div>
            </div>

            {/* Clause c */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-3.5 font-serif text-xs leading-relaxed">
                c) If any part of the residue of my estate falls to a beneficiary who has not attained the age of twenty-one (21) years, my trustees shall hold the same in trust for this beneficiary until the age of twenty-one (21) years is attained.
              </div>
              <div className="p-3.5 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                ج) في حال أيلولة أي جزء من باقي ممتلكاتي إلى منتفع لم يبلغ سن الحادي والعشرين (21) عاماً يحتفظ أوصيائي بذلك الجزء كأمانة لصالح ذلك المستفيد لحين بلوغه سن الحادي والعشرين (21) عاماً.
              </div>
            </div>

            {/* Clause d */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-3.5 font-serif text-xs leading-relaxed">
                d) Income arising from such share shall be accumulated but my trustees may apply all or part of the income or capital of this share for the maintenance, education or benefit of this beneficiary.
              </div>
              <div className="p-3.5 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                د) يتم حفظ الدخل الناشئ عن مثل هذه الحصة تراكمياً، ومع ذلك يجوز لمنفذي وصيتي استخدام كل هذا الدخل/ رأس المال أو بعض منه من أجل إعالة ذلك المنتفع وتعليمه وتحقيق مصالحه.
              </div>
            </div>

            {/* Clause e */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-3.5 font-serif text-xs leading-relaxed">
                e) In the event of any of the foregoing shares of the residue remain indisposed of by the preceding provisions, such share shall be distributed to the other beneficiaries pro rata according to their shares.
              </div>
              <div className="p-3.5 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                هـ) في حال بقاء أي من الحصص المذكورة أعلاه من باقي ممتلكاتي بدون توزيع بموجب البنود السابقة، يتم توزيع تلك الحصص إلى المنتفعين الآخرين تناسبياً وفقاً لحصة كل منهم.
              </div>
            </div>
          </div>

          {/* Section EIGHT: Powers of Executors and Trustees */}
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2 px-4 tracking-wider">
              <div>EIGHT: Powers of Executors and Trustees</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                ثامناً: صلاحيات منفذي الوصية
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] p-3 border-b border-[#E5E0D8] bg-gray-50/50 text-xs font-medium text-gray-700">
              <div>If any part of my estate is held for a beneficiary who lacks full legal capacity, my trustees shall have the following powers:-</div>
              <div className="font-arabic" dir="rtl">في حال أيلولة أي جزء من تركتي لصالح منتفع يفتقر للأهلية القانونية الكاملة، فسيكون لأوصيائي الصلاحيات التالية:</div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-3 font-serif text-xs leading-relaxed">
                a) To pay or apply any part of the income or capital falling to that beneficiary for his or her benefit in any manner my trustees think proper.
              </div>
              <div className="p-3 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                أ) أداء أو استخدام أي جزء من الإيراد أو رأس المال الآيل لذلك المنتفع لما فيه مصلحته أو مصلحتها بالطريقة التي يراها أوصيائي مناسبة.
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-3 font-serif text-xs leading-relaxed">
                b) To retain the same until such capacity is attained, accumulating income with capital.
              </div>
              <div className="p-3 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                ب) الإبقاء على ذلك الجزء إلى حين بلوغه الأهلية المطلوبة مع إضافة الإيراد إلى رأس المال.
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-3 font-serif text-xs leading-relaxed">
                c) To pay over the same to the legal guardian or the person for the time being having the custody of that beneficiary, whose receipt shall be a sufficient discharge to my trustees.
              </div>
              <div className="p-3 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                ج) أداء الجزء المذكور إلى الوصي الشرعي أو الشخص الذي له حق الوصاية على ذلك المنتفع في تلك المرحلة، وسيكون في الإيصال الصادر عن أي منهما إبراء كافياً لذمة أوصيائي.
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-3 font-serif text-xs leading-relaxed">
                d) My trustees shall have the fullest powers of retention, realisation, investment, appropriation, transfer of property without consideration, and management of my estate as if they were absolute owners and not trustees, however all proceeds are for the interest of the beneficiaries only.
              </div>
              <div className="p-3 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                د) لأوصيائي الصلاحية المطلقة للاحتفاظ بممتلكاتي أو بيعها أو استثمارها أو تخصيصها لغرض بعينه، أو تحويل ملكيتها دون تقاضي أي أتعاب، وإدارة تركتي كما لو كانوا يملكونها بشكل مطلق وليسوا أوصياء عليها؛ ومع ذلك، تبقي كافة الإيرادات لصالح المنتفعين فقط بما يحقق مصلحتهم.
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
              <div className="p-3 font-serif text-xs leading-relaxed">
                e) My trustees may appoint one or more executor of their own number to act as solicitor or agent in any other capacity and allow that trustee the same remuneration, as to which that trustee would have been entitled to if such appointment is made.
              </div>
              <div className="p-3 font-arabic text-sm leading-loose bg-[#FAF7F2]/40" dir="rtl">
                هـ) يمكن لأوصيائي تعيين واحد منهم أو أكثر ليكون محامياً أو وكيلاً بأي صفة أخرى وتخصيص نفس الراتب لذلك الوصي الذي كان يحق له أن يحصل عليه إذا ما تم توكيل غيره.
              </div>
            </div>
          </div>
        </div>

        <ADJDCourtFooter pageNumber={5} />
      </section>

      {/* =========================================================================
          PAGE 6: Section NINE: Guardianship Appointments (Part 1 - Children)
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div>
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden my-4">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2.5 px-4 tracking-wider">
              <div>NINE: Guardianship Appointments (if applicable)</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                تاسعاً: تعيينات الوصاية
              </div>
            </div>

            {/* Permanent Guardian Appointment */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                <p className="font-bold">Upon my demise, I appoint</p>
                <p><strong>{permGuardian?.fullName || "_______________"}</strong></p>
                <p>born on: <strong>{formatDate(permGuardian?.dob)}</strong></p>
                <p>nationality: <strong>{permGuardian?.nationality || "_______________"}</strong></p>
                <p>holder of Passport Number: <strong>{permGuardian?.passportNumber || "_______________"}</strong></p>
                <p className="pt-1 font-medium">to act as permanent guardian of my child/ren as follows:</p>
              </div>
              <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                <p className="font-bold">يُعين بعد وفاتي:</p>
                <p><strong>{permGuardian?.arabicName || permGuardian?.fullName || "_______________"}</strong></p>
                <p>المولود في: <strong>{formatDate(permGuardian?.dob)}</strong></p>
                <p>من الجنسية: <strong>{permGuardian?.nationality || "_______________"}</strong></p>
                <p>حامل جواز سفر رقم: <strong>{permGuardian?.passportNumber || "_______________"}</strong></p>
                <p className="pt-1 font-medium">ليكون الوصي الدائم على ولدي/ أولادي المذكورين أدناه:</p>
              </div>
            </div>

            {/* List of Children (1 to 5) */}
            {children.length > 0 ? (
              children.map((child, idx) => (
                <div key={child.id} className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
                  <div className="p-3.5 font-serif text-xs leading-relaxed space-y-1">
                    <p className="font-bold">{idx + 1}. My child named: <strong>{child.fullName}</strong></p>
                    <p>born on: <strong>{formatDate(child.dob)}</strong></p>
                    <p>nationality: <strong>{child.nationality || "_______________"}</strong></p>
                    <p>holder of Passport Number: <strong>{child.passportNumber || "_______________"}</strong></p>
                  </div>
                  <div className="p-3.5 font-arabic text-sm leading-loose space-y-1 bg-[#FAF7F2]/40" dir="rtl">
                    <p className="font-bold">.{idx + 1} ابني / ابنتي: <strong>{child.arabicName || child.fullName}</strong></p>
                    <p>المولود في: <strong>{formatDate(child.dob)}</strong></p>
                    <p>من الجنسية: <strong>{child.nationality || "_______________"}</strong></p>
                    <p>حامل جواز سفر رقم: <strong>{child.passportNumber || "_______________"}</strong></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-500 italic">
                No minor children declared under this Will.
              </div>
            )}
          </div>
        </div>

        <ADJDCourtFooter pageNumber={6} />
      </section>

      {/* =========================================================================
          PAGE 7: Section NINE: Guardianship Appointments (Part 2 - Substitutes)
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 border-b-2 border-dashed border-[#E5E0D8] print:border-none print:break-after-page">
        <div className="space-y-4">
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#FAF7F2] border-b border-[#E5E0D8] grid grid-cols-2 text-xs font-bold text-[#0B1528] uppercase py-2 px-4 tracking-wider">
              <div>Substitute & Temporary Guardianship Appointments</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                تعيينات الأوصياء البدلاء والمؤقتين
              </div>
            </div>

            {/* Substitute Permanent Guardian */}
            {subPermGuardian && (
              <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
                <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                  <p className="font-bold">In the event of him/her predeceasing me or being unable or unwilling to act, then;</p>
                  <p>I appoint <strong>{subPermGuardian.fullName}</strong></p>
                  <p>born on: <strong>{formatDate(subPermGuardian.dob)}</strong></p>
                  <p>holder of Passport Number: <strong>{subPermGuardian.passportNumber || "_______________"}</strong></p>
                  <p className="pt-1">
                    to act as the permanent guardian of my child/ren, if they are under the age of full capacity at the time of my death.
                  </p>
                </div>
                <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                  <p className="font-bold">وفي حال توفي قبلي أو كان غير قادر أو غير راغب في التصرف بهذه الصفة، عندئذ؛</p>
                  <p>أعين <strong>{subPermGuardian.arabicName || subPermGuardian.fullName}</strong></p>
                  <p>المولود في: <strong>{formatDate(subPermGuardian.dob)}</strong></p>
                  <p>حامل جواز سفر رقم: <strong>{subPermGuardian.passportNumber || "_______________"}</strong></p>
                  <p className="pt-1">
                    ليكون الوصي الدائم على ولدي/ أولادي، إذا كانوا تحت سن الأهلية القانونية الكاملة عند وفاتي.
                  </p>
                </div>
              </div>
            )}

            {/* Optional Temporary Guardian */}
            {tempGuardian && (
              <div className="grid grid-cols-2 divide-x divide-[#E5E0D8]">
                <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                  <p className="font-bold">
                    However, if the appointed permanent guardian mentioned above is unable to act and take the custody of my child/ren for the interim period only, then;
                  </p>
                  <p>I appoint <strong>{tempGuardian.fullName}</strong></p>
                  <p>born on: <strong>{formatDate(tempGuardian.dob)}</strong></p>
                  <p>nationality: <strong>{tempGuardian.nationality || "_______________"}</strong></p>
                  <p>holder of Passport Number: <strong>{tempGuardian.passportNumber || "_______________"}</strong></p>
                  <p>with UAE Identity Card No (if applicable): <strong>{tempGuardian.emiratesId || "N/A"}</strong></p>
                  <p className="pt-1">
                    to act as the interim guardian of my child/ren. This interim guardianship appointment will apply until the permanent guardians will be able to act and take over the custody of my child/ren.
                  </p>
                </div>
                <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                  <p className="font-bold">
                    ولكن، إذا كان الأوصياء الدائمون المعينون المذكورون أعلاه غير قادرين على التصرف وتولي ولاية ولدي/أولادي للفترة الانتقالية فقط، عندئذ؛
                  </p>
                  <p>أعين <strong>{tempGuardian.arabicName || tempGuardian.fullName}</strong></p>
                  <p>المولود في: <strong>{formatDate(tempGuardian.dob)}</strong></p>
                  <p>من الجنسية: <strong>{tempGuardian.nationality || "_______________"}</strong></p>
                  <p>حامل جواز سفر رقم: <strong>{tempGuardian.passportNumber || "_______________"}</strong></p>
                  <p>وبطاقة هوية الإمارات رقم (إن وجدت): <strong>{tempGuardian.emiratesId || "لا ينطبق"}</strong></p>
                  <p className="pt-1">
                    ليكون الوصي المؤقت على ولدي/ أولادي. ويسري هذا التعيين للوصاية المؤقتة إلى أن يتمكن الأوصياء الدائمون التصرف وتولي ولاية ولدي/ أولادي.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ADJDCourtFooter pageNumber={7} />
      </section>

      {/* =========================================================================
          PAGE 8: Section TEN: Execution and Attestation
      ========================================================================== */}
      <section className="min-h-[1050px] flex flex-col justify-between pt-8 pb-8 print:border-none">
        <div className="space-y-4">
          <div className="border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="bg-[#A37E44] text-white grid grid-cols-2 text-xs font-bold uppercase py-2.5 px-4 tracking-wider">
              <div>TEN: Execution and Attestation</div>
              <div className="text-right font-arabic font-bold text-sm" dir="rtl">
                عاشراً: الإشهاد والتنفيذ
              </div>
            </div>

            {/* Domicile and Residence Declaration */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8]">
              <div className="p-4 sm:p-5 font-serif text-xs sm:text-sm leading-relaxed space-y-2">
                <p>
                  Finally: I declare that my country of domicile is <strong>{will.domicileCountry || "United Kingdom"}</strong>
                </p>
                <p>
                  and I am residing in the United Arab Emirates at the time of writing this Will.
                </p>
              </div>
              <div className="p-4 sm:p-5 font-arabic text-sm sm:text-base leading-loose space-y-2 bg-[#FAF7F2]/40" dir="rtl">
                <p>
                  أخيراً: أعلن أن موطني الأم هو <strong>{will.domicileCountry || "المملكة المتحدة"}</strong>
                </p>
                <p>
                  وأني مقيم في دولة الإمارات العربية المتحدة في وقت كتابتي لهذه الوصية.
                </p>
              </div>
            </div>

            {/* Legal Accuracy Confirmation */}
            <div className="grid grid-cols-2 divide-x divide-[#E5E0D8] border-b border-[#E5E0D8] bg-gray-50/50">
              <div className="p-4 font-serif text-xs sm:text-sm leading-relaxed text-gray-800">
                I confirm that the information contained within this document is true and accurate and I am legally responsible for the information contained herein.
              </div>
              <div className="p-4 font-arabic text-sm sm:text-base leading-loose text-gray-800" dir="rtl">
                تم اعداد هذه الوصية بمعرفتي وأقر بمسؤوليتي القانونية عن صحة كافة البيانات الواردة فيها.
              </div>
            </div>

            {/* Testator Signature Block */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[#E5E0D8]">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Testator Name / الاسم</p>
                <p className="font-bold text-sm text-[#0B1528] mt-1">{testator.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Passport Number / رقم جواز السفر</p>
                <p className="font-bold text-sm text-[#0B1528] mt-1">{testator.passportNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Emirates ID / رقم الهوية</p>
                <p className="font-bold text-sm text-[#0B1528] mt-1">{testator.emiratesId || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Signature / التوقيع</p>
                <div className="mt-4 border-b border-gray-400 w-48 text-xs text-gray-400">
                  (Signed at ADJD Court)
                </div>
              </div>
            </div>

            {/* Court Attestation Placeholder */}
            <div className="p-5 bg-[#FAF7F2]/60">
              <p className="text-xs font-bold text-[#A37E44] uppercase tracking-wider mb-3">
                To be completed by the Court / للاستكمال من قبل المحكمة:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Name of Attestation Officer</p>
                  <p className="font-arabic text-gray-500" dir="rtl">اسم الموثق</p>
                  <div className="mt-4 border-b border-gray-300 w-full" />
                </div>
                <div>
                  <p className="text-gray-500">Will Registration Number</p>
                  <p className="font-arabic text-gray-500" dir="rtl">رقم تصديق الوصية</p>
                  <div className="mt-4 border-b border-gray-300 w-full" />
                </div>
                <div>
                  <p className="text-gray-500">Signature</p>
                  <p className="font-arabic text-gray-500" dir="rtl">التوقيع</p>
                  <div className="mt-4 border-b border-gray-300 w-full" />
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-arabic text-gray-500" dir="rtl">التاريخ</p>
                  <div className="mt-4 border-b border-gray-300 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ADJDCourtFooter pageNumber={8} />
      </section>
    </article>
  );
}
