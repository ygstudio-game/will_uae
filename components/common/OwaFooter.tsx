import React from "react";

export function OwaFooter() {
  return (
    <footer className="bg-[#170a24] text-white/80 text-[13px] border-t border-[#311a45] no-print relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div 
        className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#764294]/50 to-transparent" 
        aria-hidden="true" 
      />
      
      <div className="max-w-[1240px] mx-auto px-6 py-10 flex flex-col gap-6">
        {/* Top Row: Brand */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <span className="font-serif text-[22px] sm:text-[24px] text-white font-normal tracking-tight">
            Online Wills Advisor
          </span>
        </div>

        {/* Bottom Row: Legal Disclaimer & Copyright */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 border-t border-white/10 text-[12px] sm:text-[12.5px] text-[#a496b6] leading-relaxed">
          <p className="max-w-[560px] m-0">
            Online Wills Advisor is operated by SP LEGAL FZ LLE, a licensed legal consultancy providing legal guidance on Will preparation and UAE succession matters. ADJD or DIFC decide eligibility and complete formal registration.
          </p>

          <div className="flex flex-col md:items-end gap-1 shrink-0 text-white/60">
            <span>© 2026 Online Wills Advisor, operated by SP LEGAL FZ LLE</span>
            <span>Trade licence no. 19510/2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
