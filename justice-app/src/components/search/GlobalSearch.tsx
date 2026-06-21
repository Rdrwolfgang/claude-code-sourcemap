"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "defendant" | "case" | "judge";
  id: string;
  label: string;
  sub: string;
}

export default function GlobalSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [defRes, caseRes, judgeRes] = await Promise.all([
          fetch(`/api/defendants?q=${encodeURIComponent(query)}&pageSize=3`),
          fetch(`/api/cases?q=${encodeURIComponent(query)}&pageSize=3`),
          fetch(`/api/judges?q=${encodeURIComponent(query)}&pageSize=3`),
        ]);

        const [defs, cases, judges] = await Promise.all([
          defRes.json(), caseRes.json(), judgeRes.json(),
        ]);

        const combined: SearchResult[] = [
          ...(defs.data || []).map((d: { id: string; firstName: string; lastName: string; city: string | null }) => ({
            type: "defendant" as const, id: d.id,
            label: `${d.firstName} ${d.lastName}`,
            sub: `Defendant • ${d.city || "Memphis"}, TN`,
          })),
          ...(cases.data || []).map((c: { id: string; caseNumber: string; court: string; status: string }) => ({
            type: "case" as const, id: c.id,
            label: c.caseNumber,
            sub: `${c.court} • ${c.status}`,
          })),
          ...(judges.data || []).map((j: { id: string; name: string; court: string; division: string }) => ({
            type: "judge" as const, id: j.id,
            label: j.name,
            sub: `${j.court} • ${j.division}`,
          })),
        ];

        setResults(combined);
        setOpen(combined.length > 0);
      } catch {
        // silently ignore search errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(result: SearchResult) {
    const paths: Record<string, string> = {
      defendant: "/defendants",
      case: "/cases",
      judge: "/judges",
    };
    router.push(`${paths[result.type]}/${result.id}`);
    setQuery("");
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/defendants?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  const icons = { defendant: User, case: FileText, judge: Users };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search defendants, case numbers, judges..."
            className="w-full pl-12 pr-12 py-4 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg transition-colors"
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {loading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          )}
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-600 bg-slate-800 shadow-2xl z-50 overflow-hidden">
          {results.map((r) => {
            const Icon = icons[r.type];
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  r.type === "defendant" ? "bg-red-900/40 text-red-400" :
                  r.type === "case" ? "bg-blue-900/40 text-blue-400" :
                  "bg-green-900/40 text-green-400"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{r.label}</p>
                  <p className="text-xs text-slate-400">{r.sub}</p>
                </div>
                <span className="ml-auto text-xs text-slate-500 capitalize">{r.type}</span>
              </button>
            );
          })}
          <div className="border-t border-slate-700 px-4 py-2">
            <button
              onClick={() => { router.push(`/defendants?q=${encodeURIComponent(query)}`); setOpen(false); }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
