import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Scale, FileText, CheckCircle2 } from "lucide-react";
import { OwaFooter } from "@/components/common/OwaFooter";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Service Terms & Refund Policy | Online Wills Advisor",
  description:
    "Official terms of service, legal consultancy disclosure, and refund policy for Online Wills Advisor, operated by SP LEGAL FZ LLC.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0B1528] flex flex-col justify-between selection:bg-[#E5D7C5] selection:text-[#0B1528]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8C6D41] hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-[#E5E0D8] pb-8 mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C6D41] block mb-2 font-mono">
            LEGAL TERMS & CONDITIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1528] tracking-tight">
            Service Terms & Refund Policy
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-2xl leading-relaxed">
            Effective Date: November 2026 · SP LEGAL FZ LLC, Licensed Legal Consultancy (Fujairah, UAE).
          </p>
        </div>

        {/* Main Content Articles */}
        <div className="prose prose-slate max-w-none space-y-10 text-[14.5px] leading-relaxed text-[#2B3445]">
          {/* Article 1: Entity & Licensing */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0B1528]">
              <Scale className="w-5 h-5 text-[#8C6D41]" />
              <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
                1. Operating Entity & Scope of Service
              </h2>
            </div>
            <p>
              <strong>Online Wills Advisor</strong> (&ldquo;OWA&rdquo;) is an online legal technology and document preparation platform operated by <strong>SP LEGAL FZ LLC</strong>, a legal consultancy duly registered and licensed in the Emirate of Fujairah, United Arab Emirates.
            </p>
            <p>
              OWA facilitates the preparation, verification, and bilingual formatting of court-ready Non-Muslim Wills under <strong>Abu Dhabi Law No. 14 of 2021</strong> (Civil Personal Status Law for Non-Muslims) and the official procedural guidelines of the <strong>Abu Dhabi Judicial Department (ADJD) Civil Family Court</strong> form reference <code>ADJD-NM1221-06-01</code>.
            </p>
            <p>
              Every completed questionnaire and draft Will is reviewed by a qualified legal consultant prior to filing. OWA does not act as a court, judicial authority, or notary public; official attestation and registration are performed exclusively by the Abu Dhabi Judicial Department.
            </p>
          </section>

          {/* Article 2: Two-Milestone Pricing Structure */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0B1528]">
              <FileText className="w-5 h-5 text-[#8C6D41]" />
              <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
                2. Fee Schedule & Pricing Transparency
              </h2>
            </div>
            <p>
              Our pricing model separates the document preparation fee from mandatory statutory court fees for total financial transparency:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Stage 1 (OWA Preparation & Legal Review Fee):</strong> Payable upon initial checkout on our platform via secure Nomod checkout (collected by Juris Zone Corporate Services Provider (CSP) CO. LLC).
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li>Individual Will: <strong>AED 999</strong></li>
                  <li>Wills for Couples (Two mirror wills): <strong>AED 1,799</strong></li>
                </ul>
                This fee covers interactive questionnaire access, AI-assisted OCR document reading, side-by-side bilingual Arabic-English draft generation, phonetic transliteration verification, and legal specialist review.
              </li>
              <li>
                <strong>Stage 2 (ADJD Official Court Registry Fee):</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li>Individual Will: <strong>AED 950</strong> per Will</li>
                  <li>Wills for Couples: <strong>AED 1,900</strong> for two Wills</li>
                </ul>
                This statutory fee is paid directly to the Abu Dhabi Judicial Department court registry. OWA guides and facilitates this payment at the time of court submission.
              </li>
              <li>
                <strong>Total All-Inclusive Cost:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li>Individual Will: AED 999 + AED 950 = <strong>AED 1,949</strong></li>
                  <li>Wills for Couples: AED 1,799 + AED 1,900 = <strong>AED 3,699</strong></li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Article 3: Refund & Cancellation Policy */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0B1528]">
              <Shield className="w-5 h-5 text-[#8C6D41]" />
              <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
                3. Refund & Cancellation Terms
              </h2>
            </div>
            <p>
              We stand behind the quality of our legal preparation service. The following refund policy applies to all clients:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>100% Full Refund:</strong> If you request a cancellation prior to completing Section 5 of the questionnaire or before your first bilingual draft is generated, you will receive a full 100% refund of the OWA preparation fee, no questions asked.
              </li>
              <li>
                <strong>Post-Draft Generation:</strong> Once your bilingual English/Arabic draft has been generated and submitted for legal specialist review, document preparation services have been rendered. In such cases, fees are non-refundable except in the unlikely event that our legal team cannot generate a court-compliant draft due to technical or jurisdictional limitations.
              </li>
              <li>
                <strong>ADJD Court Rejection Guarantee:</strong> If the Abu Dhabi Judicial Department rejects your Will due to a drafting or procedural error on our platform, we will rectify the document and resubmit it at zero additional cost, or issue a full refund of our service fee.
              </li>
            </ul>
          </section>

          {/* Article 4: User Eligibility & Statutory Warranties */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
              4. User Eligibility & Statutory Capacity
            </h2>
            <p>
              By utilizing Online Wills Advisor, you warrant and represent that:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>You are at least <strong>21 years of age</strong> (the statutory age of majority under UAE civil law).</li>
              <li>You are of sound mind and acting voluntarily without duress or undue influence.</li>
              <li>You are a non-Muslim expatriate entitled to register a civil will under Abu Dhabi Law No. 14 of 2021.</li>
              <li>All passport, identity, and residential information provided is authentic, truthful, and accurate.</li>
            </ol>
          </section>

          {/* Contact & Legal Notices */}
          <section className="bg-[#FAF7EE] p-6 sm:p-8 rounded-2xl border border-[#E2D5BE] shadow-xs space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#0B1528] m-0">
              5. Legal Inquiries & Notices
            </h2>
            <p className="text-sm text-gray-700">
              Formal inquiries, cancellation requests, or legal notices should be addressed to our legal support team:
            </p>
            <p className="text-sm font-semibold text-[#0B1528]">
              SP LEGAL FZ LLC · Online Wills Advisor<br />
              Email: <a href="mailto:support@onlinewillsadvisor.com" className="text-[#8C6D41] hover:underline">support@onlinewillsadvisor.com</a><br />
              Emirate of Fujairah, United Arab Emirates
            </p>
          </section>
        </div>
      </main>

      <OwaFooter />
    </div>
  );
}

