"use client";
import { useState } from "react";
import { Info } from "lucide-react";
import { LEGAL_TERMS } from "@/lib/utils";

interface LegalTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export default function LegalTooltip({ term, children }: LegalTooltipProps) {
  const [show, setShow] = useState(false);
  const definition = LEGAL_TERMS[term];
  if (!definition) return <>{children ?? term}</>;

  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="border-b border-dashed border-slate-500 cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children ?? term}
      </span>
      <Info className="h-3 w-3 text-slate-500 cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-1">{term}</strong>
          {definition}
        </div>
      )}
    </span>
  );
}
