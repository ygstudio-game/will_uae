"use client";

import React from "react";
import { AuditEvent } from "@prisma/client";
import { Clock, User, Shield, CreditCard, Edit3, CheckCircle2 } from "lucide-react";

interface AuditTimelineCardProps {
  auditEvents: AuditEvent[];
}

export function AuditTimelineCard({ auditEvents }: AuditTimelineCardProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "COURT_FEE_PAID":
      case "INITIAL_PAYMENT_COMPLETED":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case "STATUS_CHANGE":
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
      case "DRAFT_CORRECTION":
        return <Edit3 className="w-3.5 h-3.5 text-[#A37E44]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A37E44] font-mono">
            Compliance & Chain of Custody
          </span>
          <h3 className="text-base font-serif font-bold text-[#0B1528] flex items-center gap-2 mt-0.5">
            <Clock className="w-4 h-4 text-[#A37E44]" />
            Application Audit Trail ({auditEvents.length} Events)
          </h3>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0D8]">
        {auditEvents.map((event) => {
          const details: any = event.details;

          return (
            <div key={event.id} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#0B1528] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A37E44]" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#0B1528] flex items-center gap-1.5">
                    {getActionIcon(event.action)}
                    {event.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <User className="w-3 h-3 text-gray-400" />
                  <span>By: <strong>{event.actor}</strong></span>
                </div>

                {details && (
                  <p className="text-xs text-gray-700 bg-[#FBF9F5] p-2.5 rounded-lg border border-[#E5E0D8]/60 mt-1.5">
                    {details.description || details.notes || JSON.stringify(details)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {auditEvents.length === 0 && (
          <p className="text-xs text-gray-400 italic">No audit events recorded yet.</p>
        )}
      </div>
    </div>
  );
}
