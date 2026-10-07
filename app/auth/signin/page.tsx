"use client";

import React, { useState } from "react";
import { OtpVerificationCard } from "@/components/auth/OtpVerificationCard";
import { AuthCard } from "@/components/auth/AuthCard";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"OTP" | "PASSWORD">("OTP");

  // Legacy password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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
          className={`flex-1 py-2 rounded-md transition-all ${
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
          className={`flex-1 py-2 rounded-md transition-all ${
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
          subtitle="Legacy access with email and password."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMessage}
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
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] text-sm"
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
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#A37E44] text-white text-xs font-bold uppercase tracking-wider"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </AuthCard>
      )}
    </div>
  );
}
