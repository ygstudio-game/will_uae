"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Shield,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
} from "lucide-react";
import Link from "next/link";
import { TicketThreadView } from "@/components/tickets/TicketThreadView";
import { TicketStatus } from "@prisma/client";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ admin: "true" });
      if (statusFilter) queryParams.set("status", statusFilter);

      const res = await fetch(`/api/tickets?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicketId) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const filteredTickets = tickets.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.subject.toLowerCase().includes(term) ||
      t.application?.account?.fullName?.toLowerCase().includes(term) ||
      t.application?.account?.email?.toLowerCase().includes(term) ||
      String(t.ticketNumber).includes(term)
    );
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="min-h-screen bg-[#FBF9F5] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white border border-[#E5E0D8] text-gray-700 hover:text-[#0B1528] shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0B1528]">
                  Legal Support & Client Communications Desk
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#0B1528] text-white">
                  ADJD Civil Court
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Centralized messaging across all active Non-Muslim Will applications
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ticket #, client, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E0D8] text-xs focus:outline-none focus:border-[#A37E44]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === null
                  ? "bg-[#0B1528] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("OPEN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "OPEN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("AWAITING_CUSTOMER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "AWAITING_CUSTOMER"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Awaiting Client
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("RESOLVED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "RESOLVED"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Selector List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicketId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
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

                  <div className="font-semibold text-xs text-[#0B1528] line-clamp-1">
                    {t.subject}
                  </div>

                  <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
                    <span>{t.application?.account?.fullName || "Client"}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        t.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "AWAITING_CUSTOMER"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="p-8 rounded-2xl bg-white border border-[#E5E0D8] text-center text-gray-400 text-xs italic">
                No support tickets found for active filter.
              </div>
            )}
          </div>

          {/* Active Thread View with Admin Powers */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <TicketThreadView
                ticket={selectedTicket}
                userRole="ADMIN"
                onReplyAdded={fetchTickets}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E0D8] h-[600px] flex items-center justify-center text-gray-400 text-xs italic">
                Select a ticket to begin communication
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
