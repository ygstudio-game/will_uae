"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!ageConfirmed) {
      setErrorMessage("Under Abu Dhabi Law No. 14 of 2021, you must be 21 years of age or older to execute a Non-Muslim Will.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setErrorMessage("Network error occurred during registration. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Begin your court-compliant Abu Dhabi Non-Muslim Will"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/auth/signin"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Full legal name (as on passport)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Michael Smith"
              className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-alabaster/40 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-alabaster/40 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-alabaster/40 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-court-border bg-alabaster/40 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-court-bronze/30 focus:border-court-bronze transition-colors"
            />
          </div>
        </div>

        {/* Age statutory checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-court-bronze focus:ring-court-bronze h-4 w-4"
            />
            <span className="leading-relaxed">
              I certify that I am <strong>21 years of age or older</strong>, a non-Muslim expatriate, and legally competent to make a testamentary disposition in the UAE.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-obsidian hover:bg-obsidian-light text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-court-tan" />
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
