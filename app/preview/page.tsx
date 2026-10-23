"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useOwaStore } from "@/store/useOwaStore";
import { ADJDBilingualWillDocument } from "@/components/court/ADJDBilingualWillDocument";
import { ArrowLeft, ArrowRight, Printer, Download, Sparkles, Loader2, FileText, CheckCircle2 } from "lucide-react";

// Realistic sample court will data matching ADJD court reference
const SAMPLE_TESTATOR: any = {
  id: "sample-testator",
  fullName: "John Michael Smith",
  arabicName: "جون مايكل سميث",
  isArabicApproved: true,
  dob: "1985-05-20",
  nationality: "British",
  passportNumber: "12345678",
  emiratesId: "784-1985-1234567-1",
  isUaeResident: true,
  address: "Villa 14, Al Reef, Abu Dhabi, United Arab Emirates",
  signatureDataUrl: null,
};

const SAMPLE_WILL: any = {
  id: "sample-will",
  willIndex: 1,
  versionTag: "v1.0",
  domicileCountry: "United Kingdom",
  declarationConfirmed: true,
  hasChildrenUnder18: true,
  isDraftConfirmed: true,
};

const SAMPLE_ASSIGNMENTS: any[] = [
  {
    id: "sample-ex-1",
    role: "EXECUTOR_PRIMARY",
    appointmentOrder: 1,
    person: {
      id: "sample-p1",
      fullName: "David Alan Whitfield",
      arabicName: "ديفيد ألان ويتفيلد",
      dob: "1980-08-12",
      nationality: "British",
      passportNumber: "98765432",
      emiratesId: "784-1980-9876543-1",
      isUaeResident: true,
    },
  },
  {
    id: "sample-ex-2",
    role: "EXECUTOR_SUBSTITUTE",
    appointmentOrder: 2,
    person: {
      id: "sample-p2",
      fullName: "Sarah Jane Jenkins",
      arabicName: "سارة جين جينكينز",
      dob: "1982-11-04",
      nationality: "British",
      passportNumber: "87654321",
      isUaeResident: false,
    },
  },
  {
    id: "sample-ex-3",
    role: "EXECUTOR_FURTHER",
    appointmentOrder: 3,
    person: {
      id: "sample-p3",
      fullName: "Robert Charles Taylor",
      arabicName: "روبرت تشارلز تايلور",
      dob: "1978-03-29",
      nationality: "British",
      passportNumber: "76543210",
      isUaeResident: false,
    },
  },
  {
    id: "sample-ben-1",
    role: "BENEFICIARY_PRIMARY",
    appointmentOrder: 1,
    sharePercentage: 100,
    person: {
      id: "sample-p4",
      fullName: "Emily Rose Smith",
      arabicName: "إميلي روز سميث",
      dob: "1987-09-14",
      nationality: "British",
      passportNumber: "65432109",
      emiratesId: "784-1987-6543210-1",
      isUaeResident: true,
    },
  },
  {
    id: "sample-sub-1",
    role: "BENEFICIARY_SUBSTITUTE",
    appointmentOrder: 1,
    sharePercentage: 50,
    person: {
      id: "sample-p5",
      fullName: "James Alexander Smith",
      arabicName: "جيمس ألكسندر سميث",
      dob: "2015-06-22",
      nationality: "British",
      passportNumber: "54321098",
      emiratesId: "784-2015-5432109-1",
      isUaeResident: true,
    },
  },
  {
    id: "sample-sub-2",
    role: "BENEFICIARY_SUBSTITUTE",
    appointmentOrder: 2,
    sharePercentage: 50,
    person: {
      id: "sample-p6",
      fullName: "Oliver Thomas Smith",
      arabicName: "أوليفر توماس سميث",
      dob: "2018-04-10",
      nationality: "British",
      passportNumber: "43210987",
      emiratesId: "784-2018-4321098-1",
      isUaeResident: true,
    },
  },
  {
    id: "sample-gd-1",
    role: "GUARDIAN_PERMANENT",
    appointmentOrder: 1,
    person: {
      id: "sample-p1",
      fullName: "David Alan Whitfield",
      arabicName: "ديفيد ألان ويتفيلد",
      dob: "1980-08-12",
      nationality: "British",
      passportNumber: "98765432",
      isUaeResident: true,
    },
  },
  {
    id: "sample-child-1",
    role: "CHILD",
    appointmentOrder: 1,
    person: {
      id: "sample-p5",
      fullName: "James Alexander Smith",
      arabicName: "جيمس ألكسندر سميث",
      dob: "2015-06-22",
      nationality: "British",
      passportNumber: "54321098",
      isUaeResident: true,
    },
  },
  {
    id: "sample-child-2",
    role: "CHILD",
    appointmentOrder: 2,
    person: {
      id: "sample-p6",
      fullName: "Oliver Thomas Smith",
      arabicName: "أوليفر توماس سميث",
      dob: "2018-04-10",
      nationality: "British",
      passportNumber: "43210987",
      isUaeResident: true,
    },
  },
];

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { application, activeWillIndex, setActiveWillIndex, loadApplicationFromDb } = useOwaStore();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [showSample, setShowSample] = useState(false);

  const queryAppId = searchParams.get("applicationId");
  const queryWillIndex = searchParams.get("willIndex");
  const querySample = searchParams.get("sample");

  useEffect(() => {
    if (querySample === "true") {
      setShowSample(true);
    }
  }, [querySample]);

  useEffect(() => {
    async function load() {
      try {
        if (queryAppId) {
          const res = await fetch(`/api/applications/${queryAppId}`);
          const data = await res.json();
          if (data.success && data.application) {
            const storeApp = useOwaStore.getState().application;
            let cachedSig: string | null = null;
            if (typeof window !== "undefined") {
              try {
                cachedSig = localStorage.getItem("owa_signature_latest");
              } catch (_) {}
            }
            const mergedPersons = (data.application.persons || []).map((p: any) => {
              const sp = storeApp?.persons?.find((ep: any) => ep.id === p.id || ep.fullName === p.fullName);
              let localSig: string | null = null;
              if (typeof window !== "undefined") {
                try {
                  localSig = localStorage.getItem(`owa_signature_${p.id}`);
                } catch (_) {}
              }
              return {
                ...p,
                signatureDataUrl: p.signatureDataUrl || sp?.signatureDataUrl || localSig || (p.relationship === "Self" ? cachedSig : null) || null,
              };
            });
            const mergedWills = (data.application.wills || []).map((w: any) => {
              const sw = storeApp?.wills?.find((ew: any) => ew.id === w.id || ew.willIndex === w.willIndex);
              let t = w.testatorPerson || sw?.testatorPerson;
              if (t) {
                const matchP = mergedPersons.find((mp: any) => mp.id === t.id || mp.relationship === "Self");
                t = {
                  ...t,
                  signatureDataUrl: t.signatureDataUrl || matchP?.signatureDataUrl || sw?.testatorPerson?.signatureDataUrl || cachedSig || null,
                };
              }
              return { ...w, testatorPerson: t };
            });
            setAppData({
              ...data.application,
              persons: mergedPersons,
              wills: mergedWills,
            });
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
  const rawWill = activeApp?.wills?.find((w: any) => w.willIndex === currentWillIndex) || activeApp?.wills?.[0];
  let rawTestator = rawWill?.testatorPerson;

  // Resolve signature with multiple fallbacks so it is NEVER lost on preview
  if (rawTestator && !rawTestator.signatureDataUrl) {
    const fromPersons = activeApp?.persons?.find(
      (p: any) => p.id === rawTestator.id || p.relationship === "Self" || (p.fullName && p.fullName === rawTestator.fullName)
    );
    const storeApp = useOwaStore.getState().application;
    const fromStore =
      storeApp?.wills?.find((w: any) => w.willIndex === currentWillIndex)?.testatorPerson ||
      storeApp?.persons?.find((p: any) => p.relationship === "Self" || p.id === rawTestator.id);
    let fromStorage: string | null = null;
    if (typeof window !== "undefined") {
      try {
        fromStorage =
          localStorage.getItem(`owa_signature_${rawTestator.id}`) ||
          localStorage.getItem("owa_signature_latest");
      } catch (_) {}
    }
    const signature =
      fromPersons?.signatureDataUrl ||
      fromStore?.signatureDataUrl ||
      fromStorage ||
      null;

    if (signature) {
      rawTestator = { ...rawTestator, signatureDataUrl: signature };
    }
  }

  const rawAssignments = rawWill?.roleAssignments || [];

  const isRealDataReady = Boolean(rawWill && rawTestator?.fullName);
  const activeWill = isRealDataReady ? rawWill : (showSample ? SAMPLE_WILL : null);
  const testator = isRealDataReady ? rawTestator : (showSample ? SAMPLE_TESTATOR : null);
  const assignments = isRealDataReady ? rawAssignments : (showSample ? SAMPLE_ASSIGNMENTS : []);
  const isCouples = activeApp?.packageType === "COUPLES";

  const handlePrint = () => {
    window.print();
  };

  if (loading && !activeApp && !showSample) {
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#cfc6da] hover:border-[#0B1528] text-[#0B1528] bg-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <Link
            href={`/checkout/court-fee?applicationId=${activeApp?.id || queryAppId || ""}`}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0B1528] hover:bg-[#1a2942] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>Approve & Submit →</span>
          </Link>
        </div>
      </nav>

      {showSample && !isRealDataReady && (
        <div className="bg-[#FAF7EE] border-b border-[#E5E0D8] px-4 py-2 text-center text-xs text-[#8A6233] font-medium print:hidden">
          ✨ Viewing official 8-page ADJD court replica with sample data (John Michael Smith).
        </div>
      )}

      {/* Main Draft Document Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8 print:p-0 print:m-0 print:max-w-full">
        {activeWill && testator ? (
          <>
            <ADJDBilingualWillDocument
              will={activeWill}
              testator={testator}
              assignments={assignments}
            />

            {/* Post-Review Legal Approval Bar - Hidden during printing */}
            <div className="mt-8 p-6 bg-white rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#2f7a55]" />
                  <h3 className="text-sm font-serif font-bold text-[#0B1528]">
                    Ready to proceed with this court draft?
                  </h3>
                </div>
                <p className="text-xs text-[#6c6478]">
                  Next: our legal team conducts the statutory court review before filing with the Abu Dhabi Civil Family Court.
                </p>
              </div>
              <Link
                href={`/checkout/court-fee?applicationId=${activeApp?.id || queryAppId || ""}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0B1528] hover:bg-[#1a2942] text-white text-xs font-semibold shadow-md transition-all shrink-0 cursor-pointer"
              >
                <span>Approve & Proceed to Legal Review</span>
                <ArrowRight className="w-4 h-4 text-[#d7b48b]" />
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-[#E5E0D8] text-center space-y-4 max-w-xl mx-auto mt-12 shadow-sm">
            <FileText className="w-10 h-10 text-[#A37E44] mx-auto opacity-70" />
            <h2 className="text-lg font-serif font-bold text-[#0B1528]">
              No Will Details Found
            </h2>
            <p className="text-xs text-[#6c6478] leading-relaxed">
              Please complete Section A of your Will application before previewing the court draft.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/wizard/details"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0B1528] text-white text-xs font-semibold hover:bg-[#1a2942] transition-colors"
              >
                Start Section A →
              </Link>
              <button
                type="button"
                onClick={() => setShowSample(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#A37E44] text-[#A37E44] hover:bg-[#FAF7EE] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preview with Sample Court Data</span>
              </button>
            </div>
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
