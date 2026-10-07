"use client";

import React, { useState, useEffect } from "react";
import { ApplicationQueueTable } from "@/components/admin/ApplicationQueueTable";
import { Building, Shield, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedStatus) queryParams.set("status", selectedStatus);
      if (searchTerm) queryParams.set("q", searchTerm);

      const res = await fetch(`/api/admin/applications?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, searchTerm]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-[#0B1528] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#E5E0D8]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#A37E44] text-xs font-semibold uppercase tracking-wider font-mono">
              <Building className="w-3.5 h-3.5" />
              Abu Dhabi Judicial Department (ADJD) · Civil Family Court
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Legal Administration & Verification Workspace
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Official portal for non-Muslim wills verification, bilingual attestation, AI transliteration review, and court registry submission pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/tickets"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border border-white/10"
            >
              <MessageSquare className="w-4 h-4 text-[#A37E44]" />
              Support Tickets Desk
            </Link>

            <button
              type="button"
              onClick={fetchApplications}
              className="p-2.5 bg-[#A37E44] hover:bg-[#B38D48] text-white rounded-xl shadow-sm transition-all"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Application Queue Table */}
        <ApplicationQueueTable
          applications={applications}
          counts={counts}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    </div>
  );
}
