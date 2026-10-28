import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "OWA Developer Handbook | Online Wills Advisor",
  description:
    "Official Developer Handbook, product specifications, and asset register for Online Wills Advisor.",
};

export default function HandbookPage() {
  return (
    <div className="flex flex-col flex-1 bg-[#F8F6FB] min-h-screen">
      {/* Top Banner Navigation */}
      <div className="bg-[#21152F] text-white px-6 py-3 border-b border-[#443158] flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/start"
            className="inline-flex items-center gap-1.5 text-xs text-[#E1DDEB] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Pre-Payment Flow</span>
          </Link>
          <span className="text-[#645277]">|</span>
          <span className="font-serif tracking-wide text-white text-xs font-semibold">
            OWA DEVELOPER HANDBOOK & SPECIFICATIONS
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a
            href="/handbook.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#E1DDEB] hover:text-white"
          >
            <span>Open Standalone</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <Link
            href="/"
            className="text-[#E1DDEB] hover:text-white underline underline-offset-4"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Embedded Full Developer Handbook */}
      <div className="flex-1 w-full min-h-[calc(100vh-50px)]">
        <iframe
          src="/handbook.html"
          title="OWA Developer Handbook"
          className="w-full h-full min-h-[calc(100vh-50px)] border-0"
        />
      </div>
    </div>
  );
}
