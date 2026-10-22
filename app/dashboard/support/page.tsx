"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Shield,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Send,
  Paperclip,
  Loader2,
  Check,
} from "lucide-react";
import { TicketThreadView } from "@/components/tickets/TicketThreadView";
import { useOwaStore } from "@/store/useOwaStore";
import { OwaFooter } from "@/components/common/OwaFooter";
import { CustomerSubNav } from "@/components/navigation/CustomerSubNav";

const TOPIC_PRESETS: Record<string, { subject: string; message: string }> = {
  child_passport: {
    subject: "Child Passport Assistance (Consular / Emergency Guidance)",
    message:
      "Hello, one of our children does not currently have a valid international passport. Could you guide us on how the Abu Dhabi Civil Family Court handles registration for children pending consular passport issuance?",
  },
  court_fee: {
    subject: "Court Registry Fee Inquiry",
    message:
      "I have a question regarding the Stage 2 Abu Dhabi Judicial Department registration fee and official attestation procedure.",
  },
  arabic_name: {
    subject: "Arabic Phonetic Transliteration Verification",
    message:
      "I would like to verify the Arabic spelling of the names listed in my Will prior to court submission.",
  },
};

function CustomerSupportContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");

  const { application } = useOwaStore();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(Boolean(topicParam));
  const [newSubject, setNewSubject] = useState(
    topicParam && TOPIC_PRESETS[topicParam]
      ? TOPIC_PRESETS[topicParam].subject
      : ""
  );
  const [newMessage, setNewMessage] = useState(
    topicParam && TOPIC_PRESETS[topicParam] ? TOPIC_PRESETS[topicParam].message : ""
  );
  const [targetWill, setTargetWill] = useState("Will 1");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  const fetchTickets = async (silent = false, customMsg?: string) => {
    if (!silent) {
      setIsFetching(true);
      if (customMsg) setLoadingMessage(customMsg);
    }
    try {
      const appIdQuery =
        application?.id && !application.id.startsWith("draft-")
          ? `?applicationId=${application.id}`
          : "";
      const res = await fetch(`/api/tickets${appIdQuery}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        if (data.tickets.length > 0) {
          setSelectedTicketId((prev) =>
            prev && data.tickets.some((t: any) => t.id === prev) ? prev : data.tickets[0].id
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setIsFetching(false);
      setIsInitialLoading(false);
      setLoadingMessage(null);
    }
  };

  useEffect(() => {
    fetchTickets(false, "Opening Legal Support Desk...");
  }, [application?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setLoading(true);
    setLoadingMessage("Sending new message to legal team...");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId:
            application?.id && !application.id.startsWith("draft-")
              ? application.id
              : "demo-app",
          subject: newSubject.trim(),
          initialMessage: `${newMessage.trim()}${
            application?.packageType === "COUPLES" ? `\n\n[Regarding: ${targetWill}]` : ""
          }`,
          senderName: application?.account?.fullName || "Testator",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowNewTicketModal(false);
        setNewMessage("");
        setNewSubject("");
        await fetchTickets(true);
        if (data.ticket?.id) {
          setSelectedTicketId(data.ticket.id);
        }
      }
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const getChip = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F0EB] text-[#366D58] border border-[#BCD4C7]">
            Resolved
          </span>
        );
      case "AWAITING_CUSTOMER":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E5] text-[#95652B] border border-[#F2D7B2]">
            Waiting for you
          </span>
        );
      case "OPEN":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EBF9] text-[#6243AD] border border-[#DFD2EF]">
            With our team
          </span>
        );
    }
  };

  const isBusy = isFetching || loading;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#29213F] flex flex-col justify-between">
      {/* Top slide-in progress indicator (Emil Kowalski feedback design) */}
      {isBusy && (
        <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center pointer-events-none transition-all duration-200">
          <div className="w-full h-1 bg-[#f0ebf9] overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-[#8A6233] via-[#5b3fb0] to-[#8A6233] animate-pulse" />
          </div>
          <div className="mt-3 px-4 py-2 rounded-full bg-[#1b1425]/95 text-white text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-200 animate-in fade-in slide-in-from-top-2 border border-[#382852]/40">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d7b48b]" />
            <span>{loadingMessage || "Syncing messages... Please wait a moment"}</span>
          </div>
        </div>
      )}

      {/* Centered Loading Overlay (Emil Kowalski perceived performance) */}
      {isBusy && !isInitialLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-md border border-[#e5e0d8] px-6 py-5 rounded-2xl shadow-xl flex items-center gap-4 max-w-md mx-4 transition-all duration-200 animate-in zoom-in-[0.98]">
            <div className="w-10 h-10 rounded-full bg-[#f0ebf9] border border-[#dfd2ef] flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 text-[#6243ad] animate-spin" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="text-[13.5px] font-semibold text-[#1b1425]">
                {loadingMessage || "Syncing with legal desk..."}
              </p>
              <p className="text-xs text-gray-500">
                Please wait a moment while we retrieve your court communications.
              </p>
            </div>
          </div>
        </div>
      )}

      <CustomerSubNav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Header Breadcrumbs & Real-time Sync Status */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[11px] text-gray-400 font-medium">
                <Link href="/dashboard" className="hover:underline">
                  My application
                </Link>{" "}
                <span className="px-1.5 text-gray-300">/</span> Support desk
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#29213F]">
                Support
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
                Message our legal team about documents, names, or your ADJD appointment. Replies appear here and in your verified email.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              {/* Real-time DB Sync Badge */}
              <div className="flex items-center gap-2 text-xs">
                {isBusy ? (
                  <span className="flex items-center gap-1.5 text-[#6243ad] font-medium bg-[#f0ebf9] px-2.5 py-1 rounded-full border border-[#dfd2ef]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6243ad] animate-ping" />
                    Syncing with legal desk...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#1f5a3d] font-medium bg-[#e8f4ee] px-2.5 py-1 rounded-full border border-[#b9dcc9]">
                    <Check className="w-3.5 h-3.5 text-[#1f5a3d]" />
                    <span>Live with legal team</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={() => setShowNewTicketModal(true)}
                className="px-5 py-2.5 bg-[#6243AD] hover:bg-[#443074] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-transform active:scale-[0.97] duration-150 ease-out flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New inquiry</span>
              </button>
            </div>
          </div>

          {/* Smooth Container Blur during background sync */}
          <div
            className={`transition-all duration-200 ease-out ${
              isBusy && !isInitialLoading
                ? "opacity-60 filter blur-[1.5px] pointer-events-none select-none"
                : "opacity-100 filter blur-0"
            }`}
          >
            {isInitialLoading ? (
              /* Sleek Skeleton during Initial Load — Prevents layout shifts */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-[#E4DFEE] bg-white animate-pulse space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-[#F0EBF9] rounded-full w-20" />
                        <div className="h-3 bg-gray-100 rounded w-12" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                    </div>
                  ))}
                </div>
                <div className="md:col-span-2 h-[580px] rounded-2xl border border-[#E4DFEE] bg-white animate-pulse flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0ebf9] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-[#6243ad] animate-spin" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">
                    Connecting to legal desk...
                  </p>
                </div>
              </div>
            ) : tickets.length > 0 ? (
              /* 2-Column Split: Conversation List (Left) vs. Active Thread (Right) */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left Column: Ticket List */}
                <nav className="space-y-2.5" aria-label="Conversations">
                  {tickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    const repliesList = t.replies || t.messages || [];
                    const lastMsg =
                      repliesList.length > 0
                        ? repliesList[repliesList.length - 1].message
                        : "No messages yet";

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-white border-[#6243AD] ring-2 ring-[#6243AD]/10 shadow-sm"
                            : "bg-[#FFFEFA] border-[#E4DFEE] hover:border-gray-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs gap-2">
                          {getChip(t.status)}
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(t.updatedAt || t.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        <strong className="text-xs sm:text-sm font-semibold text-[#29213F] line-clamp-1">
                          {t.subject}
                        </strong>

                        <span className="text-xs text-gray-500 line-clamp-1">
                          {lastMsg}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Right Column: Active Thread View */}
                <div className="md:col-span-2">
                  {selectedTicket ? (
                    <TicketThreadView
                      ticket={selectedTicket}
                      userRole="CUSTOMER"
                      onReplyAdded={() => fetchTickets(false, "Syncing replies...")}
                      onSendingChange={(sending, label) => {
                        setIsFetching(sending);
                        if (label) setLoadingMessage(label);
                        else if (!sending) setLoadingMessage(null);
                      }}
                    />
                  ) : (
                    <div className="bg-[#FFFEFA] p-12 rounded-2xl border border-[#E4DFEE] text-center text-xs text-gray-400">
                      Select a conversation from the left to view messages.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-[#FFFEFA] p-12 rounded-2xl border border-[#E4DFEE] text-center space-y-4 max-w-lg mx-auto shadow-card-soft">
                <div className="w-12 h-12 rounded-full bg-[#F0EBF9] text-[#6243AD] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#29213F]">
                    No conversations yet
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Have questions about consular passport documentation, court video attestations, or need guidance on your Will?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(true)}
                  className="px-6 py-2.5 bg-[#6243AD] hover:bg-[#443074] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Start a conversation
                </button>
              </div>
            )}
          </div>

        {/* Modal: New Ticket */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-[#241837]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFEFA] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E4DFEE]">
              <div className="flex items-center justify-between border-b border-[#E4DFEE] pb-3">
                <h3 className="font-serif text-xl font-bold text-[#29213F]">
                  New message to legal team
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F0EBF9] text-[#6243AD] hover:bg-[#DFD2EF] flex items-center justify-center font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                {application?.packageType === "COUPLES" && (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Which Will is this inquiry about?
                    </label>
                    <select
                      value={targetWill}
                      onChange={(e) => setTargetWill(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#DCD4E7] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6243AD]"
                    >
                      <option>Will 1 (Primary Testator)</option>
                      <option>Will 2 (Spouse / Partner)</option>
                      <option>Both Wills / General Application</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g., Child passport renewal inquiry"
                    className="w-full p-2.5 rounded-lg border border-[#DCD4E7] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6243AD]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Describe your inquiry, requested changes, or questions..."
                    className="w-full p-2.5 rounded-lg border border-[#DCD4E7] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6243AD] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="px-4 py-2 border border-[#E4DFEE] hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newSubject.trim() || !newMessage.trim()}
                    className="px-5 py-2 bg-[#6243AD] hover:bg-[#443074] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{loading ? "Sending..." : "Send message"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer matching owa-platform-prototype.html */}
      <OwaFooter />
    </div>
  );
}

export default function CustomerSupportPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8 text-gray-400">
          Loading Support Desk...
        </div>
      }
    >
      <CustomerSupportContent />
    </React.Suspense>
  );
}
