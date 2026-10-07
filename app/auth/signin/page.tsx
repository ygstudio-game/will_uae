"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useWillStore } from "@/store/useWillStore";

export default function SignInPage() {
  const router = useRouter();
  const { resetToEmpty } = useWillStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err) {
      setErrorMessage("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleLaunchDemo = async () => {
    setErrorMessage(null);
    setDemoLoading(true);

    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to launch demo account.");
        setDemoLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setErrorMessage("Could not connect to demo server. Please try again.");
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Manager & Evaluator Quick Launch Banner */}
      <div className="bg-obsidian text-white rounded-xl p-5 border border-court-tan/30 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-court-bronze/20 border border-court-bronze/40 flex items-center justify-center text-court-tan flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-court-bronze" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-xs font-semibold text-court-tan uppercase tracking-wider font-mono">
              Project Manager & Reviewer Demo
            </div>
            <h3 className="font-serif font-bold text-base text-white">
              Instant Court-Ready Demo Account
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Explore the completed flow with pre-seeded database records in Neon Postgres: Will #1 at Step 15 with verified Arabic transliterations, 3 executors, 2 children, 2 assets, and printable court PDF.
            </p>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleLaunchDemo}
                disabled={demoLoading || loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-court-bronze hover:bg-court-bronze-dark text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to Neon DB...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Project Manager Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Regular User Sign In Card */}
      <AuthCard
        title="Sign in to your account"
        subtitle="Access your active draft wills and finalized documents"
        footerText="Don't have an account?"
        footerLinkText="Create an account"
        footerLinkHref="/auth/register"
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <span className="text-xs text-court-bronze hover:text-court-bronze-dark cursor-pointer font-medium">
                Forgot password?
              </span>
            </div>
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-court-bronze focus:ring-court-bronze h-4 w-4"
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-obsidian hover:bg-obsidian-light text-white text-xs uppercase tracking-wider font-semibold shadow-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 text-court-tan" />
              </>
            )}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
