import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Scale, User, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import LegalTooltip from "@/components/ui/LegalTooltip";
import { formatDate, formatCurrency, getSeverityColor, getDispositionColor, getStatusColor } from "@/lib/utils";

export const metadata: Metadata = { title: "Case Detail" };

async function getCase(id: string) {
  const res = await fetch(`http://localhost:3000/api/cases/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch case");
  return res.json();
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseRecord = await getCase(id);
  if (!caseRecord) notFound();

  const hasViolent = caseRecord.charges?.some((c: { isViolent: boolean }) => c.isViolent);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/cases" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Case Explorer
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-300">{caseRecord.caseNumber}</span>
      </div>

      {/* Case header */}
      <div className={`rounded-xl border p-6 ${hasViolent ? "border-red-800/40 bg-red-900/10" : "border-slate-700 bg-slate-800/60"}`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold font-mono text-white">{caseRecord.caseNumber}</h1>
              <Badge className={getStatusColor(caseRecord.status)}>{caseRecord.status}</Badge>
              {caseRecord.isHighProfile && (
                <Badge className="bg-orange-900/50 text-orange-300 border border-orange-700/50">High Profile</Badge>
              )}
              {hasViolent && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Violent Case
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
              <span>{caseRecord.court}</span>
              <span>{caseRecord.county} County, {caseRecord.state}</span>
              {caseRecord.filedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Filed: {formatDate(caseRecord.filedDate)}
                </span>
              )}
              {caseRecord.dispositionDate && <span>Resolved: {formatDate(caseRecord.dispositionDate)}</span>}
            </div>
          </div>
          <a
            href={`https://cjs.shelbycountytn.gov/cjs/public/case_detail.aspx?casenum=${caseRecord.caseNumber}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            CJS Portal
          </a>
        </div>

        {/* Court officers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {caseRecord.judge && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <Scale className="h-4 w-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Presiding Judge</p>
                <Link href={`/judges/${caseRecord.judge.id}`} className="text-white text-sm font-medium hover:text-blue-400 transition-colors">
                  {caseRecord.judge.name}
                </Link>
                <p className="text-xs text-slate-500">{caseRecord.judge.division} • {caseRecord.judge.court}</p>
              </div>
            </div>
          )}
          {caseRecord.prosecutorName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <User className="h-4 w-4 text-green-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Prosecutor</p>
                <p className="text-white text-sm font-medium">{caseRecord.prosecutorName}</p>
                {caseRecord.daOffice && <p className="text-xs text-slate-500">{caseRecord.daOffice}</p>}
              </div>
            </div>
          )}
        </div>

        {caseRecord.notes && (
          <p className="mt-4 text-sm text-slate-400 italic border-l-2 border-orange-500/50 pl-3">{caseRecord.notes}</p>
        )}
      </div>

      {/* Defendants */}
      {caseRecord.defendants && caseRecord.defendants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Defendant{caseRecord.defendants.length > 1 ? "s" : ""}</h2>
          <div className="space-y-2">
            {(caseRecord.defendants as Array<{
              defendant: {
                id: string; firstName: string; lastName: string; dob?: string;
                race?: string; sex?: string; city?: string;
                cases?: Array<{ case: { charges?: Array<{ isViolent: boolean }> } }>;
              };
            }>).map(({ defendant: def }) => {
              const priorCases = def.cases?.length || 0;
              const priorViolent = def.cases?.filter((cd) => cd.case.charges?.some((c) => c.isViolent)).length || 0;

              return (
                <Link
                  key={def.id}
                  href={`/defendants/${def.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-blue-600/40 transition-all group"
                >
                  <div className={`p-2.5 rounded-full ${priorViolent > 0 ? "bg-red-900/40 text-red-400" : "bg-slate-700 text-slate-400"}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {def.firstName} {def.lastName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {def.dob && `DOB: ${formatDate(def.dob)} • `}
                      {def.race && `${def.race} • `}
                      {def.city && `${def.city}, TN`}
                    </p>
                    {priorCases > 1 && (
                      <p className={`text-xs mt-1 ${priorViolent > 0 ? "text-red-400" : "text-slate-400"}`}>
                        {priorCases - 1} prior case{priorCases - 1 !== 1 ? "s" : ""}
                        {priorViolent > 0 && ` • ${priorViolent} violent`}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Charges */}
      {caseRecord.charges && caseRecord.charges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Charges ({caseRecord.charges.length})</h2>
          <div className="space-y-3">
            {(caseRecord.charges as Array<{
              id: string; description: string; severity: string; statute?: string;
              isViolent: boolean; isDrugRelated: boolean;
              disposition?: string; sentence?: string; bondAmount?: number; bondType?: string;
            }>).map((charge, i) => (
              <div key={charge.id} className={`rounded-xl border p-4 ${charge.isViolent ? "border-red-800/40 bg-red-900/10" : "border-slate-700 bg-slate-800/60"}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs text-slate-500">Count {i + 1}</span>
                      <Badge className={getSeverityColor(charge.severity)}>{charge.severity}</Badge>
                      {charge.isViolent && <Badge className="bg-red-900/50 text-red-300 border border-red-700/40">Violent</Badge>}
                      {charge.isDrugRelated && <Badge className="bg-purple-900/50 text-purple-300 border border-purple-700/40">Drug-Related</Badge>}
                    </div>
                    <h3 className="font-semibold text-white">{charge.description}</h3>
                    {charge.statute && <p className="text-xs text-slate-500 mt-1">{charge.statute}</p>}
                  </div>
                  {charge.disposition && (
                    <LegalTooltip term={charge.disposition}>
                      <Badge className={`${getDispositionColor(charge.disposition)} text-sm px-3 py-1`}>
                        {charge.disposition}
                      </Badge>
                    </LegalTooltip>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {charge.bondAmount && (
                    <div className="p-2 rounded-lg bg-slate-900/50">
                      <p className="text-xs text-slate-500">Bond</p>
                      <p className="text-white font-medium">{formatCurrency(charge.bondAmount)}</p>
                      {charge.bondType && <p className="text-xs text-slate-400">{charge.bondType}</p>}
                    </div>
                  )}
                  {charge.sentence && (
                    <div className="p-2 rounded-lg bg-slate-900/50 col-span-2">
                      <p className="text-xs text-slate-500">Sentence</p>
                      <p className="text-yellow-300 font-medium text-sm">{charge.sentence}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hearing timeline */}
      {caseRecord.hearings && caseRecord.hearings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Hearing History</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />
            <div className="space-y-3 ml-10">
              {(caseRecord.hearings as Array<{
                id: string; hearingDate: string; hearingType: string; outcome?: string; notes?: string;
              }>).map((h) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[30px] top-3 w-3 h-3 rounded-full border-2 border-blue-500 bg-slate-900" />
                  <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <LegalTooltip term={h.hearingType}>
                          <span className="font-medium text-white text-sm">{h.hearingType}</span>
                        </LegalTooltip>
                        {h.outcome && <Badge className="bg-slate-700 text-slate-300">{h.outcome}</Badge>}
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(h.hearingDate)}</span>
                    </div>
                    {h.notes && <p className="text-xs text-slate-400 mt-1">{h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
