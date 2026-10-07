"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Clock, Shield, User } from "lucide-react";
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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          senderRole: userRole,
          updateStatus: statusUpdate || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("");
        setStatusUpdate(null);
        onReplyAdded();
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            RESOLVED
          </span>
        );
      case "AWAITING_CUSTOMER":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-amber-600" />
            ACTION REQUIRED FROM CLIENT
          </span>
        );
      case "OPEN":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1 font-mono">
            <AlertCircle className="w-3 h-3 text-blue-600" />
            OPEN INQUIRY
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#E5E0D8] bg-[#FBF9F5] flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#A37E44]">
              Ticket #{ticket.ticketNumber}
            </span>
            {renderStatusBadge(ticket.status)}
          </div>
          <h3 className="text-sm sm:text-base font-serif font-bold text-[#0B1528] mt-0.5">
            {ticket.subject}
          </h3>
        </div>

        <div className="text-[11px] text-gray-400 font-mono hidden sm:block">
          Opened: {new Date(ticket.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-white">
        {ticket.replies.map((reply: any) => {
          const isAdmin = reply.senderRole === "ADMIN";

          return (
            <div
              key={reply.id}
              className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-1.5 shadow-2xs ${
                  isAdmin
                    ? "bg-[#0B1528] text-white rounded-tl-sm"
                    : "bg-[#FBF9F5] border border-[#E5E0D8] text-gray-800 rounded-tr-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-white/10">
                  <span className={`font-bold flex items-center gap-1 ${isAdmin ? "text-[#A37E44]" : "text-[#0B1528]"}`}>
                    {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3 text-gray-400" />}
                    {reply.senderName} ({isAdmin ? "Court Legal Desk" : "Client"})
                  </span>
                  <span className={`font-mono text-[10px] ${isAdmin ? "text-gray-400" : "text-gray-400"}`}>
                    {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{reply.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Input */}
      <form onSubmit={handleSendReply} className="p-4 border-t border-[#E5E0D8] bg-[#FBF9F5] space-y-3">
        {userRole === "ADMIN" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-semibold">Status after reply:</span>
            <button
              type="button"
              onClick={() => setStatusUpdate("AWAITING_CUSTOMER")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                statusUpdate === "AWAITING_CUSTOMER"
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-white border-[#E5E0D8] text-gray-700"
              }`}
            >
              Awaiting Client Response
            </button>
            <button
              type="button"
              onClick={() => setStatusUpdate("RESOLVED")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                statusUpdate === "RESOLVED"
                  ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                  : "bg-white border-[#E5E0D8] text-gray-700"
              }`}
            >
              Mark Resolved
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            required
            placeholder={
              userRole === "ADMIN"
                ? "Type response from Abu Dhabi Civil Family Court legal desk..."
                : "Type your question or response here..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-white text-xs text-gray-800 focus:outline-none focus:border-[#A37E44]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-[#0B1528] hover:bg-[#1a2844] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-[#A37E44]" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
