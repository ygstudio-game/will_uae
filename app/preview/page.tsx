"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useOwaStore } from "@/store/useOwaStore";
import { ADJDBilingualWillDocument } from "@/components/court/ADJDBilingualWillDocument";
import { ArrowLeft, Printer, Download, Sparkles, Loader2, FileText, CheckCircle2 } from "lucide-react";

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { application, activeWillIndex, setActiveWillIndex, loadApplicationFromDb } = useOwaStore();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);

  const queryAppId = searchParams.get("applicationId");
  const queryWillIndex = searchParams.get("willIndex");

  useEffect(() => {
    async function load() {
      try {
        if (queryAppId) {
          const res = await fetch(`/api/applications/${queryAppId}`);
          const data = await res.json();
          if (data.success && data.application) {
            setAppData(data.application);
          }
        } else if (!application) {
          // Attempt to load from current session
          const res = await fetch("/api/auth/me");
          const authData = await res.json();
          if (authData.authenticated && authData.user?.id) {
            const appRes = await fetch("/api/applications");
            const appJson = await appRes.json();
            if (appJson.success && appJson.applications?.length > 0) {
              setAppData(appJson.applications[0]);
            }
          }
        }
      } catch (err) {
        console.error("Preview load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [queryAppId, application]);

  const activeApp = appData || application;
  const currentWillIndex = queryWillIndex ? Number(queryWillIndex) : (activeWillIndex || 1);
  const activeWill = activeApp?.wills?.find((w: any) => w.willIndex === currentWillIndex) || activeApp?.wills?.[0];
  const testator = activeWill?.testatorPerson;
  const assignments = activeWill?.roleAssignments || [];
  const isCouples = activeApp?.packageType === "COUPLES";

  const handlePrint = () => {
    window.print();
  };

  if (loading && !activeApp) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#A37E44] mb-3" />
        <p className="text-xs uppercase tracking-wider font-semibold text-[#6c6478]">
          Loading court draft preview...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0B1528] pb-16 print:bg-white print:p-0 print:pb-0">
      {/* Top Floating Control Bar - Hidden during printing */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/wizard/review"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#cfc6da] hover:border-[#0B1528] text-xs font-semibold text-[#0B1528] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wizard</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-[#E5E0D8]" />
          <div>
            <h1 className="text-xs sm:text-sm font-serif font-bold text-[#0B1528]">
              ADJD Court Will Draft Preview
            </h1>
            <p className="text-[11px] text-[#6c6478]">
              Official Form ADJD-NM0723-07-03 · Abu Dhabi Civil Family Court
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Couples Will Switcher */}
          {isCouples && activeApp?.wills && activeApp.wills.length > 1 && (
            <div className="flex items-center rounded-lg border border-[#cfc6da] p-0.5 bg-[#FAF7EE] text-xs">
              {activeApp.wills.map((w: any) => (
                <button
                  key={w.id || w.willIndex}
                  type="button"
                  onClick={() => {
                    setActiveWillIndex(w.willIndex);
                    router.push(`/preview?willIndex=${w.willIndex}${queryAppId ? `&applicationId=${queryAppId}` : ""}`);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    w.willIndex === currentWillIndex
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
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B1528] hover:bg-[#1a2942] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </nav>

      {/* Main Draft Document Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8 print:p-0 print:m-0 print:max-w-full">
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
              No Will Details Found
            </h2>
            <p className="text-xs text-[#6c6478] leading-relaxed">
              Please complete Section A of your Will application before previewing the court draft.
            </p>
            <Link
              href="/wizard/details"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0B1528] text-white text-xs font-semibold hover:bg-[#1a2942] transition-colors"
            >
              Start Section A →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#A37E44]" />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
