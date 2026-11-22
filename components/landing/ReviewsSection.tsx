import React from "react";
import Link from "next/link";
import { Star, ArrowRight, CheckCircle2 } from "lucide-react";

const reviews = [
  {
    stars: 5,
    quote:
      "OnlineWillsAdvisor made preparing my will straightforward. The team answered my questions clearly and guided me through the registration process.",
    author: "Arjun Mehta",
    location: "Dubai",
    date: "12 October 2026",
    willType: "Single Will",
  },
  {
    stars: 5,
    quote:
      "We used OnlineWillsAdvisor to prepare our mirror wills. The process was well organised, and the team helped us understand each step before we approved our drafts.",
    author: "Emma Wilson",
    location: "Abu Dhabi",
    date: "22 September 2026",
    willType: "Mirror Wills",
  },
  {
    stars: 5,
    quote:
      "Preparing my will felt manageable with OnlineWillsAdvisor’s guidance. Communication was clear, and I understood what information and documents I needed to provide.",
    author: "Thomas Bennett",
    location: "Dubai",
    date: "5 November 2026",
    willType: "Single Will",
  },
];

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E5E0D8]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-court-bronze font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-court-bronze" />
            <span>Verified Expatriate Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#0B1528] tracking-tight">
            Client Reviews
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Read how individuals and married couples in Dubai, Abu Dhabi, and across the UAE protect their estates with Online Wills Advisor.
          </p>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-7 border border-[#E5E0D8] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#E5A83B]" aria-label="5 out of 5 stars">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E5A83B] text-[#E5A83B]" />
                  ))}
                  <span className="text-xs font-semibold text-gray-500 ml-1.5">5.0</span>
                </div>

                {/* Quote */}
                <p className="text-[14.5px] leading-relaxed text-[#2C243B] font-sans italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* Author & Metadata */}
              <div className="pt-5 mt-6 border-t border-[#F0EBE3] flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-[#0B1528] font-semibold text-[13.5px]">
                    {rev.author}
                  </strong>
                  <span className="text-gray-500">
                    {rev.location} · {rev.date}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F3EEF9] text-court-bronze-dark font-medium text-[11px]">
                  {rev.willType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA connecting directly to the URL */}
        <div className="mt-14 text-center">
          <Link
            href="/start"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#d83a3a] hover:bg-[#c22e2e] text-white font-semibold text-sm shadow-sm transition-all duration-150"
          >
            <span>Start My Will Now (From AED 999)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-500 mt-2.5">
            Bilingual English & Arabic drafting · No documents required today
          </p>
        </div>
      </div>
    </section>
  );
}

