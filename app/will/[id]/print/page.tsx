"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWillStore } from "@/store/useWillStore";
import { BilingualWillDocument } from "@/components/court/BilingualWillDocument";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Party, Child, TestatorDetails } from "@/types/will";

export default function WillPrintPage() {
  const params = useParams();
  const willId = params.id as string;
  const storeState = useWillStore();

  const [loading, setLoading] = useState(true);
  const [willData, setWillData] = useState<{
    testator: TestatorDetails;
    parties: Party[];
    children: Child[];
  }>({
    testator: storeState.testator,
    parties: storeState.parties,
    children: storeState.children,
  });

  useEffect(() => {
    if (!willId) {
      setLoading(false);
      return;
    }

    fetch(`/api/wills/${willId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.will) {
          const w = data.will;
          setWillData({
            testator: {
              fullName: w.fullName || "",
              arabicName: w.arabicName || "",
              isArabicApproved: !!w.arabicName,
              dob: w.dob ? new Date(w.dob).toISOString().split("T")[0] : "",
              nationality: w.nationality || "British",
              passportNumber: w.passportNumber || "",
              emiratesId: w.emiratesId || "",
              isUaeResident: w.isUaeResident ?? true,
              residentialAddress: w.residentialAddress || "",
              emailAddress: w.emailAddress || "",
              contactNumber: w.contactNumber || "",
              domicileCountry: w.domicileCountry || "United Arab Emirates",
            },
            parties: (w.parties || []).map((p: any) => ({
              id: p.id,
              role: p.partyType,
              fullName: p.fullName,
              arabicName: p.arabicName || "",
              isArabicApproved: p.isArabicApproved || false,
              dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
              nationality: p.nationality || "",
              passportNumber: p.passportNumber || "",
              emiratesId: p.emiratesId || "",
              isUaeResident: p.isUaeResident || false,
              residentialAddress: p.address || "",
              emailAddress: p.email || "",
              contactNumber: p.phone || "",
              sharePercentage: p.sharePercentage,
            })),
            children: (w.children || []).map((c: any) => ({
              id: c.id,
              fullName: c.fullName,
              arabicName: c.arabicName || "",
              dob: c.dob ? new Date(c.dob).toISOString().split("T")[0] : "",
              nationality: c.nationality || "",
              passportNumber: c.passportNumber || "",
            })),
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load will for printing:", err);
      })
      .finally(() => {
        setLoading(false);
        // Delay print dialog until DOM paints
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      });
  }, [willId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-court-bronze mb-3" />
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
          Preparing court document for print...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-6">
      {/* Floating control bar visible only on screen (hidden on print) */}
      <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2 bg-obsidian text-white p-2 rounded-xl shadow-2xl">
        <Link
          href={`/will/${willId}`}
          className="p-2 hover:bg-white/10 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Print</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-court-bronze hover:bg-court-bronze-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Again</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <BilingualWillDocument
          testator={willData.testator}
          parties={willData.parties}
          children={willData.children}
        />
      </div>
    </div>
  );
}
