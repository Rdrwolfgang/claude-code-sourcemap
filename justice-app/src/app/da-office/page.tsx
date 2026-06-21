import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Scale, TrendingDown, FileText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, getDispositionColor, getSeverityColor, getStatusColor } from "@/lib/utils";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "DA Office — Steve Mulroy" };

async function getDAStats() {
  const [
    totalCases,
    openCases,
    dispositionBreakdown,
    recentCases,
    highProfileCases,
    prosecutorBreakdown,
  ] = await Promise.all([
    prisma.case.count({ where: { daOffice: { contains: "Mulroy" } } }),
    prisma.case.count({ where: { daOffice: { contains: "Mulroy" }, status: { in: ["Open", "Pending"] } } }),
    prisma.charge.groupBy({
      by: ["disposition"],
      _count: { id: true },
      where: {
        disposition: { not: null },
        case: { daOffice: { contains: "Mulroy" } },
      },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.case.findMany({
      where: { daOffice: { contains: "Mulroy" } },
      include: {
        judge: { select: { id: true, name: true, division: true } },
        charges: { take: 1 },
        defendants: { include: { defendant: { select: { id: true, firstName: true, lastName: true } } }, take: 1 },
      },
      orderBy: { filedDate: "desc" },
      take: 20,
    }),
    prisma.case.findMany({
      where: { daOffice: { contains: "Mulroy" }, isHighProfile: true },
      include: {
        charges: { take: 2 },
        defendants: { include: { defendant: true }, take: 2 },
        judge: { select: { id: true, name: true } },
      },
      orderBy: { filedDate: "desc" },
      take: 8,
    }),
    prisma.case.groupBy({
      by: ["prosecutorName"],
      _count: { id: true },
      where: { daOffice: { contains: "Mulroy" }, prosecutorName: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const totalCharges = dispositionBreakdown.reduce((s, d) => s + d._count.id, 0);
  const nolles = dispositionBreakdown.find((d) => d.disposition === "Nolle Pros")?._count.id || 0;
  const dismissed = dispositionBreakdown.find((d) => d.disposition === "Dismissed")?._count.id || 0;
  const guilty = dispositionBreakdown.filter((d) => d.disposition === "Guilty" || d.disposition === "Guilty Plea")
    .reduce((s, d) => s + d._count.id, 0);

  return {
    totalCases,
    openCases,
    totalCharges,
    nolles,
    dismissed,
    guilty,
    dispositionBreakdown,
    recentCases,
    highProfileCases,
    prosecutorBreakdown,
  };
}

export default async function DAOfficePage() {
  const stats = await getDAStats();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="rounded-xl border border-orange-700/40 bg-orange-900/10 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-orange-900/40 text-orange-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">DA Office — Steve Mulroy</h1>
            <p className="text-slate-400 text-sm mb-3">
              30th Judicial District (Shelby County) • District 9 • Elected 2022
            </p>
            <p className="text-slate-400 text-sm max-w-2xl">
              This section tracks prosecutorial patterns under District Attorney Steve Mulroy&apos;s office,
              including case outcomes, plea deals, nolle pros rates, and high-profile prosecutions.
              All data from public court records.
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <a href="https://www.shelbycountytn.gov/185/District-Attorney" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors border border-orange-700/40 rounded-lg px-3 py-1.5">
                <ExternalLink className="h-3.5 w-3.5" />Official DA Website
              </a>
              <a href="/api/export?type=cases&format=csv" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors border border-slate-600 rounded-lg px-3 py-1.5">
                <FileText className="h-3.5 w-3.5" />Export Cases CSV
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Cases", value: stats.totalCases, sub: "in database" },
          { label: "Open/Pending", value: stats.openCases, sub: "active cases" },
          { label: "Nolle Pros", value: stats.nolles, sub: `${stats.totalCharges > 0 ? ((stats.nolles / stats.totalCharges) * 100).toFixed(1) : 0}% of charges`, highlight: stats.nolles > 20 },
          { label: "Guilty Plea/Verdict", value: stats.guilty, sub: `${stats.totalCharges > 0 ? ((stats.guilty / stats.totalCharges) * 100).toFixed(1) : 0}% of charges` },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className={`rounded-xl border p-4 ${highlight ? "border-yellow-700/40 bg-yellow-900/10" : "border-slate-700 bg-slate-800/60"}`}>
            <p className={`text-2xl font-bold ${highlight ? "text-yellow-300" : "text-white"}`}>{value.toLocaleString()}</p>
            <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Disposition breakdown */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-slate-400" />
          Charge Disposition Breakdown (30th Judicial District)
        </h2>
        <div className="space-y-2">
          {stats.dispositionBreakdown.slice(0, 8).map((d: { disposition: string | null; _count: { id: number } }) => {
            const pct = stats.totalCharges > 0 ? (d._count.id / stats.totalCharges) * 100 : 0;
            return (
              <div key={d.disposition} className="flex items-center gap-3">
                <span className="text-xs w-36 shrink-0">
                  <Badge className={getDispositionColor(d.disposition)}>{d.disposition}</Badge>
                </span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-20 text-right">{pct.toFixed(1)}% ({d._count.id})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADA breakdown */}
      {stats.prosecutorBreakdown.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Cases by ADA</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {stats.prosecutorBreakdown.map((p: { prosecutorName: string | null; _count: { id: number } }) => (
              <div key={p.prosecutorName} className="rounded-lg bg-slate-900/50 border border-slate-700 p-3 text-center">
                <p className="text-lg font-bold text-white">{p._count.id}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{p.prosecutorName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-profile cases */}
      {stats.highProfileCases.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            High-Profile Cases
          </h2>
          <div className="space-y-2">
            {(stats.highProfileCases as unknown as Array<{
              id: string; caseNumber: string; court: string; status: string; filedDate?: string;
              judge?: { id: string; name: string } | null;
              charges?: Array<{ description: string; severity: string; isViolent: boolean }>;
              defendants?: Array<{ defendant: { id: string; firstName: string; lastName: string } }>;
            }>).map((c) => (
              <Link key={c.id} href={`/cases/${c.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-orange-800/30 bg-orange-900/5 hover:border-orange-700/50 transition-all group">
                <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-blue-400 text-sm">{c.caseNumber}</span>
                    {c.defendants?.slice(0, 2).map((cd) => (
                      <span key={cd.defendant.id} className="text-white text-sm">
                        {cd.defendant.firstName} {cd.defendant.lastName}
                      </span>
                    ))}
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {c.charges?.slice(0, 2).map((ch, i) => (
                      <span key={i} className="text-xs text-slate-400 flex items-center gap-1">
                        {ch.description}
                        <Badge className={getSeverityColor(ch.severity)}>{ch.severity}</Badge>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.court}
                    {c.judge && <> • Judge {c.judge.name}</>}
                    {c.filedDate && <> • Filed {formatDate(c.filedDate)}</>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent cases */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Scale className="h-5 w-5 text-slate-400" />
          Recent Cases (30th Judicial District)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700">
              <tr>
                {["Case #", "Date", "Defendant", "Charge", "Judge", "Status"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {(stats.recentCases as unknown as Array<{
                id: string; caseNumber: string; filedDate?: string; status: string;
                judge?: { id: string; name: string } | null;
                charges?: Array<{ description: string; severity: string }>;
                defendants?: Array<{ defendant: { id: string; firstName: string; lastName: string } }>;
              }>).map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2.5">
                    <Link href={`/cases/${c.id}`} className="font-mono text-blue-400 hover:text-blue-300 text-xs">{c.caseNumber}</Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{formatDate(c.filedDate)}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {c.defendants?.[0] ? (
                      <Link href={`/defendants/${c.defendants[0].defendant.id}`} className="text-white hover:text-blue-300 transition-colors">
                        {c.defendants[0].defendant.firstName} {c.defendants[0].defendant.lastName}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-300">
                    {c.charges?.[0] ? (
                      <span className="flex items-center gap-1.5">
                        <span className="truncate max-w-[140px]">{c.charges[0].description}</span>
                        <Badge className={getSeverityColor(c.charges[0].severity)}>{c.charges[0].severity}</Badge>
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {c.judge ? (
                      <Link href={`/judges/${c.judge.id}`} className="text-slate-300 hover:text-blue-400 transition-colors">
                        {c.judge.name.split(" ").pop()}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
