"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, ArrowRight, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export function OtpVerificationCard() {
  const router = useRouter();

  const [step, setStep] = useState<"EMAIL" | "CODE">("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      if (data.debugCode) {
        setDebugCode(data.debugCode);
      }
      setStep("CODE");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Invalid code.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to verify code.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async () => {
    setLoading(true);
    setError(null);
    const demoEmail = "pm.reviewer@adjd.gov.ae";
    setEmail(demoEmail);

    try {
      // Send OTP first to ensure account exists
      await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail }),
      });

      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: demoEmail,
          code: "999999",
          isDemoBypass: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      }
    } catch {
      setError("Failed to run PM demo login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-[#E5E0D8] p-8 shadow-sm">
      {/* 1-Click PM & Reviewer Demo Bypass */}
      <div className="mb-6 p-4 rounded-xl bg-[#FAF7F2] border border-[#A37E44]/30">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A37E44] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            PM & Reviewer Access
          </span>
          <span className="text-[10px] bg-[#A37E44]/10 text-[#A37E44] px-2 py-0.5 rounded font-mono font-semibold">
            One-Click
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          Skip manual email checks and sign in immediately with pre-loaded mock court records.
        </p>
        <button
          type="button"
          onClick={handleDemoBypass}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-[#0B1528] hover:bg-[#111C33] text-white text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#A37E44]" />
              <span>Launch PM / Reviewer Session</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-serif font-bold text-[#0B1528]">
          {step === "EMAIL" ? "Sign In with Email OTP" : "Enter Verification Code"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {step === "EMAIL"
            ? "We will send a 6-digit security code to your email. No password required."
            : `We sent a 6-digit code to ${email}`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {debugCode && step === "CODE" && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>Staging Security Code: <strong className="font-mono text-sm">{debugCode}</strong></span>
          <button
            type="button"
            onClick={() => setCode(debugCode)}
            className="text-[11px] underline font-semibold text-amber-900"
          >
            Auto-fill
          </button>
        </div>
      )}

      {step === "EMAIL" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E0D8] text-sm focus:outline-none focus:border-[#A37E44] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#A37E44] hover:bg-[#8C6B37] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              6-Digit Security Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E0D8] text-sm font-mono tracking-widest text-center text-lg focus:outline-none focus:border-[#A37E44] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#A37E44] hover:bg-[#8C6B37] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep("EMAIL")}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-800 underline mt-2"
          >
            Use a different email address
          </button>
        </form>
      )}
    </div>
  );
}
