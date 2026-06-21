import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Scale, Users, Calendar, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import LegalTooltip from "@/components/ui/LegalTooltip";
import { formatDate, formatCurrency, getSeverityColor, getDispositionColor, getStatusColor, getPartyColor, getPartyLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Judge Detail" };

async function getJudge(id: string) {
  const res = await fetch(`http://localhost:3000/api/judges/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch judge");
  return res.json();
}

export default async function JudgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const judge = await getJudge(id);
  if (!judge) notFound();

  const cases = judge.cases || [];
  const allCharges = cases.flatMap((c: { charges?: unknown[] }) => c.charges || []);

  // Compute live stats
  const closedCases = cases.filter((c: { status: string }) => ["Closed", "Appealed"].includes(c.status));
  const openCases = cases.filter((c: { status: string }) => ["Open", "Pending"].includes(c.status));
  const violentCases = cases.filter((c: { charges?: Array<{ isViolent: boolean }> }) => c.charges?.some((ch) => ch.isViolent));

  const chargesWithDisp = allCharges.filter((ch: { disposition?: string }) => ch.disposition && ch.disposition !== "Pending");
  const guiltyPleas = chargesWithDisp.filter((ch: { disposition: string }) => ch.disposition === "Guilty Plea" || ch.disposition === "Guilty").length;
  const dismissed = chargesWithDisp.filter((ch: { disposition: string }) => ch.disposition === "Dismissed").length;
  const nolles = chargesWithDisp.filter((ch: { disposition: string }) => ch.disposition === "Nolle Pros").length;
  const bonds = allCharges.filter((ch: { bondAmount?: number }) => ch.bondAmount != null).map((ch: { bondAmount: number }) => ch.bondAmount);
  const avgBond = bonds.length > 0 ? bonds.reduce((a: number, b: number) => a + b, 0) / bonds.length : 0;

  // Disposition breakdown for display
  const dispCounts: Record<string, number> = {};
  for (const ch of chargesWithDisp as Array<{ disposition: string }>) {
    dispCounts[ch.disposition] = (dispCounts[ch.disposition] || 0) + 1;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/judges" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Judge Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-300">{judge.name}</span>
      </div>

      {/* Judge profile card */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-full bg-blue-900/40 text-blue-400">
            <Scale className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-bold text-white">{judge.name}</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {judge.court} • {judge.division}
                  {judge.party && (
                    <span className={`ml-2 ${getPartyColor(judge.party)}`}>({getPartyLabel(judge.party)})</span>
                  )}
                  {judge.appointedDate && ` • Appointed ${formatDate(judge.appointedDate)}`}
                </p>
                {judge.bio && <p className="text-slate-400 text-sm mt-2">{judge.bio}</p>}
              </div>
              {!judge.isActive && <Badge className="bg-slate-700 text-slate-400">Inactive</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Cases" value={cases.length} icon={FileText} />
        <StatCard label="Open/Pending" value={openCases.length} icon={TrendingUp} />
        <StatCard label="Violent Cases" value={violentCases.length} icon={AlertTriangle} highlight={violentCases.length > 3} />
        <StatCard label="Avg Bond" value={formatCurrency(avgBond)} icon={Scale} />
      </div>

      {/* Rate bars */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Charge Disposition Rates</h2>
        <div className="space-y-3">
          {[
            { label: "Guilty / Guilty Plea", value: chargesWithDisp.length > 0 ? (guiltyPleas / chargesWithDisp.length) * 100 : 0, color: "bg-red-500", count: guiltyPleas },
            { label: "Dismissed", value: chargesWithDisp.length > 0 ? (dismissed / chargesWithDisp.length) * 100 : 0, color: "bg-blue-500", count: dismissed },
            { label: "Nolle Pros", value: chargesWithDisp.length > 0 ? (nolles / chargesWithDisp.length) * 100 : 0, color: "bg-yellow-500", count: nolles },
          ].map(({ label, value, color, count }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-36 shrink-0">
                <LegalTooltip term={label.includes("Nolle") ? "Nolle Pros" : label}>{label}</LegalTooltip>
              </span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
              </div>
              <span className="text-xs text-slate-300 w-16 text-right">{value.toFixed(1)}% ({count})</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Based on {chargesWithDisp.length} charges with known dispositions</p>
      </div>

      {/* Disposition breakdown */}
      {Object.keys(dispCounts).length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Disposition Breakdown</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dispCounts).sort((a, b) => b[1] - a[1]).map(([disp, count]) => (
              <div key={disp} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${getDispositionColor(disp)}`}>
                <LegalTooltip term={disp}>{disp}</LegalTooltip>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Recent Cases
            <span className="text-sm font-normal text-slate-400 ml-2">(last {cases.length})</span>
          </h2>
        </div>
        <div className="space-y-2">
          {(cases as Array<{
            id: string; caseNumber: string; court: string; status: string;
            filedDate?: string;
            charges?: Array<{ description: string; severity: string; disposition?: string; isViolent: boolean }>;
            defendants?: Array<{ defendant: { firstName: string; lastName: string } }>;
          }>).slice(0, 20).map((c) => {
            const topCharge = c.charges?.[0];
            const def = c.defendants?.[0]?.defendant;
            const hasViolent = c.charges?.some((ch) => ch.isViolent);

            return (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:bg-slate-800 group ${hasViolent ? "border-red-800/40 bg-red-900/5" : "border-slate-700 bg-slate-800/40"}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-blue-400 text-sm">{c.caseNumber}</span>
                    {def && <span className="text-sm text-white">{def.firstName} {def.lastName}</span>}
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                    {hasViolent && <Badge className="bg-red-900/50 text-red-300 border border-red-700/40">Violent</Badge>}
                  </div>
                  {topCharge && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{topCharge.description}</span>
                      <Badge className={getSeverityColor(topCharge.severity)}>{topCharge.severity}</Badge>
                      {topCharge.disposition && (
                        <Badge className={getDispositionColor(topCharge.disposition)}>{topCharge.disposition}</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(c.filedDate)}
                </div>
                <Users className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
