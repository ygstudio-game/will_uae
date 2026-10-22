"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, Loader2, Building, AlertCircle, Key } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@launchpit.ae");
    setPassword("Admin@ADJD2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Court Crest & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1528]/5 border border-[#0B1528]/10 text-[#A37E44] text-[11px] font-semibold tracking-wider uppercase font-mono">
            <Building className="w-3.5 h-3.5" />
            ADJD Civil Family Court · Official Portal
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B1528] tracking-tight">
            Legal Administration Portal
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Restricted access for registry officers, attestation verifiers, and legal compliance reviewers.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-3xl p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@launchpit.ae"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm text-[#0B1528] focus:outline-none focus:border-[#A37E44] focus:ring-2 focus:ring-[#A37E44]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0D8] text-sm text-[#0B1528] focus:outline-none focus:border-[#A37E44] focus:ring-2 focus:ring-[#A37E44]/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0B1528] hover:bg-[#162238] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#A37E44]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-[#A37E44]" />
                  <span>Authenticate & Enter Portal</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Development Demo Credentials Helper */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E0D8] flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-gray-700 block">Default Admin Account:</span>
              <span className="font-mono text-[11px] text-gray-500">admin@launchpit.ae</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[11px] font-semibold text-[#A37E44] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
            >
              Fill Demo
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            ← Back to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
