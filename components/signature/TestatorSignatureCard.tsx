"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, PenTool, CheckCircle2, RotateCcw, Image as ImageIcon, Trash2 } from "lucide-react";

interface TestatorSignatureCardProps {
  signatureDataUrl?: string | null;
  onSaveSignature: (dataUrl: string | null) => void;
}

export function TestatorSignatureCard({
  signatureDataUrl,
  onSaveSignature,
}: TestatorSignatureCardProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "draw">("upload");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize canvas context
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#0B1528";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab]);

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

  // Canvas drawing handlers (mouse & touch)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSaveSignature(dataUrl);
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
        /* Signature Intake Interface */
        <div className="space-y-4">
          {/* Tab selector */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "upload"
                  ? "bg-[#0B1528] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Signature Image</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draw")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "draw"
                  ? "bg-[#0B1528] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw Signature (Touch/Mouse)</span>
            </button>
          </div>

          {activeTab === "upload" ? (
            /* Upload Mode */
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
          ) : (
            /* Canvas Draw Mode */
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Draw your official signature in the box below using your mouse, trackpad, or finger:
              </p>
              <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={160}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 cursor-crosshair touch-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Pad</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDrawnSignature}
                  className="px-4 py-2 bg-[#A37E44] hover:bg-[#B38D48] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Signature</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
