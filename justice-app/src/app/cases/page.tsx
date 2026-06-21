import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FileText, Download, Filter, ChevronRight, AlertCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import LegalTooltip from "@/components/ui/LegalTooltip";
import { formatDate, formatCurrency, getSeverityColor, getStatusColor, getDispositionColor } from "@/lib/utils";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Case Explorer" };

async function fetchCases(params: SearchParams & { highProfile?: string }) {
  const url = new URL("http://localhost:3000/api/cases");
  const p = params as Record<string, string | undefined>;
  Object.entries(p).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  url.searchParams.set("pageSize", "25");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cases");
  return res.json();
}

async function CaseTable({ searchParams }: { searchParams: SearchParams & { highProfile?: string } }) {
  const result = await fetchCases(searchParams);
  const { data: cases, total, totalPages } = result;
  const currentPage = parseInt(searchParams.page || "1");

  if (cases.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No cases match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Showing <strong className="text-white">{cases.length}</strong> of <strong className="text-white">{total}</strong> cases
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/80 border-b border-slate-700">
            <tr>
              {["Case #", "Filed", "Court", "Defendant", "Primary Charge", "Severity", "Disposition", "Bond", "Judge", "Status"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {(cases as Array<{
              id: string; caseNumber: string; filedDate?: string; court: string; status: string; isHighProfile: boolean;
              judge?: { id: string; name: string } | null;
              defendants?: Array<{ defendant: { id: string; firstName: string; lastName: string } }>;
              charges?: Array<{ description: string; severity: string; disposition?: string; bondAmount?: number; isViolent: boolean }>;
            }>).map((c) => {
              const charge = c.charges?.[0];
              const def = c.defendants?.[0]?.defendant;
              const hasViolent = c.charges?.some((ch) => ch.isViolent);

              return (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-800/60 transition-colors ${hasViolent ? "bg-red-900/5" : ""}`}
                >
                  <td className="px-3 py-3">
                    <Link href={`/cases/${c.id}`} className="font-mono text-blue-400 hover:text-blue-300 text-xs transition-colors flex items-center gap-1">
                      {c.caseNumber}
                      {c.isHighProfile && <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" title="High Profile" />}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(c.filedDate)}</td>
                  <td className="px-3 py-3 text-xs text-slate-400">{c.court}</td>
                  <td className="px-3 py-3">
                    {def ? (
                      <Link href={`/defendants/${def.id}`} className="text-white hover:text-blue-300 transition-colors text-xs">
                        {def.firstName} {def.lastName}
                      </Link>
                    ) : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-300 max-w-[160px]">
                    <span className={`truncate block ${hasViolent ? "text-red-300" : ""}`}>
                      {charge?.description || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {charge?.severity && <Badge className={getSeverityColor(charge.severity)}>{charge.severity}</Badge>}
                  </td>
                  <td className="px-3 py-3">
                    {charge?.disposition ? (
                      <LegalTooltip term={charge.disposition}>
                        <Badge className={getDispositionColor(charge.disposition)}>{charge.disposition}</Badge>
                      </LegalTooltip>
                    ) : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {charge?.bondAmount ? formatCurrency(charge.bondAmount) : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {c.judge ? (
                      <Link href={`/judges/${c.judge.id}`} className="text-slate-300 hover:text-blue-400 transition-colors">
                        {c.judge.name.split(" ").pop()}
                      </Link>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}

const severities = ["", "Felony A", "Felony B", "Felony C", "Misdemeanor", "Violation"];
const outcomes = ["", "Guilty", "Guilty Plea", "Not Guilty", "Nolle Pros", "Dismissed", "Diversion", "Pending"];
const courtOptions = ["", "Criminal Court", "Circuit Court", "General Sessions"];
const years = ["", "2024", "2023", "2022", "2021", "2020", "2019"];

export default async function CasesPage({ searchParams }: { searchParams: Promise<SearchParams & { highProfile?: string }> }) {
  const params = await searchParams;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Case Explorer</h1>
          <p className="text-slate-400 text-sm">Browse and filter Shelby County cases by court, charge type, and outcome.</p>
        </div>
        <a href="/api/export?type=cases&format=csv"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors">
          <Download className="h-4 w-4" />Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <form className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <select name="court" defaultValue={params.court || ""} className="rounded-lg border border-slate-600 bg-slate-900 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Courts</option>
            {courtOptions.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="severity" defaultValue={params.severity || ""} className="rounded-lg border border-slate-600 bg-slate-900 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Severities</option>
            {severities.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="outcome" defaultValue={params.outcome || ""} className="rounded-lg border border-slate-600 bg-slate-900 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Outcomes</option>
            {outcomes.slice(1).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select name="isViolent" defaultValue={params.isViolent || ""} className="rounded-lg border border-slate-600 bg-slate-900 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Charges</option>
            <option value="true">Violent Only</option>
          </select>
          <select name="year" defaultValue={params.year || ""} className="rounded-lg border border-slate-600 bg-slate-900 text-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Years</option>
            {years.slice(1).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors">
            <Filter className="h-4 w-4" />
            Apply
          </button>
        </form>

        {/* Active filters */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {params.isViolent === "true" && (
            <Badge className="bg-red-900/40 text-red-300 border border-red-700/40">Violent charges only</Badge>
          )}
          {params.highProfile === "true" && (
            <Badge className="bg-orange-900/40 text-orange-300 border border-orange-700/40">High-profile only</Badge>
          )}
          {(params.court || params.severity || params.outcome || params.year || params.isViolent) && (
            <Link href="/cases" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              Clear filters <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={<div className="text-slate-500 py-10 text-center">Loading cases...</div>}>
        <CaseTable searchParams={params} />
      </Suspense>
    </div>
  );
}
