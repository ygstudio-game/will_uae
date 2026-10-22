"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OtpVerificationCard } from "@/components/auth/OtpVerificationCard";
import { AuthCard } from "@/components/auth/AuthCard";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<"OTP" | "PASSWORD">("OTP");

  // Legacy password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to sign in. Please check your credentials.");
        setLoading(false);
        return;
      }

      await refreshUser();
      router.push("/dashboard");
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex rounded-lg p-1 bg-[#FAF7F2] border border-[#E5E0D8] text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode("OTP")}
          className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
            mode === "OTP"
              ? "bg-[#0B1528] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Passwordless Email OTP (OWA Standard)
        </button>
        <button
          type="button"
          onClick={() => setMode("PASSWORD")}
          className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
            mode === "PASSWORD"
              ? "bg-[#0B1528] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Password Login
        </button>
      </div>

      {mode === "OTP" ? (
        <OtpVerificationCard />
      ) : (
        <AuthCard
          title="Sign in with Password"
          subtitle="Direct access with your registered email and password."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#A37E44] hover:bg-[#8C6B37] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </AuthCard>
      )}

      {/* Sign Up Section */}
      <div className="text-center p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-sm flex items-center justify-between gap-3">
        <div className="text-left">
          <div className="text-xs font-semibold text-[#0B1528]">Don&apos;t have an account?</div>
          <div className="text-[11px] text-gray-500">Create one in 1 minute to start your Will</div>
        </div>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EFEA] border border-[#E5E0D8] text-xs font-semibold text-[#A37E44] transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Sign up</span>
        </Link>
      </div>
    </div>
  );
}
