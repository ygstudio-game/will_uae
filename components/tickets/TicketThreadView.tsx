"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Clock, Paperclip, Check } from "lucide-react";
import { TicketStatus } from "@prisma/client";

interface TicketThreadViewProps {
  ticket: any;
  userRole: "CUSTOMER" | "ADMIN";
  onReplyAdded: () => void;
}

export function TicketThreadView({
  ticket,
  userRole,
  onReplyAdded,
}: TicketThreadViewProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<TicketStatus | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const fullMessage = attachedFileName
        ? `${message.trim()}\n\n[Attachment: ${attachedFileName}]`
        : message.trim();

      const res = await fetch(`/api/tickets/${ticket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fullMessage,
          senderRole: userRole,
          updateStatus: statusUpdate || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("");
        setAttachedFileName(null);
        setStatusUpdate(null);
        onReplyAdded();
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setLoading(false);
    }
  };

  const getChip = (status: TicketStatus) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F0EB] text-[#366D58] border border-[#BCD4C7]">
            Resolved
          </span>
        );
      case "AWAITING_CUSTOMER":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF4E5] text-[#95652B] border border-[#F2D7B2]">
            Waiting for you
          </span>
        );
      case "OPEN":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0EBF9] text-[#6243AD] border border-[#DFD2EF]">
            With our team
          </span>
        );
    }
  };

  return (
    <section className="bg-[#FFFEFA] rounded-2xl border border-[#E4DFEE] shadow-card-soft overflow-hidden flex flex-col h-[640px]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#E4DFEE] bg-[#FAF9F6] flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-bold text-[#29213F]">
              {ticket.subject}
            </h2>
            {getChip(ticket.status)}
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            Conversation #{ticket.ticketNumber || ticket.id.slice(-4)} · Opened{" "}
            {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Message History Thread */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
        {ticket.messages && ticket.messages.length > 0 ? (
          ticket.messages.map((msg: any) => {
            const isMe =
              (userRole === "CUSTOMER" && msg.senderRole === "CUSTOMER") ||
              (userRole === "ADMIN" && msg.senderRole === "ADMIN");

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[82%] ${
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[11px] text-gray-400 mb-1 px-1">
                  {isMe ? "You" : `${msg.senderName || "OWA Legal Team"} (Court Specialist)`} ·{" "}
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isMe
                      ? "bg-[#F0EBF9] text-[#29213F] rounded-br-xs border border-[#DFD2EF]"
                      : "bg-[#29213F] text-white rounded-bl-xs shadow-2xs"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400 text-xs">
            No messages in this conversation yet. Send a reply below.
          </div>
        )}
      </div>

      {/* Reply Form */}
      <form
        onSubmit={handleSendReply}
        className="p-4 border-t border-[#E4DFEE] bg-[#FAF9F6] space-y-3"
      >
        {attachedFileName && (
          <div className="text-xs text-[#6243AD] bg-[#F0EBF9] px-3 py-1.5 rounded-lg flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              <Paperclip className="w-3.5 h-3.5" />
              Attached: {attachedFileName}
            </span>
            <button
              type="button"
              onClick={() => setAttachedFileName(null)}
              className="text-gray-400 hover:text-red-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your reply or question to our legal team..."
          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#DCD4E7] bg-white focus:outline-none focus:ring-2 focus:ring-[#6243AD] focus:border-transparent text-[#29213F] placeholder-gray-400 resize-none"
        />

        <div className="flex items-center justify-between">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCD4E7] bg-white hover:bg-[#F7F4FC] text-gray-700 text-xs font-semibold transition-all">
            <Paperclip className="w-3.5 h-3.5 text-gray-500" />
            <span>Attach file</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setAttachedFileName(e.target.files[0].name);
                }
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-5 py-2 bg-[#6243AD] hover:bg-[#443074] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>{loading ? "Sending..." : "Send reply"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </section>
  );
}
