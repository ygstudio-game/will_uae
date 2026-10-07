"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, CheckCircle2, Shield, Sparkles, Loader2 } from "lucide-react";
import { DocumentAlertBanner } from "@/components/dashboard/DocumentAlertBanner";
import { DraftWillCard } from "@/components/dashboard/DraftWillCard";
import { GeneratedWillCard } from "@/components/dashboard/GeneratedWillCard";
import { DocumentReviewModal } from "@/components/documents/DocumentReviewModal";
import { WIZARD_STEPS } from "@/types/will";
import { useWillStore } from "@/store/useWillStore";

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface WillSummary {
  id: string;
  willNumber: number;
  status: "DRAFT" | "REVIEW" | "GENERATED";
  currentStep: number;
  willType: "INDIVIDUAL" | "MIRROR";
  fullName: string;
  arabicName: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    parties: number;
    children: number;
    assets: number;
    documents: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { setActiveWillId, resetToEmpty } = useWillStore();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [wills, setWills] = useState<WillSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Load user and wills
  const refreshData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meData.authenticated || !meData.user) {
        router.push("/auth/signin");
        return;
      }
      setUser(meData.user);

      const willsRes = await fetch("/api/wills");
      const willsData = await willsRes.json();
      if (willsData.success && Array.isArray(willsData.wills)) {
        setWills(willsData.wills);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStartNewWill = async (willType: "INDIVIDUAL" | "MIRROR" = "INDIVIDUAL") => {
    setCreating(true);
    try {
      resetToEmpty();
      const res = await fetch("/api/wills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ willType }),
      });
      const data = await res.json();
      if (data.success && data.will) {
        setActiveWillId(data.will.id);
        router.push(`/wizard/1?id=${data.will.id}`);
      } else {
        router.push("/wizard/1");
      }
    } catch {
      router.push("/wizard/1");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWill = async (willId: string) => {
    if (!confirm("Are you sure you want to permanently delete this will draft? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/wills/${willId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWills((prev) => prev.filter((w) => w.id !== willId));
      } else {
        alert("Failed to delete will draft.");
      }
    } catch (err) {
      alert("Network error while deleting will.");
    }
  };

  const getStepName = (stepNum: number) => {
    const meta = WIZARD_STEPS.find((s) => s.step === stepNum);
    return meta ? meta.title : "In Progress";
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-alabaster py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-court-bronze mb-3" />
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
          Loading your civil court wills...
        </p>
      </div>
    );
  }

  const draftWills = wills.filter((w) => w.status !== "GENERATED");
  const completedWills = wills.filter((w) => w.status === "GENERATED" || w.currentStep >= 15);

  return (
    <div className="flex-1 bg-alabaster py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-court-border">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-court-bronze">
              Client Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-obsidian tracking-tight mt-1">
              Welcome, {user?.name || "Client"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your Abu Dhabi Civil Family Court wills and review pending document extractions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleStartNewWill("MIRROR")}
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-court-border bg-white hover:bg-alabaster text-xs font-semibold uppercase tracking-wider text-obsidian transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-court-bronze" />
              <span>Mirror Wills</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartNewWill("INDIVIDUAL")}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-obsidian hover:bg-obsidian-light text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all group disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin text-court-tan" />
              ) : (
                <Plus className="w-4 h-4 text-court-tan group-hover:scale-110 transition-transform" />
              )}
              <span>Start New Will</span>
            </button>
          </div>
        </div>

        {/* Document OCR alert banner */}
        <DocumentAlertBanner
          count={1}
          onReviewClick={() => setReviewModalOpen(true)}
        />

        {/* Draft Wills Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-xl text-obsidian">Active Drafts</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-court-tan/20 text-court-bronze-dark">
                {draftWills.length}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-sans">
              Auto-saved in Neon Postgres
            </span>
          </div>

          {draftWills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {draftWills.map((will) => {
                const progressPercent = Math.round((will.currentStep / 16) * 100);
                return (
                  <DraftWillCard
                    key={will.id}
                    id={will.id}
                    willNumber={will.willNumber}
                    testatorName={will.fullName || user?.name || "Untitled Will"}
                    startDate={formatDate(will.createdAt)}
                    lastUpdated={formatDate(will.updatedAt)}
                    currentStep={will.currentStep}
                    totalSteps={16}
                    stepName={getStepName(will.currentStep)}
                    progressPercent={progressPercent}
                    willType={will.willType}
                    onDelete={() => handleDeleteWill(will.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-court-border p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-medium text-gray-600">No active draft wills in your account</p>
              <button
                type="button"
                onClick={() => handleStartNewWill("INDIVIDUAL")}
                className="inline-block text-xs font-semibold text-court-bronze hover:underline"
              >
                + Start your first will
              </button>
            </div>
          )}
        </section>

        {/* Completed & Generated Wills Section */}
        {completedWills.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-court-border">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-xl text-obsidian">
                Completed & Court-Ready Wills
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {completedWills.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedWills.map((will) => (
                <GeneratedWillCard
                  key={will.id}
                  id={will.id}
                  testatorName={will.fullName || user?.name || "Testator"}
                  completedDate={formatDate(will.updatedAt)}
                  versionTag={`ADJD-${will.willNumber}`}
                  partiesSummary={[
                    `${will.counts.parties} Appointed Parties`,
                    `${will.counts.children} Minor Children`,
                    `${will.counts.assets} Registered Assets`,
                  ]}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* OCR Review modal */}
      <DocumentReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />
    </div>
  );
}
