"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  FileText,
  CreditCard,
  Edit3,
  CheckCircle2,
  Building,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { StatusPipelineController } from "@/components/admin/StatusPipelineController";
import { AiVerificationFlagsCard } from "@/components/admin/AiVerificationFlagsCard";
import { AuditTimelineCard } from "@/components/admin/AuditTimelineCard";

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editArabicName, setEditArabicName] = useState("");
  const [editPassport, setEditPassport] = useState("");
  const [correctionSaved, setCorrectionSaved] = useState(false);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      const data = await res.json();
      if (data.success) {
        setApplication(data.application);
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  if (loading || !application) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] p-8 flex items-center justify-center">
        <div className="text-sm font-semibold text-gray-500 animate-pulse">
          Loading Application #{id?.slice(0, 8)}...
        </div>
      </div>
    );
  }

  const primaryWill = application.wills[0];
  const testator = primaryWill?.testatorPerson;
  const roleAssignments = primaryWill?.roleAssignments || [];

  const handleStartEditing = (person: any) => {
    setEditingPersonId(person.id);
    setEditFullName(person.fullName);
    setEditArabicName(person.arabicName || "");
    setEditPassport(person.passportNumber || "");
    setCorrectionSaved(false);
  };

  const handleSaveCorrection = async () => {
    if (!editingPersonId) return;

    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftCorrection: {
            personId: editingPersonId,
            fullName: editFullName,
            arabicName: editArabicName,
            passportNumber: editPassport,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingPersonId(null);
        setCorrectionSaved(true);
        fetchApplication();
      }
    } catch (err) {
      console.error("Correction failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white border border-[#E5E0D8] text-gray-700 hover:text-[#0B1528] shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528]">
                  {application.account.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#0B1528] text-white">
                  {application.packageType}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Application Ref: {application.id} · Template: ADJD-NM0723-07-03
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/will/${primaryWill?.id}`}
              target="_blank"
              className="px-3.5 py-2 bg-white border border-[#E5E0D8] hover:border-[#A37E44] text-[#0B1528] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#A37E44]" />
              View Bilingual Court Draft
            </Link>
          </div>
        </div>

        {/* 9-Stage Pipeline Controller */}
        <StatusPipelineController
          applicationId={application.id}
          currentStatus={application.status}
          onStatusUpdated={(newStatus) => {
            setApplication({ ...application, status: newStatus });
            fetchApplication();
          }}
        />

        {/* Main Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Application Details & Corrections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Testator Identity & Direct Correction Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A37E44] font-mono">
                    Clause 1 & Preamble
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#0B1528] mt-0.5">
                    Testator Identity & Court Details
                  </h3>
                </div>

                {testator && editingPersonId !== testator.id && (
                  <button
                    type="button"
                    onClick={() => handleStartEditing(testator)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#A37E44]" />
                    Direct Edit / Transliterate
                  </button>
                )}
              </div>

              {testator && (
                <div>
                  {editingPersonId === testator.id ? (
                    <div className="space-y-4 bg-[#FBF9F5] p-4 rounded-xl border border-[#E5E0D8]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                            Legal Name (English)
                          </label>
                          <input
                            type="text"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                            Arabic Transliteration (الاسم باللغة العربية)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={editArabicName}
                            onChange={(e) => setEditArabicName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs font-arabic"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            value={editPassport}
                            onChange={(e) => setEditPassport(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingPersonId(null)}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCorrection}
                          className="px-4 py-1.5 bg-[#0B1528] text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Apply Correction & Log Audit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 font-mono text-[10px] uppercase">English Name</span>
                        <p className="font-bold text-[#0B1528] text-sm mt-0.5">{testator.fullName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-mono text-[10px] uppercase">Arabic Script</span>
                        <p className="font-bold text-[#0B1528] text-sm mt-0.5 font-arabic" dir="rtl">
                          {testator.arabicName || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-mono text-[10px] uppercase">Passport</span>
                        <p className="font-bold text-[#0B1528] text-sm mt-0.5">{testator.passportNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-mono text-[10px] uppercase">Nationality</span>
                        <p className="font-medium text-gray-700 mt-0.5">{testator.nationality}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-mono text-[10px] uppercase">Domicile</span>
                        <p className="font-medium text-gray-700 mt-0.5">{primaryWill.domicileCountry}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-mono text-[10px] uppercase">Address</span>
                        <p className="font-medium text-gray-700 mt-0.5 truncate">{testator.address || "Abu Dhabi, UAE"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Appointed Roles Table */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-[#0B1528]">
                Court Role Appointments (Clauses 4, 5, 6, 7)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F5] text-gray-500 uppercase tracking-wider font-mono text-[10px] border-b border-[#E5E0D8]">
                    <tr>
                      <th className="px-3 py-2 font-bold">Role</th>
                      <th className="px-3 py-2 font-bold">Name (English / Arabic)</th>
                      <th className="px-3 py-2 font-bold">Relationship</th>
                      <th className="px-3 py-2 font-bold">Passport</th>
                      <th className="px-3 py-2 font-bold text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]/60">
                    {roleAssignments.map((ra: any) => (
                      <tr key={ra.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3 font-mono font-bold text-[11px] text-[#A37E44]">
                          {ra.role} #{ra.appointmentOrder}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-[#0B1528]">{ra.person.fullName}</div>
                          <div className="text-gray-400 font-arabic text-[11px]" dir="rtl">
                            {ra.person.arabicName || ""}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{ra.person.relationship || "—"}</td>
                        <td className="px-3 py-3 text-gray-600 font-mono">{ra.person.passportNumber || "—"}</td>
                        <td className="px-3 py-3 text-right font-bold text-[#0B1528]">
                          {ra.sharePercentage ? `${ra.sharePercentage}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attached Verification Documents */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-[#0B1528]">
                Court Verification Document Repository
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application.persons.flatMap((p: any) =>
                  p.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FBF9F5] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-[#A37E44]" />
                        <div>
                          <div className="text-xs font-bold text-[#0B1528]">{doc.fileName}</div>
                          <div className="text-[11px] text-gray-400">
                            {doc.documentType} · For {p.fullName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                        Attached
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Flags, Audit Events, Payment Status */}
          <div className="space-y-6">
            {/* Financial Milestones Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#A37E44]" />
                Two-Stage Billing Status
              </h4>

              <div className="space-y-2 pt-1 text-xs">
                {application.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        {p.milestone === "INITIAL_SERVICE_FEE" ? "Milestone 1 (Preparation)" : "Milestone 2 (Court Fee)"}
                      </span>
                      <div className="text-[10px] text-gray-400 font-mono">Ref: {p.transactionRef}</div>
                    </div>
                    <span className="font-bold text-emerald-700">AED {Number(p.amountAed).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Verification Flags */}
            <AiVerificationFlagsCard
              applicationId={application.id}
              flags={application.reviewFlags}
              onFlagsUpdated={fetchApplication}
            />

            {/* Audit Trail Timeline */}
            <AuditTimelineCard auditEvents={application.auditEvents} />
          </div>
        </div>
      </div>
    </div>
  );
}
