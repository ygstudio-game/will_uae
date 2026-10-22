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

  const fetchTickets = async () => {
    try {
      const appIdQuery = application?.id ? `?applicationId=${application.id}` : "";
      const res = await fetch(`/api/tickets${appIdQuery}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicketId) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [application?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application?.id || "demo-app",
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
        await fetchTickets();
        setSelectedTicketId(data.ticket.id);
      }
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#29213F]">
      <CustomerSubNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Header Breadcrumbs */}
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

          <button
            type="button"
            onClick={() => setShowNewTicketModal(true)}
            className="px-5 py-2.5 bg-[#6243AD] hover:bg-[#443074] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New message</span>
          </button>
        </div>

        {/* 2-Column Split: Conversation List (Left) vs. Active Thread (Right) */}
        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Column: Ticket List */}
            <nav className="space-y-2.5" aria-label="Conversations">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const lastMsg =
                  t.messages && t.messages.length > 0
                    ? t.messages[t.messages.length - 1].message
                    : "No messages yet";

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
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
                  onReplyAdded={fetchTickets}
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
              className="px-6 py-2.5 bg-[#6243AD] hover:bg-[#443074] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Start a conversation
            </button>
          </div>
        )}

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
                    className="px-5 py-2 bg-[#6243AD] hover:bg-[#443074] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    {loading ? "Sending..." : "Send message"}
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
