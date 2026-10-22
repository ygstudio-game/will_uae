"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Printer,
  Plus,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Home,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { ADJDBilingualWillDocument } from "@/components/court/ADJDBilingualWillDocument";
import { OwaFooter } from "@/components/common/OwaFooter";

function CourtFeeReplacementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { application, applicationId, activeWillIndex, setActiveWillIndex, loadApplicationFromDb } = useOwaStore();

  const appId = searchParams.get("applicationId") || applicationId;

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [selectedWillIndex, setSelectedWillIndex] = useState(activeWillIndex || 1);

  useEffect(() => {
    async function load() {
      try {
        if (appId) {
          const res = await fetch(`/api/applications/${appId}`);
          const data = await res.json();
          if (data.success && data.application) {
            setAppData(data.application);
          }
        } else if (!application) {
          const res = await fetch("/api/applications/current");
          const data = await res.json();
          if (data.success && data.application) {
            setAppData(data.application);
          }
        }
      } catch (err) {
        console.error("Failed to load will draft:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appId, application]);

  const activeApp = appData || application;
  const wills = activeApp?.wills || [];
  const activeWill = wills.find((w: any) => w.willIndex === selectedWillIndex) || wills[0];
  const testator = activeWill?.testatorPerson;
  const assignments = activeWill?.roleAssignments || [];
  const isCouples = activeApp?.packageType === "COUPLES";

  const handlePrint = () => {
    window.print();
  };

  const handleCreateAnotherWill = () => {
    // Navigate to start flow to create another will application
    router.push("/start");
  };

  if (loading && !activeApp) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#A37E44] mb-3" />
        <p className="text-xs uppercase tracking-wider font-semibold text-[#6c6478]">
          Loading court-ready will draft...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0B1528] pb-16 print:bg-white print:p-0 print:pb-0">
      {/* Sticky Header Action Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#0B1528] text-xs font-semibold text-[#0B1528] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-[#E5E0D8]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8f4ee] text-[#1f5a3d]">
                <CheckCircle2 className="w-3 h-3 text-[#1f5a3d]" />
                Draft Approved for Review
              </span>
              <h1 className="text-xs sm:text-sm font-serif font-bold text-[#0B1528]">
                ADJD Court Will Document
              </h1>
            </div>
            <p className="text-[11px] text-[#6c6478]">
              Form ADJD-NM0723-07-03 · Abu Dhabi Judicial Department Civil Family Court
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-Will Switcher for Couples */}
          {isCouples && wills.length > 1 && (
            <div className="flex items-center rounded-lg border border-[#cfc6da] p-0.5 bg-[#FAF7EE] text-xs">
              {wills.map((w: any) => (
                <button
                  key={w.id || w.willIndex}
                  type="button"
                  onClick={() => setSelectedWillIndex(w.willIndex)}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    w.willIndex === selectedWillIndex
                      ? "bg-[#0B1528] text-white shadow-xs"
                      : "text-[#6c6478] hover:text-[#0B1528]"
                  }`}
                >
                  {w.testatorPerson?.fullName?.split(" ")[0] || `Will ${w.willIndex}`}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateAnotherWill}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-[#A37E44] text-[#A37E44] hover:bg-[#A37E44] hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Wills</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B1528] hover:bg-[#1a2942] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </nav>

      {/* Hero Notice Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 print:hidden">
        <div className="bg-gradient-to-r from-[#FAF7EE] via-white to-[#FAF7EE] p-5 sm:p-6 rounded-2xl border border-[#E5E0D8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#A37E44] block">
              Document Status · Ready for Legal Verification
            </span>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#0B1528]">
              Your Will has been prepared in official ADJD court format
            </h2>
            <p className="text-xs text-[#6c6478] max-w-2xl leading-relaxed">
              Our legal team is reviewing your draft against Abu Dhabi Law No. 14 of 2021. You can print or download the complete 8-page bilingual document below, or create another will for a spouse, relative, or friend.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCreateAnotherWill}
              className="px-4 py-2 rounded-full bg-[#A37E44] hover:bg-[#8A6233] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Another Will</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 print:p-0 print:m-0 print:max-w-full">
        {activeWill && testator ? (
          <ADJDBilingualWillDocument
            will={activeWill}
            testator={testator}
            assignments={assignments}
          />
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-[#E5E0D8] text-center space-y-4 max-w-xl mx-auto mt-12 shadow-sm">
            <FileText className="w-10 h-10 text-[#A37E44] mx-auto opacity-70" />
            <h2 className="text-lg font-serif font-bold text-[#0B1528]">
              Will Document Not Available Yet
            </h2>
            <p className="text-xs text-[#6c6478] leading-relaxed">
              Please complete your details in the application wizard to view your generated court draft.
            </p>
            <Link
              href="/wizard/details"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0B1528] text-white text-xs font-semibold hover:bg-[#1a2942] transition-colors"
            >
              Go to Application Wizard →
            </Link>
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Footer for easy access */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0B1528]/95 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3 backdrop-blur-md border border-white/10 print:hidden">
        <span className="text-xs font-medium text-gray-200 hidden sm:inline">
          Form ADJD-NM0723-07-03 Court Draft
        </span>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
        <button
          type="button"
          onClick={handleCreateAnotherWill}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#A37E44] hover:bg-[#8A6233] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add More Wills</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 print:hidden">
        <OwaFooter />
      </div>
    </div>
  );
}

export default function CourtFeeCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#A37E44]" />
        </div>
      }
    >
      <CourtFeeReplacementContent />
    </Suspense>
  );
}
