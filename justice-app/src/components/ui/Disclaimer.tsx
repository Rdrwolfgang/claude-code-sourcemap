"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function Disclaimer() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-amber-900/30 border-b border-amber-700/50 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-200/80 flex-1">
          <strong className="text-amber-300">Public Records Only:</strong>{" "}
          This tool aggregates publicly available court data. It is NOT legal advice, does not represent official records,
          and data may be incomplete or contain errors. Charges do not imply guilt. Individuals have presumption of innocence.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-200 transition-colors shrink-0"
          aria-label="Dismiss disclaimer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
