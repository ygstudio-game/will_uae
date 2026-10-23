"use client";
import React, { useEffect, useRef, useState } from "react";

/** Scales the fixed A4 pages (595.276pt ≈ 794px) down to fit narrow screens. Print is unaffected. */
export function FitToWidth({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [h, setH] = useState<number | undefined>();

  useEffect(() => {
    const calc = () => {
      if (!wrap.current || !inner.current) return;
      const s = Math.min(1, wrap.current.clientWidth / 793.7);
      setScale(s);
      setH(inner.current.scrollHeight * s);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (wrap.current) ro.observe(wrap.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="aw-fit" style={{ height: h }}>
      <div ref={inner} className="aw-stack" style={{ transform: `scale(${scale})`, margin: scale < 1 ? 0 : "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
