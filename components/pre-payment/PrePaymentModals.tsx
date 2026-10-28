"use client";

import React, { useState } from "react";
import { X, ArrowRight, ShieldCheck, Scale, FileText } from "lucide-react";
import { PrePaymentModalType } from "@/types/pre-payment";

interface PrePaymentModalsProps {
  activeModal: PrePaymentModalType;
  onClose: () => void;
  onResumeEmail: (email: string) => void;
}

export function PrePaymentModals({
  activeModal,
  onClose,
  onResumeEmail,
}: PrePaymentModalsProps) {
  const [resumeEmailInput, setResumeEmailInput] = useState("");
  const [resumeError, setResumeError] = useState<string | null>(null);

  if (!activeModal) return null;

  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeEmailInput.trim() || !resumeEmailInput.includes("@")) {
      setResumeError("Please enter a valid email address.");
      return;
    }
    setResumeError(null);
    onResumeEmail(resumeEmailInput.trim().toLowerCase());
  };

  return (
    <div
      className="modalback"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pre-modal">
        {/* Modal 1: Sample Bilingual Will */}
        {activeModal === "sample" && (
          <>
            <div className="pre-modalhead">
              <div>
                <span className="pre-eyebrow text-[10px]">ADJD CIVIL FAMILY COURT TEMPLATE</span>
                <h2>Sample Bilingual Will Format</h2>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#64748B] hover:text-[#0B1528]"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pre-modalbody space-y-5">
              <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-md text-xs text-[#0B1528] leading-relaxed">
                <span className="font-bold text-[#A37E44] block mb-1">
                  Sample — Illustrative Court Format (ADJD-NM1221-06-01)
                </span>
                This illustration demonstrates the official Abu Dhabi Judicial Department (ADJD)
                side-by-side bilingual format. Your personalised draft will reflect the exact names,
                passport details, executors, beneficiaries, and guardian appointments you complete in
                your questionnaire.
              </div>

              <div className="pre-bilingual">
                {/* English Column (dir="ltr") */}
                <div dir="ltr">
                  <div className="text-center font-bold text-sm tracking-wider uppercase mb-4 text-[#0B1528]">
                    THE LAST WILL AND TESTAMENT
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    I, the undersigned, <strong>[TESTATOR FULL LEGAL NAME]</strong>, a national of
                    [Nationality], holder of Passport No. [Passport Number], residing in the United
                    Arab Emirates, of sound mind and memory, do hereby make, publish, and declare
                    this instrument to be my Last Will and Testament.
                  </p>
                  <div className="text-xs font-bold text-[#A37E44] uppercase tracking-wider mt-4 mb-1">
                    SECTION 1 · REVOCATION OF PRIOR WILLS
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    I hereby revoke all previous testamentary dispositions, wills, and codicils made
                    by me concerning my estate and assets situated within the United Arab Emirates.
                  </p>
                  <div className="text-xs font-bold text-[#A37E44] uppercase tracking-wider mt-4 mb-1">
                    SECTION 2 · APPOINTMENT OF EXECUTORS
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    I appoint my trusted executor, <strong>[PRIMARY EXECUTOR NAME]</strong>, to
                    administer my estate in accordance with the laws of the Abu Dhabi Civil Family
                    Court.
                  </p>
                  <div className="text-xs font-bold text-[#A37E44] uppercase tracking-wider mt-4 mb-1">
                    SECTION 3 · APPOINTMENT OF GUARDIANS
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    In the event of my death leaving minor children, I nominate{" "}
                    <strong>[PERMANENT GUARDIAN NAME]</strong> as permanent legal guardian of their
                    persons and property.
                  </p>
                </div>

                {/* Arabic Column (dir="rtl") */}
                <div className="arabic" dir="rtl">
                  <div className="text-center font-bold text-sm tracking-wider mb-4 text-[#0B1528]">
                    الوصية الأخيرة والإعلان النهائي
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    أنا الموقع أدناه، <strong>[اسم الموصي الكامل]</strong>، من مواطني [الجنسية]،
                    وحامل جواز سفر رقم [رقم جواز السفر]، والمقيم في دولة الإمارات العربية المتحدة،
                    وبكامل قواي العقلية وإرادتي المعتبرة قانوناً، أقر وأعلن بأن هذه الوثيقة هي
                    وصيتي الأخيرة.
                  </p>
                  <div className="text-xs font-bold text-[#A37E44] mt-4 mb-1">
                    البند الأول · إلغاء الوصايا السابقة
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    أعلن بموجب هذا إلغاء كافة الوصايا والترتيبات السابقة الصادرة مني فيما يخص
                    أموالي وأصولي الكائنة داخل دولة الإمارات العربية المتحدة.
                  </p>
                  <div className="text-xs font-bold text-[#A37E44] mt-4 mb-1">
                    البند الثاني · تعيين المنفذين
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    أعين بموجبه <strong>[اسم منفذ الوصية]</strong> منفذاً شرعياً وقانونياً لهذه
                    الوصية وفقاً لقوانين محكمة الأسرة المدنية في أبوظبي.
                  </p>
                  <div className="text-xs font-bold text-[#A37E44] mt-4 mb-1">
                    البند الثالث · تعيين الأوصياء
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    في حال وفاتي تاركاً أبناءً قُصراً، أعين بموجبه{" "}
                    <strong>[اسم الوصي الدائم]</strong> وصياً قانونياً دائماً على أشخاصهم وأموالهم.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button type="button" className="pre-btn primary" onClick={onClose}>
                  Close sample
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal 2: Pre-Payment Help */}
        {activeModal === "help" && (
          <>
            <div className="pre-modalhead">
              <div>
                <span className="pre-eyebrow text-[10px]">HELP & CLARIFICATIONS</span>
                <h2>Before You Pay</h2>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#64748B] hover:text-[#0B1528]"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pre-modalbody space-y-4">
              <div className="p-4 bg-white border border-[#E5E0D8] rounded-lg">
                <h3 className="text-sm font-bold text-[#0B1528] mb-1">
                  Do I need to have all my documents ready today?
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  No. You only need your basic contact details to get started. You can upload your
                  passport and Emirates ID scans later inside the secure questionnaire.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E5E0D8] rounded-lg">
                <h3 className="text-sm font-bold text-[#0B1528] mb-1">
                  How does the ADJD court fee work?
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  The OWA service fee covers preparation, legal translation into Arabic, in-app
                  support, and pre-filing compliance checks. The official ADJD registration fee
                  (AED 950 per Will) is paid directly to the Abu Dhabi Judicial Department via
                  their court portal when your application is formally submitted.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#E5E0D8] rounded-lg">
                <h3 className="text-sm font-bold text-[#0B1528] mb-1">
                  Can I prepare a Will if I live in Dubai or another Emirate?
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Yes. Under UAE Federal Law, wills registered with the ADJD Non-Muslim Civil Family
                  Court apply to assets situated throughout all seven Emirates of the UAE.
                </p>
              </div>

              <div className="flex justify-end pt-3">
                <button type="button" className="pre-btn primary" onClick={onClose}>
                  Got it, thank you
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal 3: Service Terms */}
        {activeModal === "terms" && (
          <>
            <div className="pre-modalhead">
              <div>
                <span className="pre-eyebrow text-[10px]">LEGAL AGREEMENT</span>
                <h2>Service Terms & Conditions</h2>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#64748B] hover:text-[#0B1528]"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pre-modalbody space-y-4 text-xs text-[#64748B] leading-relaxed">
              <p>
                <strong>1. Scope of Services:</strong> Online Wills Advisor (OWA) provides digital
                preparation, phonetic Arabic transliteration, and procedural review for Non-Muslim
                Wills intended for submission to the Abu Dhabi Judicial Department (ADJD) Civil
                Family Court.
              </p>
              <p>
                <strong>2. Court Authority:</strong> OWA is an independent legal preparation platform
                and document service provider. Final approval, registration, and issuance of the
                attested Will certificate is solely the jurisdiction of the ADJD Civil Family Court.
              </p>
              <p>
                <strong>3. Transparent Court Fees:</strong> Official court registration fees (AED 950
                per Will) are statutory fees payable directly to ADJD and are not collected by OWA.
              </p>
              <p>
                <strong>4. Revisions & Amendments:</strong> Customers may edit their information and
                regenerate drafts without charge until the final review and court submission stage.
              </p>
              <div className="flex justify-end pt-3">
                <button type="button" className="pre-btn primary" onClick={onClose}>
                  I Understand
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal 4: Privacy Policy */}
        {activeModal === "privacy" && (
          <>
            <div className="pre-modalhead">
              <div>
                <span className="pre-eyebrow text-[10px]">DATA PROTECTION</span>
                <h2>Privacy & Security Policy</h2>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#64748B] hover:text-[#0B1528]"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pre-modalbody space-y-4 text-xs text-[#64748B] leading-relaxed">
              <p>
                <strong>Bank-Grade Encryption:</strong> All personal data, identity documents, and
                asset details are encrypted in transit via TLS 1.3 and at rest with AES-256
                encryption.
              </p>
              <p>
                <strong>Strict Confidentiality:</strong> Your information is accessed solely to
                generate your ADJD legal document and perform verification. We never sell or share
                your data with commercial third parties.
              </p>
              <p>
                <strong>Document Retention:</strong> Following successful court registration, document
                copies may be archived or deleted upon customer request in compliance with UAE data
                protection regulations.
              </p>
              <div className="flex justify-end pt-3">
                <button type="button" className="pre-btn primary" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal 5: Resume Application */}
        {activeModal === "resume" && (
          <>
            <div className="pre-modalhead">
              <div>
                <span className="pre-eyebrow text-[10px]">CONTINUE APPLICATION</span>
                <h2>Resume Saved Application</h2>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#F4EFEA] text-[#64748B] hover:text-[#0B1528]"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pre-modalbody">
              <p className="text-xs text-[#64748B] mb-4">
                Enter the email address you used for your Will preparation. We will check for your
                saved draft on this browser or take you directly to your application dashboard.
              </p>
              <form onSubmit={handleResumeSubmit} className="space-y-4">
                <div className="pre-field">
                  <label htmlFor="resume-email">Your email address</label>
                  <input
                    id="resume-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resumeEmailInput}
                    onChange={(e) => setResumeEmailInput(e.target.value)}
                    autoFocus
                  />
                </div>

                {resumeError && (
                  <div className="text-xs text-[#9F3431] bg-[#FFF2F1] p-2.5 rounded border border-[#EDC8C5]">
                    {resumeError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" className="pre-btn text-xs" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="pre-btn primary text-xs">
                    <span>Look up application</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
