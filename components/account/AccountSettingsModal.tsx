"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Calendar,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "profile" | "email" | "security";
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  initialTab = "profile",
}: AccountSettingsModalProps) {
  const { user, refreshUser, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "email" | "signout">(
    initialTab === "security" ? "email" : initialTab
  );

  // Profile form state
  const [fullName, setFullName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sign out state
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Synchronize initial state when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileLoading(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phoneNumber }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }
      setProfileMessage({ type: "success", text: "Your personal details have been updated." });
      await refreshUser();
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to save profile." });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle send email OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    const clean = newEmail.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEmailMessage({ type: "error", text: "Please enter a valid email address format." });
      return;
    }

    if (clean === user?.email?.toLowerCase().trim()) {
      setEmailMessage({ type: "error", text: "New email cannot be the same as your current email." });
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/email/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: clean }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }
      setOtpSent(true);
      setResendCooldown(60);
      setEmailMessage({
        type: "success",
        text: `A 6-digit verification code has been dispatched to ${clean}. Please check your inbox.`,
      });
    } catch (err: any) {
      setEmailMessage({ type: "error", text: err.message || "Error requesting code." });
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle verify email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setEmailMessage({ type: "error", text: "Please enter the 6-digit verification code." });
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/email/change-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim().toLowerCase(), code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Verification failed. Please check the code.");
      }
      setEmailMessage({
        type: "success",
        text: "Your email address has been successfully verified and updated.",
      });
      setOtpSent(false);
      setNewEmail("");
      setOtpCode("");
      await refreshUser();
    } catch (err: any) {
      setEmailMessage({ type: "error", text: err.message || "Verification failed." });
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOut();
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1528]/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Surface */}
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E5E0D8] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-[#0B1528] text-white px-6 py-5 flex items-center justify-between border-b-2 border-[#A37E44]">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#D4B896] uppercase font-semibold">
              Client Portal & Security
            </div>
            <h2 id="account-modal-title" className="font-serif text-2xl font-normal text-white">
              Account Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E0D8] bg-[#FAF9F6] px-6">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-3.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-[#A37E44] text-[#0B1528]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`py-3.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "email"
                ? "border-[#A37E44] text-[#0B1528]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Change Email (OTP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("signout")}
            className={`py-3.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "signout"
                ? "border-[#A37E44] text-[#0B1528]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Registered Email</div>
                  <div className="font-semibold text-sm text-[#0B1528] flex items-center gap-1.5 mt-0.5">
                    <span>{user?.email}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  className="text-xs text-[#A37E44] hover:text-[#8C6D41] font-semibold underline underline-offset-2"
                >
                  Change email →
                </button>
              </div>

              {profileMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    profileMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1528] mb-1.5">
                    Full Legal Name (as shown on passport) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Michael Smith"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CFC7] focus:border-[#A37E44] focus:ring-1 focus:ring-[#A37E44] outline-none text-sm text-[#0B1528] transition-colors"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    This name is used across your official ADJD bilingual Will documents and court filings.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B1528] mb-1.5">
                    Phone Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+971 50 000 0001"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CFC7] focus:border-[#A37E44] focus:ring-1 focus:ring-[#A37E44] outline-none text-sm text-[#0B1528] transition-colors"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Used for court hearing notifications, OTP verifications, and urgent legal clarifications.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0B1528] hover:bg-[#1a2b4c] rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {profileLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE EMAIL (OTP VERIFIED) */}
          {activeTab === "email" && (
            <div className="space-y-5">
              <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl p-4">
                <div className="text-xs text-gray-500">Current Verified Address</div>
                <div className="font-semibold text-sm text-[#0B1528] mt-0.5">
                  {user?.email}
                </div>
              </div>

              <div className="bg-[#F0EBF9] border border-[#DFD2EF] rounded-xl p-4 text-xs text-[#29213F] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#6243AD]">
                  <Lock className="w-3.5 h-3.5" /> Two-Step Email Verification Guarantee
                </div>
                <p className="leading-relaxed">
                  To protect your ADJD legal draft, your email can only be updated after verifying a 6-digit security code sent to the new address.
                </p>
              </div>

              {emailMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    emailMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {emailMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{emailMessage.text}</span>
                </div>
              )}

              {!otpSent ? (
                /* Step 1: Input New Email */
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1528] mb-1.5">
                      New Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new.email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CFC7] focus:border-[#A37E44] focus:ring-1 focus:ring-[#A37E44] outline-none text-sm text-[#0B1528] transition-colors"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      A 6-digit confirmation code will be dispatched to this new address.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E0D8]">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emailLoading || !newEmail || !newEmail.includes("@")}
                      className="px-5 py-2 text-xs font-semibold text-white bg-[#A37E44] hover:bg-[#8C6D41] rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>Send Verification Code</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Input 6-Digit OTP */
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Enter code sent to <strong className="text-[#0B1528]">{newEmail}</strong>:
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                          setEmailMessage(null);
                        }}
                        className="text-xs text-[#A37E44] hover:underline font-semibold"
                      >
                        Change address
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-40 h-12 text-center text-xl font-mono font-bold tracking-[6px] rounded-lg border-2 border-[#A37E44] outline-none bg-white text-[#0B1528]"
                      />
                      <button
                        type="submit"
                        disabled={emailLoading || otpCode.length !== 6}
                        className="h-12 px-6 text-xs font-semibold text-white bg-[#0B1528] hover:bg-[#1a2b4c] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        <span>Verify & Update Email</span>
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
                      <span>Didn't receive the code?</span>
                      {resendCooldown > 0 ? (
                        <span className="text-gray-400">Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={emailLoading}
                          className="text-[#A37E44] hover:underline font-semibold"
                        >
                          Resend code
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SIGN OUT */}
          {activeTab === "signout" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-amber-700" /> Confirm Session Sign Out
                </div>
                <p>
                  Signing out will securely clear your active session cookie on this browser. All your questionnaire data, uploaded documents, and payment milestones remain safely stored in the database.
                </p>
                <p className="text-[11px] text-amber-800">
                  You can sign back in anytime using your registered email address ({user?.email}) and an instant 6-digit OTP code.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Stay Signed In
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signOutLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {signOutLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Sign Out Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

