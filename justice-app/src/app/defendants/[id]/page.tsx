import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Calendar, AlertCircle, ChevronLeft, ExternalLink, Scale } from "lucide-react";
import Badge from "@/components/ui/Badge";
import LegalTooltip from "@/components/ui/LegalTooltip";
import { formatDate, formatCurrency, getSeverityColor, getDispositionColor, getStatusColor } from "@/lib/utils";

export const metadata: Metadata = { title: "Defendant Detail" };

async function getDefendant(id: string) {
  const res = await fetch(`http://localhost:3000/api/defendants/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch defendant");
  return res.json();
}

export default async function DefendantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const defendant = await getDefendant(id);
  if (!defendant) notFound();

  const cases = defendant.cases?.map((cd: { case: unknown }) => cd.case) || [];
  const allCharges = cases.flatMap((c: { charges?: unknown[] }) => c.charges || []);
  const violentCharges = allCharges.filter((c: { isViolent: boolean }) => c.isViolent);
  const hasViolentHistory = violentCharges.length > 0;
  const totalCases = cases.length;

  const severityCounts: Record<string, number> = {};
  for (const ch of allCharges as Array<{ severity: string }>) {
    severityCounts[ch.severity] = (severityCounts[ch.severity] || 0) + 1;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/defendants" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Defendant Search
        </Link>
        <span>/</span>
        <span className="text-slate-300">{defendant.firstName} {defendant.lastName}</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-full ${hasViolentHistory ? "bg-red-900/40 text-red-400" : "bg-slate-700 text-slate-400"}`}>
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {defendant.firstName}{defendant.middleName ? ` ${defendant.middleName}` : ""} {defendant.lastName}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {defendant.dob && `DOB: ${formatDate(defendant.dob)} • `}
                  {defendant.race && `${defendant.race} • `}
                  {defendant.sex === "M" ? "Male" : defendant.sex === "F" ? "Female" : defendant.sex}
                  {defendant.city && ` • ${defendant.city}, ${defendant.state}`}
                </p>
              </div>
              {hasViolentHistory && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Violent History
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Total Cases", value: totalCases },
                { label: "Violent Charges", value: violentCharges.length, highlight: violentCharges.length > 0 },
                { label: "Total Charges", value: allCharges.length },
                { label: "Felony A/B", value: (severityCounts["Felony A"] || 0) + (severityCounts["Felony B"] || 0), highlight: ((severityCounts["Felony A"] || 0) + (severityCounts["Felony B"] || 0)) > 0 },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`rounded-lg border p-3 text-center ${highlight ? "border-red-700/40 bg-red-900/10" : "border-slate-700 bg-slate-900/40"}`}>
                  <p className={`text-xl font-bold ${highlight ? "text-red-300" : "text-white"}`}>{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case timeline */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Case History Timeline</h2>
        {cases.length === 0 ? (
          <p className="text-slate-500">No cases found.</p>
        ) : (
          <div className="space-y-4">
            {(cases as Array<{
              id: string; caseNumber: string; court: string; status: string;
              filedDate?: string; dispositionDate?: string; isHighProfile: boolean;
              judge?: { name: string; division: string } | null;
              prosecutorName?: string;
              charges?: Array<{
                id: string; description: string; severity: string; disposition?: string;
                bondAmount?: number; bondType?: string; sentence?: string; isViolent: boolean;
              }>;
              hearings?: Array<{ id: string; hearingDate: string; hearingType: string; outcome?: string }>;
            }>).map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
                {/* Case header */}
                <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-700">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/cases/${c.id}`} className="font-mono text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      {c.caseNumber}
                    </Link>
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                    {c.isHighProfile && <Badge className="bg-orange-900/50 text-orange-300 border border-orange-700/50">High Profile</Badge>}
                    <span className="text-sm text-slate-400">{c.court}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    Filed: {formatDate(c.filedDate)}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Judge and prosecutor */}
                  {(c.judge || c.prosecutorName) && (
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      {c.judge && (
                        <span className="flex items-center gap-1">
                          <Scale className="h-3.5 w-3.5 text-slate-500" />
                          <Link href={`/judges/${(c.judge as { id?: string }).id}`} className="text-slate-300 hover:text-blue-400 transition-colors">
                            Judge {c.judge.name} ({c.judge.division})
                          </Link>
                        </span>
                      )}
                      {c.prosecutorName && (
                        <span>Prosecutor: {c.prosecutorName}</span>
                      )}
                      {c.dispositionDate && <span>Disposition: {formatDate(c.dispositionDate)}</span>}
                    </div>
                  )}

                  {/* Charges */}
                  {c.charges && c.charges.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-2">Charges</p>
                      <div className="space-y-1.5">
                        {c.charges.map((ch) => (
                          <div key={ch.id} className={`flex items-start gap-2 p-2.5 rounded-lg ${ch.isViolent ? "bg-red-900/15 border border-red-800/30" : "bg-slate-900/40 border border-slate-700/50"}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-white">{ch.description}</span>
                                <Badge className={getSeverityColor(ch.severity)}>{ch.severity}</Badge>
                                {ch.isViolent && <Badge className="bg-red-900/50 text-red-300 border border-red-700/40">Violent</Badge>}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                                {ch.disposition && (
                                  <LegalTooltip term={ch.disposition}>
                                    <Badge className={getDispositionColor(ch.disposition)}>{ch.disposition}</Badge>
                                  </LegalTooltip>
                                )}
                                {ch.bondAmount && <span>Bond: {formatCurrency(ch.bondAmount)} ({ch.bondType})</span>}
                                {ch.sentence && <span className="text-yellow-400">Sentence: {ch.sentence}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hearings mini-timeline */}
                  {c.hearings && c.hearings.length > 0 && (
                    <details className="group">
                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors list-none flex items-center gap-1">
                        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                        {c.hearings.length} hearing event{c.hearings.length !== 1 ? "s" : ""}
                      </summary>
                      <div className="mt-2 ml-4 space-y-1 border-l border-slate-700 pl-3">
                        {c.hearings.map((h) => (
                          <div key={h.id} className="text-xs text-slate-400">
                            <span className="text-slate-500">{formatDate(h.hearingDate)}</span>
                            {" • "}
                            <LegalTooltip term={h.hearingType}>{h.hearingType}</LegalTooltip>
                            {h.outcome && ` → ${h.outcome}`}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  <Link href={`/cases/${c.id}`} className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    View full case details <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
