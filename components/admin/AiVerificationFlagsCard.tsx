"use client";

import React, { useState } from "react";
import { ReviewFlag, FlagSeverity } from "@prisma/client";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Plus,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface AiVerificationFlagsCardProps {
  applicationId: string;
  flags: ReviewFlag[];
  onFlagsUpdated: () => void;
}

export function AiVerificationFlagsCard({
  applicationId,
  flags,
  onFlagsUpdated,
}: AiVerificationFlagsCardProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [fieldPath, setFieldPath] = useState("Section A · Testator Arabic Transliteration");
  const [severity, setSeverity] = useState<FlagSeverity>("WARNING");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const activeFlags = flags.filter((f) => !f.isResolved);
  const resolvedFlags = flags.filter((f) => f.isResolved);

  const handleResolve = async (flagId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolveFlagId: flagId,
          resolutionNotes: resolutionNotes || "Verified and certified by legal admin.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResolvingId(null);
        setResolutionNotes("");
        onFlagsUpdated();
      }
    } catch (err) {
      console.error("Failed to resolve flag:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addFlag: {
            fieldPath,
            severity,
            message: message.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("");
        setShowAddForm(false);
        onFlagsUpdated();
      }
    } catch (err) {
      console.error("Failed to add flag:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderSeverityBadge = (sev: FlagSeverity) => {
    switch (sev) {
      case "ERROR":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 font-mono">
            <AlertCircle className="w-3 h-3 text-red-600" />
            CRITICAL ERROR
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 font-mono">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            ATTENTION REQUIRED
          </span>
        );
      case "INFO":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1 font-mono">
            <Info className="w-3 h-3 text-blue-600" />
            AI OBSERVATION
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A37E44] font-mono">
            Quality Assurance & Verification
          </span>
          <h3 className="text-base font-serif font-bold text-[#0B1528] flex items-center gap-2 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#A37E44]" />
            AI & Legal Verification Flags ({activeFlags.length} Open)
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Flag
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddFlag} className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E5E0D8] space-y-3 text-xs">
          <h4 className="font-bold text-[#0B1528]">Create Manual Quality Flag</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Affected Field / Section
              </label>
              <input
                type="text"
                value={fieldPath}
                onChange={(e) => setFieldPath(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D8] bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FlagSeverity)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D8] bg-white"
              >
                <option value="INFO">INFO · Observation</option>
                <option value="WARNING">WARNING · Potential Court Rejection</option>
                <option value="ERROR">ERROR · Statutory Defect</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Issue Description / Instruction
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ensure Arabic transliteration matches standard UAE Ministry of Justice spelling"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-[#0B1528] text-white font-semibold rounded-lg shadow-sm"
            >
              Save Flag
            </button>
          </div>
        </form>
      )}

      {/* Flag List */}
      <div className="space-y-3">
        {activeFlags.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>All AI and legal quality checks have been resolved. Document meets ADJD court standards.</span>
          </div>
        ) : (
          activeFlags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {renderSeverityBadge(flag.severity)}
                  <span className="font-semibold text-gray-700">{flag.fieldPath}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(flag.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-800 font-medium leading-relaxed">{flag.message}</p>

              {resolvingId === flag.id ? (
                <div className="pt-2 space-y-2 border-t border-amber-200/60">
                  <input
                    type="text"
                    placeholder="Enter resolution notes (e.g. Manually checked passport scan and confirmed name)"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E5E0D8] bg-white text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleResolve(flag.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition-all"
                    >
                      Confirm Resolution
                    </button>
                    <button
                      type="button"
                      onClick={() => setResolvingId(null)}
                      className="px-2.5 py-1.5 text-gray-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setResolvingId(flag.id)}
                    className="px-3 py-1 bg-white border border-[#E5E0D8] hover:border-emerald-600 hover:text-emerald-700 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Resolved accordion */}
        {resolvedFlags.length > 0 && (
          <details className="pt-2 text-xs text-gray-500">
            <summary className="cursor-pointer font-semibold hover:text-gray-800">
              View {resolvedFlags.length} resolved quality verification flags
            </summary>
            <div className="mt-2 space-y-2">
              {resolvedFlags.map((rf) => (
                <div key={rf.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold line-through">{rf.fieldPath}</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Resolved by {rf.resolvedBy}</span>
                  </div>
                  <p className="text-[11px] mt-0.5">{rf.message}</p>
                  {rf.resolutionNotes && (
                    <p className="text-[10px] text-gray-500 italic mt-0.5">Note: {rf.resolutionNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
