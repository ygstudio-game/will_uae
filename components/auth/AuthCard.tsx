import React from "react";
import { Scale } from "lucide-react";
import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthCard({
  title,
  subtitle = "Abu Dhabi Civil Family Court Non-Muslim Will Preparation",
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-alabaster">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem */}
        <div className="flex justify-center mb-4">
          <Link href="/" className="w-12 h-12 rounded-xl bg-obsidian border border-court-bronze/40 flex items-center justify-center text-court-bronze shadow-md group">
            <Scale className="w-6 h-6 group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold tracking-tight text-obsidian">
          {title}
        </h2>
        <p className="mt-1.5 text-center text-xs text-gray-500 max-w-xs mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-court-border shadow-court">
          {children}

          {footerText && footerLinkText && footerLinkHref && (
            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
              <span>{footerText} </span>
              <Link
                href={footerLinkHref}
                className="font-semibold text-court-bronze hover:text-court-bronze-dark transition-colors"
              >
                {footerLinkText}
              </Link>
            </div>
          )}
        </div>

        {/* Security badge at bottom */}
        <div className="mt-6 text-center text-[11px] text-gray-400">
          Encrypted session · 1-Year privacy policy · Official Court Form ADJD-NM1221-06-01
        </div>
      </div>
    </div>
  );
}
