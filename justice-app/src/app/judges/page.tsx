import type { Metadata } from "next";
import Link from "next/link";
import { Users, ChevronRight, TrendingUp, Download } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatCurrency, getPartyColor, getPartyLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "Judge Dashboard" };

async function getJudges(court?: string) {
  const url = new URL("http://localhost:3000/api/judges");
  if (court) url.searchParams.set("court", court);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch judges");
  return res.json();
}

const courts = ["All", "Criminal Court", "Circuit Court", "General Sessions"];

interface JudgeWithStats {
  id: string;
  name: string;
  division: string;
  court: string;
  party: string | null;
  isActive: boolean;
  bio: string | null;
  stats: {
    totalCases: number;
    violentCases: number;
    averageBondAmount: number;
    releaseRate: number;
    guiltyPleaRate: number;
    dismissalRate: number;
    nolleRate: number;
    openCases: number;
  };
}

export default async function JudgesPage({ searchParams }: { searchParams: Promise<{ court?: string }> }) {
  const params = await searchParams;
  const courtFilter = params.court && params.court !== "All" ? params.court : undefined;
  const { data: judges } = await getJudges(courtFilter);

  const grouped: Record<string, JudgeWithStats[]> = {};
  for (const j of judges) {
    if (!grouped[j.court]) grouped[j.court] = [];
    grouped[j.court].push(j);
  }

  const courtOrder = ["Criminal Court", "General Sessions", "Circuit Court"];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Judge Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Shelby County bench — stats, case volumes, and sentencing patterns per judge.
          </p>
        </div>
        <a
          href="/api/export?type=judges&format=csv"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Court filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {courts.map((c) => {
          const active = (params.court || "All") === c;
          return (
            <Link
              key={c}
              href={c === "All" ? "/judges" : `/judges?court=${encodeURIComponent(c)}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {courtOrder.filter((c) => !courtFilter || c === courtFilter || !grouped[c]).map((court) => {
        const courtJudges = grouped[court] || [];
        if (courtJudges.length === 0) return null;

        return (
          <section key={court}>
            <h2 className="text-base font-semibold text-slate-300 flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-slate-500" />
              {court}
              <span className="text-xs font-normal text-slate-500">({courtJudges.length} judges)</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {courtJudges.map((judge) => (
                <Link
                  key={judge.id}
                  href={`/judges/${judge.id}`}
                  className="group p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-blue-600/40 hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">
                          {judge.name}
                        </h3>
                        {!judge.isActive && <Badge className="bg-slate-700 text-slate-400">Inactive</Badge>}
                        {judge.party && (
                          <span className={`text-xs font-medium ${getPartyColor(judge.party)}`}>
                            {getPartyLabel(judge.party)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{judge.division}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-lg bg-slate-900/60 p-2 text-center">
                      <p className="text-lg font-bold text-white">{judge.stats.totalCases}</p>
                      <p className="text-[10px] text-slate-500">Total Cases</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${judge.stats.violentCases > 5 ? "bg-red-900/20" : "bg-slate-900/60"}`}>
                      <p className={`text-lg font-bold ${judge.stats.violentCases > 5 ? "text-red-300" : "text-white"}`}>
                        {judge.stats.violentCases}
                      </p>
                      <p className="text-[10px] text-slate-500">Violent Cases</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/60 p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-slate-500" />
                        <p className="text-lg font-bold text-white">{judge.stats.guiltyPleaRate.toFixed(0)}%</p>
                      </div>
                      <p className="text-[10px] text-slate-500">Guilty Plea Rate</p>
                    </div>
                    <div className="rounded-lg bg-slate-900/60 p-2 text-center">
                      <p className="text-lg font-bold text-white">{formatCurrency(judge.stats.averageBondAmount)}</p>
                      <p className="text-[10px] text-slate-500">Avg Bond</p>
                    </div>
                  </div>

                  {/* Mini progress bars */}
                  <div className="mt-3 space-y-1.5">
                    {[
                      { label: "Dismissal Rate", value: judge.stats.dismissalRate, color: "bg-blue-500" },
                      { label: "Nolle Pros Rate", value: judge.stats.nolleRate, color: "bg-yellow-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-28 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
