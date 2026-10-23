"use client";

import React from "react";
import { Upload, PenTool, CheckCircle2, Image as ImageIcon, Trash2 } from "lucide-react";

interface TestatorSignatureCardProps {
  signatureDataUrl?: string | null;
  onSaveSignature: (dataUrl: string | null) => void;
}

export function TestatorSignatureCard({
  signatureDataUrl,
  onSaveSignature,
}: TestatorSignatureCardProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSaveSignature(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#A37E44]" />
            <h3 className="text-sm font-bold text-[#0B1528] uppercase tracking-wider">
              Testator Digital Signature (Clause 14 & Attestation)
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Provide your authentic signature. It will be embedded directly onto the official Abu Dhabi Civil Court will document.
          </p>
        </div>

        {signatureDataUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-full self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signature Verified
          </span>
        )}
      </div>

      {signatureDataUrl ? (
        /* Saved Signature Preview */
        <div className="p-4 sm:p-6 rounded-xl border border-emerald-200 bg-emerald-50/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Current Signature Preview:
            </span>
            <div className="bg-white p-3 rounded-lg border border-gray-200 inline-block shadow-xs">
              <img
                src={signatureDataUrl}
                alt="Testator Signature"
                className="max-h-16 max-w-56 object-contain"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              This signature will appear on Section 14 (Execution & Attestation) of your printed court form.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSaveSignature(null)}
            className="px-3.5 py-2 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Replace / Redo Signature</span>
          </button>
        </div>
      ) : (
        /* Signature Intake Interface - Upload Only */
        <div className="p-6 rounded-xl border border-dashed border-[#A37E44]/50 bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] text-center space-y-3 transition-all">
          <div className="w-10 h-10 rounded-full bg-[#A37E44]/15 text-[#A37E44] flex items-center justify-center mx-auto">
            <ImageIcon className="w-5 h-5 text-[#A37E44]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0B1528] uppercase">
              Upload Scanned Signature Image
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Sign on a white paper, take a clear photo or scan, and upload (PNG, JPG, or SVG).
            </p>
          </div>

          <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Select Signature Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
