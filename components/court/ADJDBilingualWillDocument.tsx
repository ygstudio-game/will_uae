import React from "react";
import "./adjd-will.css";
import { awEn, awAr } from "./adjd-fonts";
import { FitToWidth } from "./FitToWidth";
import { ADJDCourtHeader } from "./ADJDCourtHeader";
import { ADJDCourtFooter } from "./ADJDCourtFooter";
import { PersonData, RoleAssignmentData, WillData } from "@/types/owa";

interface Props {
  will: WillData;
  testator: PersonData;
  assignments: RoleAssignmentData[];
}

type P = PersonData | null | undefined;
const cx = (...a: Array<string | false | undefined | null>) => a.filter(Boolean).join(" ");

const fmtDate = (d?: string | null) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
};
const arName = (p: P) => (p ? p.arabicName || p.fullName : "");
const AR_LETTERS = ["أ", "ب", "ج", "د", "هـ"];

/* ------------------------------ primitives ------------------------------ */
function Grid({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  return <div className={cx("aw-grid", wide && "aw-grid--wide")}>{children}</div>;
}

/** One bilingual ruled row: label top, value sits on the line. */
function Row(props: {
  en?: React.ReactNode; ar?: React.ReactNode; enVal?: React.ReactNode; arVal?: React.ReactNode;
  h?: number; pt?: number; bold?: boolean; wide?: boolean; noLineEn?: boolean; noLineAr?: boolean;
}) {
  const { en, ar, enVal, arVal, h = 40, pt, bold, wide, noLineEn, noLineAr } = props;
  const style: React.CSSProperties = { minHeight: `${h}pt`, ...(pt !== undefined ? { paddingTop: `${pt}pt` } : {}) };
  return (
    <Grid wide={wide}>
      <div className={cx("aw-cell", "aw-col-en", bold && "aw-cell--bold", noLineEn && "aw-cell--noline")} style={style}>
        <span className="aw-lbl">{en}</span>
        {enVal ? <span className="aw-val">{enVal}</span> : null}
      </div>
      <div className={cx("aw-cell", "aw-col-ar", bold && "aw-cell--bold", noLineAr && "aw-cell--noline")} style={style}>
        <span className="aw-lbl">{ar}</span>
        {arVal ? <span className="aw-val">{arVal}</span> : null}
      </div>
    </Grid>
  );
}

function Para(props: {
  en?: React.ReactNode; ar?: React.ReactNode; lg?: boolean; bold?: boolean; wide?: boolean;
  pt?: number; pb?: number; italic?: boolean;
}) {
  const { en, ar, lg, bold, wide, pt = 0, pb = 0, italic } = props;
  const style = { paddingTop: `${pt}pt`, paddingBottom: `${pb}pt` };
  const c = cx("aw-p", lg && "aw-p--lg", bold && "aw-p--bold", italic && "aw-it");
  return (
    <Grid wide={wide}>
      <div className={cx("aw-col-en", c)} style={style}>{en}</div>
      <div className={cx("aw-col-ar", c)} style={style}>{ar}</div>
    </Grid>
  );
}

function Li({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="aw-li"><b>{k}</b><span>{children}</span></div>;
}
function LiRow({ en, ar, k, ka, pt = 0 }: { en: React.ReactNode; ar: React.ReactNode; k: string; ka: string; pt?: number }) {
  return (
    <Grid>
      <div className="aw-col-en aw-p" style={{ paddingTop: `${pt}pt` }}><Li k={k}>{en}</Li></div>
      <div className="aw-col-ar aw-p" style={{ paddingTop: `${pt}pt` }}><Li k={ka}>{ar}</Li></div>
    </Grid>
  );
}

function Bar({ en, ar, variant, p1 }: { en: string; ar: string; variant?: "muted" | "light" | "tall"; p1?: boolean }) {
  return (
    <div className={cx("aw-bar", variant === "muted" && "aw-bar--muted", variant === "light" && "aw-bar--light", variant === "tall" && "aw-bar--tall", p1 && "aw-bar--p1")}>
      <span>{en}</span>
      <span className="ar">{ar}</span>
    </div>
  );
}

function Page({ n, first, skyline, children }: { n: number; first?: boolean; skyline?: boolean; children: React.ReactNode }) {
  return (
    <section className={cx("aw-page", first && "aw-page--first")} data-page={n}>
      <div className="aw-page-body" style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <ADJDCourtFooter pageNumber={n} skyline={skyline} />
    </section>
  );
}

/** Person block: bold lead row (name on the line) + born on / passport / Emirates ID (+ optional nationality). */
function PersonBlock(props: {
  p: P; leadEn: React.ReactNode; leadAr: React.ReactNode; h?: number; leadH?: number; leadPt?: number;
  nationality?: boolean; eid?: boolean; dob?: boolean;
}) {
  const { p, leadEn, leadAr, h = 40, leadH = 54, leadPt, nationality, eid = true, dob = true } = props;
  return (
    <>
      <Row bold h={leadH} pt={leadPt} en={leadEn} ar={leadAr} enVal={p?.fullName} arVal={arName(p)} />
      {dob && <Row h={h} en="born on" ar="المولود في" enVal={fmtDate(p?.dob)} arVal={fmtDate(p?.dob)} />}
      {nationality && <Row h={h} en="nationalty" ar="من الجنسية" enVal={p?.nationality} arVal={p?.nationality} />}
      <Row h={h} en="holder of Passport Number" ar="حامل جواز سفر رقم" enVal={p?.passportNumber} arVal={p?.passportNumber} />
      {eid && <Row h={h} en="with UAE Identity Card No (if applicable)" ar="وبطاقة هوية الإمارات رقم (إن وجدت)" enVal={p?.emiratesId} arVal={p?.emiratesId} />}
    </>
  );
}

const pctEn = (letter: string, pct?: number | null) => (
  <>{letter}) As to a (<u>{pct ?? ""}</u> %) percentage share of residue to:</>
);
const pctAr = (letter: string, pct?: number | null) => (
  <>{letter}) نسبة (<u>{pct ?? ""}</u> ٪) بالمائة من حصصي الباقية تؤول إلى:</>
);

/* ------------------------------ document ------------------------------ */
export function ADJDBilingualWillDocument({ will, testator, assignments }: Props) {
  const one = (role: string) => assignments.find((a) => a.role === role)?.person;
  const exec1 = one("EXECUTOR_PRIMARY");
  const exec2 = one("EXECUTOR_SUBSTITUTE");
  const exec3 = one("EXECUTOR_FURTHER");

  const primaries = assignments
    .filter((a) => (a.role === "BENEFICIARY_PRIMARY" || a.role === "BENEFICIARY") && a.person)
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);
  const subs = assignments
    .filter((a) => a.role === "BENEFICIARY_SUBSTITUTE" && a.person)
    .sort((a, b) => a.appointmentOrder - b.appointmentOrder);

  const permG = one("GUARDIAN_PERMANENT");
  const subPermG = one("GUARDIAN_SUBSTITUTE_PERM");
  const tempG = one("GUARDIAN_TEMPORARY");
  const temp2G = one("GUARDIAN_TEMPORARY_SUBSTITUTE"); // optional 2nd interim guardian (see README)
  // Only minor children under 18 require court guardianship appointments (Clause Nine) under UAE civil family law
  const calcChildAge = (dobString?: string | null): number | null => {
    if (!dobString) return null;
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };
  const minorChildren = assignments
    .filter((a) => a.role === "CHILD" && a.person)
    .map((a) => a.person!)
    .filter((p) => {
      const age = calcChildAge(p.dob);
      return age === null || age < 18;
    });
  const childSlots: P[] = Array.from({ length: Math.max(3, minorChildren.length) }, (_, i) => minorChildren[i]);

  return (
    <div className={cx("aw-root", awEn.variable, awAr.variable)}>
      <FitToWidth>
        {/* =============================== PAGE 1 =============================== */}
        <Page n={1} first>
          <ADJDCourtHeader />
          <div className="aw-card" style={{ marginTop: 2.9 + "pt", paddingTop: "9.3pt" }}>
            <Row wide h={49.9} en="I," ar="أنا" enVal={testator.fullName} arVal={testator.arabicName || testator.fullName} />
            <Row wide h={49.9} en="nationality" ar="احمل الجنسية" enVal={testator.nationality} arVal={testator.nationality} />
            <Row wide h={49.9} en="born on" ar="مولود في" enVal={fmtDate(testator.dob)} arVal={fmtDate(testator.dob)} />
            <Row wide h={49.9} en="holder of Passport Number" ar="أحمل جواز سفر رقم" enVal={testator.passportNumber} arVal={testator.passportNumber} />
            <Row wide h={49.9} en="with UAE Identity Card No (if applicable)" ar="بطاقة هوية الإمارات رقم (إن وجدت)" enVal={testator.emiratesId} arVal={testator.emiratesId} />
            <Row wide h={49.9} en="residing at" ar="عنواني في دولة الإمارات العربية المتحدة" enVal={testator.address} arVal={testator.address} />
            <Para wide lg bold pt={17} pb={26}
              en="In order to settle the succession of my estate upon my death do provide as follows, namely:"
              ar="أكتب هذه الوصية من أجل وراثة ممتلكاتي بعد وفاتي، وذلك حسب الشروط والأحكام التالية، تحديداً:" />
          </div>

          <div className="aw-card">
            <Bar p1 variant="muted" en="ONE: Declaration" ar="أولاً: اقرار" />
            <Para wide lg pt={14} pb={14}
              en="Being of sound mind and memory and over the age of twenty-one (21) years and not being actuated by duress, fraud, mistake, or undue influence, do hereby make, publish, and declare that this Will, including the revocation provision hereinafter contained, is made for the purpose of settling my properties situated or arising in the UNITED ARAB EMIRATES only. Any Wills or codicils made prior to this Will, relating to my estate in UAE are now cancelled."
              ar="أكتب وصيتي هذه بمحض إرادتي وأنا بكامل قواي العقلية وبذاكرة سليمة، وفي سن تعدت الحادي والعشرين (21) عاماً، ومن دون أن أتعرض لأي نوع من الإكراه أو التأثير غير المشروع أو أن يكون لدي نية في الاحتيال أو بارتكاب أي خطأ، أقر وأعلن بموجبه أن وصيتي هذه هي لغرض توزيع ممتلكاتي الموجودة أو الناشئة في دولة الإمارات العربية المتحدة (إ.ع.م) فقط، وأي وصايا كتبتها أو عدلتها قبل هذه الوصية في دولة الإمارات العربية المتحدة (إ.ع.م.) تعتبر لاغية." />
          </div>
        </Page>

        {/* =============================== PAGE 2 =============================== */}
        <Page n={2}>
          <div className="aw-card">
            <Bar en="TWO: Appointment of Executors and Trustees" ar="ثانياً: تعيين منفذي الوصية" />
            <PersonBlock p={exec1} leadEn="a) I appoint" leadAr="أ) أعيّن" leadH={54} leadPt={20} />
            <Para pt={11} pb={14}
              en="to be my executor and trustee, but if he /she is unable or unwilling to act or if he/she dies before proving my Will, the following provision shall apply instead."
              ar="ليكون المنفّذ والوصيّ على وصيتي، وإذا كان غير قادر أو غير راغب في ذلك أو إذا مات قبل تنفيذ وصيتي، يُطبّق البند التالي بدلاً من ذلك." />
            <PersonBlock p={exec2} leadEn="b) I appoint" leadAr="ب) أعيّن" leadH={50} leadPt={16} />
            <Row h={40} pt={10} noLineEn noLineAr en="to act as my substitute executor and trustee." ar="للتصرف كالمنفذ على وصيتي." />
            <LiRow k="c)" ka="ج)" pt={4}
              en="If all of the above appointed executors and trustees die before proving my Will, I revoke their appointments and I make the following further appointment instead."
              ar="في حال وفاة كل المنفذين المذكورين أعلاه قبل تنفيذ وصيتي، أعين المذكور أدناه عوضاً عن ذلك." />
            <div style={{ height: "10pt" }} />
            <PersonBlock p={exec3} leadEn="d) I appoint" leadAr="د) أعيّن" leadH={46} leadPt={14} />
            <Row h={42} pt={14} noLineEn noLineAr en="to act as my substitute executor and trustee." ar="للتصرف كالمنفذ على وصيتي." />
          </div>
        </Page>

        {/* =============================== PAGE 3 =============================== */}
        <Page n={3}>
          <div className="aw-card">
            <Bar variant="tall" en="THREE: Debts and Funeral Expenses" ar="ثالثاً: الديون ومصاريف الدفن" />
            <div style={{ minHeight: "96pt" }}>
              <Para wide lg pt={22} en="I direct my trustees to make payment of my lawful debts and funeral expenses and of the expenses of winding up my estate." ar="أوجه أوصيائي بأداء ديوني القانونية ونفقات جنازتي ونفقات تصفية تركتي." />
            </div>
          </div>
          <div className="aw-card">
            <Bar variant="tall" en="FOUR: Letter of Wishes" ar="رابعاً: خطاب الرغبات" />
            <div style={{ minHeight: "155pt" }}>
              <Para wide lg pt={24} en="I direct my trustees to give effect to any writings granted by me, however informal they may be, provided they are signed by me, dated after the date hereof and are clearly expressive of my intention, as to which my trustees shall be the sole judges." ar="أوجه أوصيائي بتنفيذ أي تفويضات قمت بإصدارها مهما كانت غير رسمية، على أن تكون موقعة من طرفي، وتحمل تاريخاً لاحقاً لتاريخ هذه الوصية وتفصح بوضوح عن نيتي والتي سيكون أوصيائي هم الوحيدون المخول لهم الحكم بشأنها." />
            </div>
          </div>
          <div className="aw-card">
            <Bar variant="tall" en="FIVE: Jurisdiction" ar="خامساً: القانون" />
            <div style={{ minHeight: "144pt" }}>
              <Grid wide>
                <div className="aw-col-en aw-p aw-p--lg" style={{ paddingTop: "22pt" }}>
                  <Li k="a)">The laws of the United Arab Emirates (UAE) applies.</Li>
                  <Li k="b)">The substantive provisions governing testamentary disposition and other dispositions taking effect after my death shall govern the provisions of this Will.</Li>
                </div>
                <div className="aw-col-ar aw-p aw-p--lg" style={{ paddingTop: "22pt" }}>
                  <Li k="أ)">تطبق قوانين دولة الامارات العربية المتحدة.</Li>
                  <Li k="ب)">والأحكام الموضوعية التي تحكم التصرفات المتعلقة بالوصايا والتصرفات الأخرى التي قد تصبح نافذة بعد وفاتي.</Li>
                </div>
              </Grid>
            </div>
          </div>
          <div className="aw-card">
            <Bar variant="tall" en="SIX: Entitlements of Insurance Proceeds" ar="سادساً: مستحقات إيرادات التأمين" />
            <div style={{ minHeight: "133pt" }}>
              <Para wide lg pt={22} en="I direct my trustees that all proceeds from any insurance policies shall be distributed according to the existing nomination/beneficiary form completed by me and in the absence of such form, the following beneficiary provisions of this Will shall apply instead." ar="أوجه أوصيائي بأن يتم توزيع جميع الإيرادات المتأتية من أي بوالص تأمين وفق نموذج المستفيدين القائم والمعبأ من قبلي. وفي حال عدم وجود هذا النموذج تنطبق بنود الانتفاع التالية المذكورة في هذه الوصية بدلاً من ذلك." />
            </div>
          </div>
        </Page>

        {/* =============================== PAGE 4 =============================== */}
        <Page n={4}>
          <div className="aw-card aw-card--tight">
            <Bar en="SEVEN: Distribution of My Estate Proceeds" ar="سابعاً: توزيع تركتي" />
            <Para pt={11} pb={10}
              en="I direct my trustees to make over the whole residue and remainder of my means and estate, moveable and immoveable properties, all financial assets including but not limited to bank accounts, including savings, current and fixed deposits and any other accounts, motorcycles, motor cars, art and antiques, jewels, jewellery, furniture and fixtures, debentures, leasehold, bonds, security lockers, stocks, shares, investments, inheritance, mutual funds, capital, death in service benefits, gratuity payments, reserves, all insurance policies and any shareholding in any companies and any other assets to the following:"
              ar="أوجه أوصيائي بأن يحولوا كل الباقي من أموالي وممتلكاتي، المنقولة وغير المنقولة وكافة الأصول المالية بما في ذلك على سبيل المثال لا الحصر الحسابات المصرفية متضمنة حسابات التوفير والودائع وأي حسابات أخرى والدراجات النارية والسيارات والقطع الفنية والأثرية والحلي والمجوهرات والأثاث والتجهيزات وسندات الدين وأثمان الإيجار والصكوك وخزائن الإيداع الآمن والسندات والأسهم والاستثمارات والتركات وصناديق الاستثمار ورؤوس الأموال وتعويضات الوفاة على رأس العمل ومكافآت نهاية الخدمة والمدخرات وجميع تعويضات بوالص التأمين وأي حصص في أي شركات وأي أصول أخرى بشكل مطلق إلى:" />
            {primaries.length <= 1 ? (
              <PersonBlock p={primaries[0]?.person} leadEn="Beneficiary" leadAr="الموصى له" leadH={42.5} leadPt={9} h={42.5} />
            ) : (
              primaries.map((b, i) => (
                <PersonBlock key={b.id} p={b.person} h={42.5} leadH={42.5} leadPt={9}
                  leadEn={pctEn(String.fromCharCode(97 + i), b.sharePercentage)}
                  leadAr={pctAr(AR_LETTERS[i], b.sharePercentage)} />
              ))
            )}
            <div style={{ height: "20pt" }} />
          </div>

          <div className="aw-card">
            <Row bold h={56.7} pt={20} en="If the above beneficiary" ar="في حال أن الموصى له أعلاه" />
            <Para pt={4} pb={6}
              en="does not survive me, but in such event only, I direct my trustees to make over the whole residue and remainder of my means and estate in the following manner:"
              ar="لم يبق على قيد الحياة من بعدي، وفي هذه الحالة فقط، فإني أوجه أوصيائي بأن يحولوا كل الباقي من أموالي وممتلكاتي على النحو التالي:" />
            <Row bold h={44.5} pt={9} en={pctEn("a", subs[0]?.sharePercentage)} ar={pctAr("أ", subs[0]?.sharePercentage)} enVal={subs[0]?.person?.fullName} arVal={arName(subs[0]?.person)} />
            <Row h={42.5} en="born on" ar="المولود في" enVal={fmtDate(subs[0]?.person?.dob)} arVal={fmtDate(subs[0]?.person?.dob)} />
            <Row h={42.5} en="holder of Passport Number" ar="حامل جواز سفر رقم" enVal={subs[0]?.person?.passportNumber} arVal={subs[0]?.person?.passportNumber} />
            <Para pt={11} pb={22}
              en="(and in the event of her/him not surviving me or failing to take a vested interest, then to her/his children as shall survive me to share equally among them if more than one)."
              ar="(وفي حال لم يبقى على قيد الحياة من بعدي أو رفض قبول ما آل إليه بالوصية، فعندئذ تؤول الحصة إلى أبنائه/ها، إذا عاشوا من بعدي، تقسم بينهم بأنصبة متساوية إذا زاد عددهم عن واحد)." />
          </div>
        </Page>

        {/* =============================== PAGE 5 =============================== */}
        <Page n={5}>
          <div className="aw-card aw-card--tight" style={{ marginTop: "-1.3pt" }}>
            <Row bold h={52} pt={12} en={pctEn("b", subs[1]?.sharePercentage)} ar={pctAr("ب", subs[1]?.sharePercentage)} enVal={subs[1]?.person?.fullName} arVal={arName(subs[1]?.person)} />
            <Row h={40} en="born on" ar="المولود في" enVal={fmtDate(subs[1]?.person?.dob)} arVal={fmtDate(subs[1]?.person?.dob)} />
            <Row h={42} en="holder of Passport Number" ar="حامل جواز سفر رقم" enVal={subs[1]?.person?.passportNumber} arVal={subs[1]?.person?.passportNumber} />
            <LiRow k="c)" ka="ج)" pt={13} en="If any part of the residue of my estate falls to a beneficiary who has not attained the age of twenty-one (21) years, my trustees shall hold the same in trust for this beneficiary until the age of twenty-one (21) years is attained." ar="في حال أيلولة أي جزء من باقي ممتلكاتي إلى منتفع لم يبلغ سن الحادي والعشرين (21) عاماً يحتفظ أوصيائي بذلك الجزء كأمانة لصالح ذلك المستفيد لحين بلوغه سن الحادي والعشرين (21) عاماً." />
            <LiRow k="d)" ka="د)" en="Income arising from such share shall be accumulated but my trustees may apply all or part of the income or capital of this share for the maintenance, education or benefit of this beneficiary." ar="يتم حفظ الدخل الناشئ عن مثل هذه الحصة تراكمياً، ومع ذلك يجوز لمنفذي وصيتي استخدام كل هذا الدخل/ رأس المال أو بعض منه من أجل إعالة ذلك المنتفع وتعليمه وتحقيق مصالحه." />
            <LiRow k="e)" ka="هـ)" en="In the event of any of the foregoing shares of the residue remain indisposed of by the preceding provisions, such share shall be distributed to the other beneficiaries pro rata according to their shares." ar="في حال بقاء أي من الحصص المذكورة أعلاه من باقي ممتلكاتي بدون توزيع بموجب البنود السابقة، يتم توزيع تلك الحصص إلى المنتفعين الآخرين تناسبياً وفقاً لحصة كل منهم." />
            <div style={{ height: "6pt" }} />
          </div>

          <div className="aw-card">
            <Bar variant="light" en="EIGHT: Powers of Executors and Trustees" ar="ثامناً: صلاحيات منفذي الوصية" />
            <Para pt={14} pb={10} en="If any part of my estate is held for a beneficiary who lacks full legal capacity, my trustees shall have the following powers:-" ar="في حال أيلولة أي جزء من تركتي لصالح منتفع يفتقر للأهلية القانونية الكاملة، فسيكون لأوصيائي الصلاحيات التالية:" />
            <LiRow k="a)" ka="أ)" en="To pay or apply any part of the income or capital falling to that beneficiary for his or her benefit in any manner my trustees think proper." ar="أداء أو استخدام أي جزء من الإيراد أو رأس المال الآيل لذلك المنتفع لما فيه مصلحته أو مصلحتها بالطريقة التي يراها أوصيائي مناسبة." />
            <LiRow k="b)" ka="ب)" en="To retain the same until such capacity is attained, accumulating income with capital." ar="الإبقاء على ذلك الجزء إلى حين بلوغه الأهلية المطلوبة مع إضافة الإيراد إلى رأس المال." />
            <LiRow k="c)" ka="ج)" en="To pay over the same to the legal guardian or the person for the time being having the custody of that beneficiary, whose receipt shall be a sufficient discharge to my trustees." ar="أداء الجزء المذكور إلى الوصي الشرعي أو الشخص الذي له حق الوصاية على ذلك المنتفع في تلك المرحلة، وسيكون في الإيصال الصادر عن أي منهما إبراء كافياً لذمة أوصيائي." />
            <LiRow k="d)" ka="د)" en="My trustees shall have the fullest powers of retention, realisation, investment, appropriation, transfer of property without consideration, and management of my estate as if they were absolute owners and not trustees, however all proceeds are for the interest of the beneficiaries only." ar="لأوصيائي الصلاحية المطلقة للاحتفاظ بممتلكاتي أو بيعها أو استثمارها أو تخصيصها لغرض بعينه، أو تحويل ملكيتها دون تقاضي أي أتعاب، وإدارة تركتي كما لو كانوا يملكونها بشكل مطلق وليسوا أوصياء عليها؛ ومع ذلك، تبقي كافة الإيرادات لصالح المنتفعين فقط بما يحقق مصلحتهم." />
            <LiRow k="e)" ka="هـ)" en="My trustees may appoint one or more executor of their own number to act as solicitor or agent in any other capacity and allow that trustee the same remuneration, as to which that trustee would have been entitled to if such appointment is made." ar="يمكن لأوصيائي تعيين واحد منهم أو أكثر ليكون محامياً أو وكيلاً بأي صفة أخرى وتخصيص نفس الراتب لذلك الوصي الذي كان يحق له أن يحصل عليه إذا ما تم توكيل غيره." />
            <div style={{ height: "6pt" }} />
          </div>
        </Page>

        {/* =============================== PAGE 6 =============================== */}
        <Page n={6}>
          <div className="aw-card">
            <Bar en="NINE: Guardianship Appointments (if applicable)" ar="تاسعاً: تعيينات الوصاية" />
            <PersonBlock p={permG} nationality eid={false} h={38.6} leadH={49} leadPt={15} leadEn="Upon my demise, I appoint" leadAr="يُعين بعد وفاتي:" />
            <Para pt={11} pb={20} en="to act as permanent guardian of my child/ren as follows:" ar="ليكون الوصيّ الدائم على ولدي/ أولادي المذكورين أدناه:" />
            {childSlots.map((c, i) => (
              <div key={c?.id ?? `slot-${i}`} style={i > 0 ? { marginTop: "13.5pt" } : undefined}>
                <Row bold h={39} pt={13} en={`${i + 1}. My child named`} ar={`${i + 1}. ابني / ابنتي`} enVal={c?.fullName} arVal={arName(c)} />
                <Row h={38.6} en="born on" ar="المولود في" enVal={fmtDate(c?.dob)} arVal={fmtDate(c?.dob)} />
                <Row h={38.6} en="nationalty" ar="من الجنسية" enVal={c?.nationality} arVal={c?.nationality} />
                <Row h={38.6} en="holder of Passport Number" ar="حامل جواز سفر رقم" enVal={c?.passportNumber} arVal={c?.passportNumber} />
              </div>
            ))}
            <div style={{ height: "6pt" }} />
          </div>
        </Page>

        {/* =============================== PAGE 7 =============================== */}
        <Page n={7}>
          <div className="aw-card">
            <Para pt={11} en="In the event of him/her predeceasing me or being unable or unwilling to act, then;" ar="وفي حال توفي قبلي أو كان غير قادر أو غير راغب في التصرف بهذه الصفة، عندئذ" />
            <PersonBlock p={subPermG} eid={false} h={37.4} leadH={40} leadPt={13} leadEn="I appoint" leadAr="أعيّن" />
            <Para pt={10} pb={6} en="to act as the permanent guardian of my child/ren, if they are under the age of full capacity at the time of my death." ar="ليكون الوصيّ الدائم على ولدي/ أولادي، إذا كانوا تحت سن الأهلية القانونية الكاملة عند وفاتي." />
            <Para pb={6} en="However, if the appointed permanent guardian mentioned above is unable to act and take the custody of my child/ren for the interim period only, then;" ar="ولكن، إذا كان الأوصياء الدائمون المعيّنون المذكورون أعلاه غير قادرين على التصرّف وتولي ولاية ولدي/أولادي للفترة الانتقالية فقط، عندئذ؛" />
            <PersonBlock p={tempG} nationality h={37.4} leadH={40} leadPt={13} leadEn="I appoint" leadAr="أعيّن" />
            <Para pt={10} pb={6} en="to act as the interim guardian of my child/ren, and in the event of her/him predeceasing me or being unable or unwilling to act" ar="ليكون الوصيّ المؤقت على ولدي/ أولادي، وفي حال وفاة هذا الوصي قبلي أو كان غير قادر أو غير راغب في التصرف بهذه الصفة،" />
            <PersonBlock p={temp2G} nationality h={37.4} leadH={40} leadPt={13} leadEn="I then appoint" leadAr="عندئذ، أعيّن" />
            <Para pt={10} pb={4} en="to act as interim guardian of my child/ren." ar="ليكون الوصيّ المؤقت على ولدي/ أولادي." />
            <Para pb={18} en="This interim guardianship appointment will apply until the permanent guardians will be able to act and take over the custody of my child/ren." ar="ويسري هذا التعيين للوصاية المؤقتة إلى أن يتمكن الأوصياء الدائمون التصرف وتولي ولاية ولدي/ أولادي." />
          </div>
        </Page>

        {/* =============================== PAGE 8 =============================== */}
        <Page n={8} skyline>
          <div className="aw-card">
            <Bar en="TEN: Execution and Attestation" ar="عاشراً: الإشهاد والتنفيذ" />
            <Row bold h={62} pt={20} en="Finally: I declare that my country of domicile is" ar="أخيراً: أعلن أنّ موطني الأمّ هو" enVal={will.domicileCountry || ""} arVal={will.domicileCountry || ""} />
            <Para pt={4} pb={6} en="and I am residing in the United Arab Emirates at the time of writing this Will." ar="وأنّي مقيم في دولة الإمارات العربية المتحدة في وقت كتابتي لهذه الوصية." />
            <Para bold pt={10} pb={8} en="Iconfirm that the information contained within this document is true and accurate and I am legally responsible for the information contained herein." ar="تم اعداد هذه الوصية بمعرفتي وأقر بمسؤوليتي القانونية عن صحة كافة البيانات الواردة فيها." />
            <Row h={47} en="Name" ar="الاسم" enVal={testator.fullName} arVal={testator.arabicName || testator.fullName} />
            <Grid>
              <div className="aw-cell aw-col-en" style={{ minHeight: "52pt" }}>
                <span className="aw-lbl aw-split"><span>Emirates ID number</span><span className="ar">رقم الهوية الإماراتية</span></span>
                {testator.emiratesId ? <span className="aw-val">{testator.emiratesId}</span> : null}
              </div>
              <div className="aw-cell aw-cell--noline aw-col-en" style={{ minHeight: "52pt", direction: "ltr" }}>
                <span className="aw-lbl aw-split"><span>Passport number</span><span className="ar">رقم جواز السفر</span></span>
                {testator.passportNumber ? <span className="aw-val">{testator.passportNumber}</span> : null}
              </div>
            </Grid>
            {(() => {
              const effectiveSignature =
                testator.signatureDataUrl ||
                (typeof window !== "undefined"
                  ? localStorage.getItem(`owa_signature_${testator.id}`) ||
                    localStorage.getItem("owa_signature_latest")
                  : null);
              return (
                <Grid>
                  <div className="aw-cell aw-cell--noline" style={{ minHeight: "48pt" }} />
                  <div className="aw-cell aw-col-en" style={{ minHeight: "60pt", direction: "ltr" }}>
                    <span className="aw-lbl aw-split"><span>Signature</span><span className="ar">التوقيع</span></span>
                    {effectiveSignature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="aw-sig" src={effectiveSignature} alt="Testator signature" />
                    ) : null}
                  </div>
                </Grid>
              );
            })()}

            <div style={{ height: "38pt" }} />
            <Row bold h={30} pt={4} noLineEn noLineAr en="To be completed by the Court:" ar="للاستكمال من قبل المحكمة :" />
            <Grid>
              <div className="aw-cell aw-col-en" style={{ minHeight: "50pt" }}><span className="aw-lbl aw-split"><span>Name of Attestation Officer</span><span className="ar">اسم الموثق</span></span></div>
              <div className="aw-cell aw-col-en" style={{ minHeight: "50pt" }}><span className="aw-lbl aw-split"><span>Will Registration Number</span><span className="ar">رقم تصديق الوصية</span></span></div>
            </Grid>
            <Grid>
              <div className="aw-cell aw-col-en" style={{ minHeight: "60pt" }}><span className="aw-lbl aw-split"><span>Signature</span><span className="ar">التوقيع</span></span></div>
              <div className="aw-cell aw-col-en" style={{ minHeight: "60pt" }}><span className="aw-lbl aw-split"><span>Date</span><span className="ar">التاريخ</span></span></div>
            </Grid>
            <div style={{ height: "30pt" }} />
          </div>
        </Page>
      </FitToWidth>
    </div>
  );
}
