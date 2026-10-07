"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useWillStore } from "@/store/useWillStore";
import { ADJDBilingualWillDocument } from "@/components/court/ADJDBilingualWillDocument";
import { Printer, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Party, Child, TestatorDetails } from "@/types/will";

export default function WillViewerPage() {
  const params = useParams();
  const willId = params.id as string;
  const storeState = useWillStore();

  const [loading, setLoading] = useState(true);
  const [willData, setWillData] = useState<{
    testator: TestatorDetails;
    parties: Party[];
    children: Child[];
    willNumber?: number;
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
            willNumber: w.willNumber,
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
        console.error("Failed to load will document from DB, falling back to local store:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [willId]);

  if (loading) {
    return (
      <div className="flex-1 bg-alabaster py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-court-bronze mb-3" />
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
          Loading bilingual court document from Neon DB...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-alabaster py-8">
      {/* Top Action Bar */}
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl mb-6">
        <div className="bg-white p-4 rounded-xl border border-court-border shadow-court flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg border border-court-border hover:bg-alabaster text-gray-600 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base text-obsidian">
                  Court Will Preview {willData.willNumber ? `(Will #${willData.willNumber})` : "(ADJD-NM1221-06-01)"}
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Ready for Court
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Official Abu Dhabi Civil Family Court Non-Muslim Will
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/will/${willId}/print`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-court-bronze hover:bg-court-bronze-dark text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save to PDF</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Render Document */}
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <ADJDBilingualWillDocument
          will={{
            id: willId,
            applicationId: "app-default",
            willIndex: 1,
            versionTag: "ADJD-NM0723-07-03",
            domicileCountry: willData.testator.domicileCountry || "United Kingdom",
            declarationConfirmed: true,
            hasChildrenUnder18: willData.children.length > 0,
            isDraftConfirmed: true,
            roleAssignments: [],
          }}
          testator={{
            id: "testator-id",
            applicationId: "app-default",
            fullName: willData.testator.fullName,
            arabicName: willData.testator.arabicName,
            isArabicApproved: willData.testator.isArabicApproved,
            dob: willData.testator.dob,
            nationality: willData.testator.nationality,
            passportNumber: willData.testator.passportNumber,
            emiratesId: willData.testator.emiratesId,
            isUaeResident: willData.testator.isUaeResident,
            address: willData.testator.residentialAddress,
            email: willData.testator.emailAddress,
            phone: willData.testator.contactNumber,
          }}
          assignments={willData.parties.map((p, idx) => ({
            id: p.id,
            willId,
            personId: p.id,
            role: p.role as any,
            appointmentOrder: idx + 1,
            sharePercentage: p.sharePercentage,
            person: {
              id: p.id,
              applicationId: "app-default",
              fullName: p.fullName,
              arabicName: p.arabicName,
              isArabicApproved: p.isArabicApproved,
              dob: p.dob,
              nationality: p.nationality,
              passportNumber: p.passportNumber,
              emiratesId: p.emiratesId,
              isUaeResident: p.isUaeResident,
              address: p.address,
            },
          })).concat(
            willData.children.map((c, idx) => ({
              id: c.id,
              willId,
              personId: c.id,
              role: "CHILD" as any,
              appointmentOrder: idx + 1,
              sharePercentage: undefined,
              person: {
                id: c.id,
                applicationId: "app-default",
                fullName: c.fullName,
                arabicName: c.arabicName,
                isArabicApproved: true,
                dob: c.dob,
                nationality: c.nationality,
                passportNumber: c.passportNumber,
                emiratesId: undefined,
                address: undefined,
                isUaeResident: true,
              },
            }))
          )}
        />
      </div>
    </div>
  );
}
