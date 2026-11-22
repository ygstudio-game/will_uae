import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2, Database } from "lucide-react";
import { OwaFooter } from "@/components/common/OwaFooter";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Privacy Policy & Data Protection | Online Wills Advisor",
  description:
    "Privacy policy, document encryption standards, and 1-year data retention schedule for Online Wills Advisor (SP LEGAL FZ LLC).",
};

export default function PrivacyPage() {
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
            PRIVACY & DATA PROTECTION
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1528] tracking-tight">
            Privacy Policy & Data Security
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-2xl leading-relaxed">
            Effective Date: November 2026 · Committed to end-to-end encryption, strict confidentiality, and UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection.
          </p>
        </div>

        {/* Privacy Content Sections */}
        <div className="prose prose-slate max-w-none space-y-10 text-[14.5px] leading-relaxed text-[#2B3445]">
          {/* Commitment Summary */}
          <div className="p-5 rounded-2xl bg-[#E8F4EE] border border-[#BCD4C7] flex items-start gap-3.5 text-[#1F5A3D]">
            <Shield className="w-5 h-5 text-[#1F5A3D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-sm font-bold block text-[#1F5A3D]">
                Our Privacy Pledge to UAE Expatriate Families
              </strong>
              <p className="text-xs sm:text-sm text-[#23583D] leading-relaxed">
                Your testamentary wishes, family appointments, and identity scans are among your most sensitive personal affairs. We never sell, rent, monetize, or publicly disclose your data. All records are processed strictly for court document preparation and statutory judicial submission.
              </p>
            </div>
          </div>

          {/* Section 1: Data We Collect */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0B1528]">
              <Database className="w-5 h-5 text-[#8C6D41]" />
              <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
                1. Personal Information We Collect
              </h2>
            </div>
            <p>
              To generate statutory bilingual court documents complying with the Abu Dhabi Judicial Department, we collect only necessary identity and testamentary data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Contact Information:</strong> Full legal name, verified email address, mobile phone number, and physical residential address in the UAE.
              </li>
              <li>
                <strong>Identity Documentation Scans:</strong> Scanned copies of your international passport photo page, UAE Emirates ID (front & back), and proof of address (utility bill or tenancy contract).
              </li>
              <li>
                <strong>Family & Appointed Persons:</strong> Names, dates of birth, nationalities, passport numbers, and roles of executors, legal guardians, and beneficiaries named in your Will.
              </li>
              <li>
                <strong>Authentication Data:</strong> Cryptographically generated one-time security codes (OTP) used to authenticate access to your active application.
              </li>
            </ul>
          </section>

          {/* Section 2: How We Use Your Data */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0B1528]">
              <Lock className="w-5 h-5 text-[#8C6D41]" />
              <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
                2. Processing & Security Architecture
              </h2>
            </div>
            <p>
              All personal and legal records are protected using modern enterprise security standards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Encryption in Transit & at Rest:</strong> All data transmitted between your browser and our infrastructure is encrypted using TLS 1.3. Databases and document attachments are stored with AES-256 encryption at rest.
              </li>
              <li>
                <strong>AI Vision Document Reading (OCR):</strong> When you upload passport or Emirates ID scans, our automated OCR model parses text solely to pre-fill your form fields. Your document scans are never used to train public machine learning models.
              </li>
              <li>
                <strong>Restricted Human Access:</strong> Only licensed legal specialists assigned to verify your application are authorized to review your documents.
              </li>
            </ul>
          </section>

          {/* Section 3: Data Retention Schedule */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-[#0B1528]">
              <Eye className="w-5 h-5 text-[#8C6D41]" />
              <h2 className="font-serif text-xl font-bold text-[#0B1528] m-0">
                3. One-Year Retention & Deletion Schedule
              </h2>
            </div>
            <p>
              In accordance with professional legal record-keeping standards and the UAE Personal Data Protection Law:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Active Applications:</strong> We retain your application data and draft wills for up to <strong>one (1) year</strong> from the date of creation, allowing you to access, review, or update your court records if needed.
              </li>
              <li>
                <strong>Right to Erasure (Data Deletion):</strong> You may request complete deletion of your identity scans, draft wills, and account records at any time by emailing our Data Protection Officer at <code>support@onlinewillsadvisor.com</code>.
              </li>
              <li>
                <strong>Post-Court Attestation:</strong> Once the Abu Dhabi Judicial Department has registered and attested your Will, you may request that OWA archive or purge all working drafts from our systems.
              </li>
            </ul>
          </section>

          {/* Section 4: Contact DPO */}
          <section className="bg-[#FAF7EE] p-6 sm:p-8 rounded-2xl border border-[#E2D5BE] shadow-xs space-y-2">
            <h2 className="font-serif text-lg font-bold text-[#0B1528] m-0">
              4. Data Protection Inquiries
            </h2>
            <p className="text-sm text-gray-700">
              To exercise your privacy rights, request data export, or inquire about document security:
            </p>
            <p className="text-sm font-semibold text-[#0B1528]">
              Data Protection Officer · SP LEGAL FZ LLC<br />
              Email: <a href="mailto:support@onlinewillsadvisor.com" className="text-[#8C6D41] hover:underline">support@onlinewillsadvisor.com</a><br />
              Fujairah, United Arab Emirates
            </p>
          </section>
        </div>
      </main>

      <OwaFooter />
    </div>
  );
}

