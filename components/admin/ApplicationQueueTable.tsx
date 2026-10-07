"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ApplicationStatus } from "@prisma/client";
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Building,
  User,
} from "lucide-react";

interface ApplicationSummary {
  id: string;
  packageType: string;
  status: ApplicationStatus;
  updatedAt: string;
  account: {
    fullName: string;
    email: string;
  };
  reviewFlags: { id: string; isResolved: boolean; severity: string }[];
  tickets: { id: string; status: string }[];
  payments: { milestone: string; amountAed: number }[];
}

interface ApplicationQueueTableProps {
  applications: ApplicationSummary[];
  counts: Record<string, number>;
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

const STAGE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  IN_PROGRESS: { label: "In Progress", badgeClass: "bg-gray-100 text-gray-700 border-gray-300" },
  DRAFT_READY: { label: "Draft Generated", badgeClass: "bg-blue-50 text-blue-800 border-blue-200" },
  COURT_FEE_PENDING: {
    label: "Court Fee Due",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
  AWAITING_ADMIN_VERIFICATION: {
    label: "Awaiting Verification",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200 ring-1 ring-purple-300",
  },
  UNDER_ADMIN_REVIEW: {
    label: "Under Review",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  ACTION_REQUIRED: {
    label: "Action Required",
    badgeClass: "bg-red-50 text-red-800 border-red-300 ring-1 ring-red-400 font-bold",
  },
  READY_FOR_SUBMISSION: {
    label: "Ready for Court",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
  },
  SUBMITTED_TO_ADJD: {
    label: "Submitted to ADJD",
    badgeClass: "bg-[#0B1528] text-white border-[#0B1528]",
  },
  REGISTRATION_COMPLETED: {
    label: "Registered & Final",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
  },
};

export function ApplicationQueueTable({
  applications,
  counts,
  selectedStatus,
  onSelectStatus,
  searchTerm,
  onSearchChange,
}: ApplicationQueueTableProps) {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectStatus(null)}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStatus === null
              ? "border-[#0B1528] shadow-sm ring-1 ring-[#0B1528]"
              : "border-[#E5E0D8] hover:border-gray-400"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono">
            Total Pipeline
          </span>
          <div className="text-2xl font-serif font-bold text-[#0B1528] mt-1">
            {counts.TOTAL || 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">All registered wills</p>
        </div>

        <div
          onClick={() => onSelectStatus("AWAITING_ADMIN_VERIFICATION")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStatus === "AWAITING_ADMIN_VERIFICATION"
              ? "border-purple-600 shadow-sm ring-1 ring-purple-600"
              : "border-[#E5E0D8] hover:border-gray-400"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 font-mono">
            Awaiting Verification
          </span>
          <div className="text-2xl font-serif font-bold text-purple-900 mt-1">
            {counts.AWAITING_ADMIN_VERIFICATION || 0}
          </div>
          <p className="text-[11px] text-purple-600/70 mt-0.5">Court fee settled</p>
        </div>

        <div
          onClick={() => onSelectStatus("READY_FOR_SUBMISSION")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStatus === "READY_FOR_SUBMISSION"
              ? "border-teal-600 shadow-sm ring-1 ring-teal-600"
              : "border-[#E5E0D8] hover:border-gray-400"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 font-mono">
            Ready For Court
          </span>
          <div className="text-2xl font-serif font-bold text-teal-900 mt-1">
            {counts.READY_FOR_SUBMISSION || 0}
          </div>
          <p className="text-[11px] text-teal-600/70 mt-0.5">Quality approved</p>
        </div>

        <div
          onClick={() => onSelectStatus("REGISTRATION_COMPLETED")}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            selectedStatus === "REGISTRATION_COMPLETED"
              ? "border-emerald-600 shadow-sm ring-1 ring-emerald-600"
              : "border-[#E5E0D8] hover:border-gray-400"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
            Completed
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-900 mt-1">
            {counts.REGISTRATION_COMPLETED || 0}
          </div>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">Court attested</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by client, email, or ref..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#A37E44]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectStatus(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === null
                ? "bg-[#0B1528] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({counts.TOTAL || 0})
          </button>

          {Object.entries(STAGE_CONFIG).map(([key, config]) => {
            const count = counts[key] || 0;
            if (count === 0 && selectedStatus !== key) return null;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === key
                    ? "bg-[#0B1528] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] border-b border-[#E5E0D8] text-gray-500 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="px-6 py-3.5 font-bold">Client / Testator</th>
                <th className="px-4 py-3.5 font-bold">Package</th>
                <th className="px-4 py-3.5 font-bold">Current Stage</th>
                <th className="px-4 py-3.5 font-bold">Quality Flags</th>
                <th className="px-4 py-3.5 font-bold">Tickets</th>
                <th className="px-4 py-3.5 font-bold">Last Activity</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]/60">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                    No applications matching the active filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const stageObj = STAGE_CONFIG[app.status] || {
                    label: app.status,
                    badgeClass: "bg-gray-100 text-gray-800",
                  };
                  const activeFlags = app.reviewFlags.filter((f) => !f.isResolved);
                  const openTickets = app.tickets.filter((t) => t.status === "OPEN");

                  return (
                    <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0B1528] text-sm">
                          {app.account.fullName}
                        </div>
                        <div className="text-gray-500 text-[11px]">{app.account.email}</div>
                        <div className="text-gray-400 text-[10px] font-mono mt-0.5">
                          Ref: {app.id.slice(0, 12)}...
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            app.packageType === "COUPLES"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {app.packageType}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stageObj.badgeClass}`}
                        >
                          {stageObj.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {activeFlags.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {activeFlags.length} Open
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Passed
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {openTickets.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            {openTickets.length} New
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">0</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-500 font-mono text-[11px]">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="px-3 py-1.5 bg-[#0B1528] hover:bg-[#1a2844] text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#A37E44]" />
                          Inspect & Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
