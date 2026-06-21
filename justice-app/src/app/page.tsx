import Link from "next/link";
import { Search, Users, BarChart2, FileText, AlertTriangle, TrendingUp, Shield, ExternalLink } from "lucide-react";
import GlobalSearch from "@/components/search/GlobalSearch";
import { prisma } from "@/lib/db";

async function getStats() {
  const [totalCases, totalJudges, totalDefendants, violentCases, openCases] = await Promise.all([
    prisma.case.count(),
    prisma.judge.count({ where: { isActive: true } }),
    prisma.defendant.count(),
    prisma.charge.count({ where: { isViolent: true } }),
    prisma.case.count({ where: { status: { in: ["Open", "Pending"] } } }),
  ]);
  return { totalCases, totalJudges, totalDefendants, violentCases, openCases };
}

async function getRecentHighProfile() {
  return prisma.case.findMany({
    where: { isHighProfile: true },
    include: {
      judge: true,
      charges: { take: 1 },
      defendants: { include: { defendant: true }, take: 1 },
    },
    orderBy: { filedDate: "desc" },
    take: 5,
  });
}

export default async function Home() {
  const [stats, highProfile] = await Promise.all([getStats(), getRecentHighProfile()]);

  const quickLinks = [
    { href: "/defendants", icon: Search, label: "Defendant Search", desc: "Find criminal history by name or DOB", color: "text-blue-400 bg-blue-900/20 border-blue-700/40" },
    { href: "/judges", icon: Users, label: "Judge Dashboard", desc: "Stats per judge: release rates, sentencing", color: "text-green-400 bg-green-900/20 border-green-700/40" },
    { href: "/cases", icon: FileText, label: "Case Explorer", desc: "Filter by charge, outcome, court", color: "text-purple-400 bg-purple-900/20 border-purple-700/40" },
    { href: "/analytics", icon: BarChart2, label: "Analytics & Patterns", desc: "Charts: recidivism, leniency, trends", color: "text-orange-400 bg-orange-900/20 border-orange-700/40" },
    { href: "/da-office", icon: AlertTriangle, label: "DA Office", desc: "Mulroy's 30th Judicial District cases", color: "text-red-400 bg-red-900/20 border-red-700/40" },
    { href: "/methodology", icon: Shield, label: "Methodology", desc: "How data is collected and scored", color: "text-slate-400 bg-slate-800/40 border-slate-700/40" },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-10 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-700/40 bg-blue-900/20 px-4 py-1.5 text-xs text-blue-300 mb-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Shelby County, TN • 30th Judicial District • Public Records Only
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Criminal Justice<br />
          <span className="text-blue-400">Transparency Tool</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Search public court records for Shelby County defendants, track judge decisions, analyze DA Mulroy&apos;s prosecutions,
          and identify patterns in criminal outcomes across Memphis courts.
        </p>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto">
        <GlobalSearch autoFocus />
        <p className="text-center text-xs text-slate-500 mt-3">
          Search by defendant name, case number, or judge name
        </p>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Cases", value: stats.totalCases.toLocaleString() },
          { label: "Active Judges", value: stats.totalJudges.toLocaleString() },
          { label: "Defendants", value: stats.totalDefendants.toLocaleString() },
          { label: "Violent Charges", value: stats.violentCases.toLocaleString(), highlight: true },
          { label: "Open Cases", value: stats.openCases.toLocaleString() },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${highlight ? "border-red-700/40 bg-red-900/10" : "border-slate-700 bg-slate-800/60"}`}>
            <p className={`text-2xl font-bold ${highlight ? "text-red-300" : "text-white"}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Explore the Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-start gap-3 p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-lg ${color}`}
            >
              <div className={`p-2 rounded-lg border ${color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* High-profile cases */}
      {highProfile.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">High-Profile Cases</h2>
            <Link href="/cases?highProfile=true" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="space-y-2">
            {highProfile.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-blue-600/40 hover:bg-slate-800 transition-all group"
              >
                <div className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-blue-400 text-sm font-medium">{c.caseNumber}</span>
                    {c.defendants[0] && (
                      <span className="text-white text-sm">
                        {c.defendants[0].defendant.firstName} {c.defendants[0].defendant.lastName}
                      </span>
                    )}
                    {c.charges[0] && (
                      <span className="text-xs text-slate-400">{c.charges[0].description}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.court} • {c.judge?.name ?? "Unassigned"} • {c.status}
                  </p>
                </div>
                <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-lg">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Official sources */}
      <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-6">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Official Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Shelby County CJS Portal", url: "https://cjs.shelbycountytn.gov", desc: "Official case records" },
            { label: "DA Office – Steve Mulroy", url: "https://www.shelbycountytn.gov/185/District-Attorney", desc: "30th Judicial District" },
            { label: "TN Court Info", url: "https://tncrtinfo.com", desc: "Statewide court records" },
          ].map(({ label, url, desc }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-2 p-3 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-700/40 transition-colors group">
              <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-400 mt-0.5 shrink-0 transition-colors" />
              <div>
                <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
