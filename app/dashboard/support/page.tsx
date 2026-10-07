"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { TicketThreadView } from "@/components/tickets/TicketThreadView";
import { useOwaStore } from "@/store/useOwaStore";
import Link from "next/link";

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

export default function CustomerSupportPage() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");

  const { application } = useOwaStore();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(!!topicParam);
  const [newSubject, setNewSubject] = useState(
    topicParam && TOPIC_PRESETS[topicParam]
      ? TOPIC_PRESETS[topicParam].subject
      : "Child Passport Assistance (Consular / Emergency Guidance)"
  );
  const [newMessage, setNewMessage] = useState(
    topicParam && TOPIC_PRESETS[topicParam] ? TOPIC_PRESETS[topicParam].message : ""
  );
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
          initialMessage: newMessage.trim(),
          senderName: application?.account?.fullName || "Testator",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowNewTicketModal(false);
        setNewMessage("");
        await fetchTickets();
        setSelectedTicketId(data.ticket.id);
      }
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A37E44]/10 text-[#A37E44] text-xs font-semibold uppercase tracking-wider font-mono">
              <Shield className="w-3.5 h-3.5" />
              Direct Judicial & Legal Support Desk
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0B1528] mt-1">
              Legal Support & Court Assistance
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Communicate directly with our Abu Dhabi court-certified legal specialists regarding passports, transliterations, and registrations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2.5 bg-[#0B1528] hover:bg-[#1a2844] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#A37E44]" />
            Open New Inquiry
          </button>
        </div>

        {/* Modal: New Ticket */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-[#E5E0D8]">
              <div className="border-b border-[#E5E0D8] pb-3">
                <h3 className="text-lg font-serif font-bold text-[#0B1528]">
                  Open Legal Support Ticket
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Our legal team typically responds within 2-4 business hours.
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => {
                      setNewSubject(e.target.value);
                      if (e.target.value.includes("Child Passport")) {
                        setNewMessage(TOPIC_PRESETS.child_passport.message);
                      } else if (e.target.value.includes("Court Registry Fee")) {
                        setNewMessage(TOPIC_PRESETS.court_fee.message);
                      } else if (e.target.value.includes("Transliteration")) {
                        setNewMessage(TOPIC_PRESETS.arabic_name.message);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] bg-white text-xs focus:outline-none focus:border-[#A37E44]"
                  >
                    <option value="Child Passport Assistance (Consular / Emergency Guidance)">
                      Child Passport Assistance (Consular / Emergency Guidance)
                    </option>
                    <option value="Arabic Phonetic Transliteration Verification">
                      Arabic Phonetic Transliteration Verification
                    </option>
                    <option value="Court Registry Fee Inquiry">
                      Court Registry Fee Inquiry
                    </option>
                    <option value="Estate Distribution / Beneficiary Revision Request">
                      Estate Distribution / Beneficiary Revision Request
                    </option>
                    <option value="General Court Registration Question">
                      General Court Registration Question
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Describe your inquiry or request in detail..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E0D8] bg-white text-xs leading-relaxed focus:outline-none focus:border-[#A37E44]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#0B1528] text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tickets Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
              Your Support Threads ({tickets.length})
            </h3>

            {tickets.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500">No active support tickets.</p>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(true)}
                  className="text-xs text-[#A37E44] font-bold hover:underline"
                >
                  Create an inquiry
                </button>
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedTicketId === t.id
                      ? "bg-white border-[#0B1528] shadow-sm ring-1 ring-[#0B1528]"
                      : "bg-white border-[#E5E0D8] hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-[#A37E44]">#{t.ticketNumber}</span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0B1528] line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                    {t.replies[t.replies.length - 1]?.message || "No messages"}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Active Thread View */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <TicketThreadView
                ticket={selectedTicket}
                userRole="CUSTOMER"
                onReplyAdded={fetchTickets}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E0D8] h-[400px] flex items-center justify-center text-gray-400 text-xs italic">
                Select a support thread to view messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
