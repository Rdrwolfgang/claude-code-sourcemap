import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { User, AlertCircle, ChevronRight } from "lucide-react";
import GlobalSearch from "@/components/search/GlobalSearch";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import { formatDate, getSeverityColor } from "@/lib/utils";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Defendant Search" };

async function fetchDefendants(params: SearchParams) {
  const url = new URL("http://localhost:3000/api/defendants");
  if (params.q) url.searchParams.set("q", params.q);
  if (params.page) url.searchParams.set("page", params.page);
  url.searchParams.set("pageSize", params.pageSize || "20");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch defendants");
  return res.json();
}

async function DefendantResults({ searchParams }: { searchParams: SearchParams }) {
  const result = await fetchDefendants(searchParams);
  const { data: defendants, total, page, totalPages } = result;
  const currentPage = parseInt(searchParams.page || "1");

  if (!searchParams.q) {
    return (
      <div className="text-center py-20 text-slate-500">
        <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg">Enter a name to search for defendants</p>
        <p className="text-sm mt-1">Search by first name, last name, or any combination</p>
      </div>
    );
  }

  if (defendants.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No defendants found for &quot;{searchParams.q}&quot;</p>
        <p className="text-sm mt-1">Try a different spelling or partial name</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Found <strong className="text-white">{total}</strong> defendant{total !== 1 ? "s" : ""} matching &quot;{searchParams.q}&quot;
      </p>

      <div className="space-y-2">
        {defendants.map((def: {
          id: string; firstName: string; lastName: string; middleName?: string;
          dob?: string; race?: string; sex?: string; city?: string;
          _count?: { cases: number };
          cases?: Array<{ case: { charges?: Array<{ isViolent: boolean; severity: string; description: string }> } }>;
        }) => {
          const allCharges = def.cases?.flatMap((cd: { case: { charges?: Array<{ isViolent: boolean; severity: string; description: string }> } }) => cd.case.charges || []) || [];
          const hasViolent = allCharges.some((c: { isViolent: boolean }) => c.isViolent);
          const topCharge = allCharges.sort((a: { severity: string }, b: { severity: string }) => {
            const order = ["Felony A", "Felony B", "Felony C", "Misdemeanor", "Violation"];
            return order.indexOf(a.severity) - order.indexOf(b.severity);
          })[0];

          return (
            <Link
              key={def.id}
              href={`/defendants/${def.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-blue-600/40 hover:bg-slate-800 transition-all group"
            >
              <div className={`p-3 rounded-full ${hasViolent ? "bg-red-900/40 text-red-400" : "bg-slate-700 text-slate-400"}`}>
                <User className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">
                    {def.lastName}, {def.firstName}{def.middleName ? ` ${def.middleName}` : ""}
                  </span>
                  {hasViolent && (
                    <Badge className="bg-red-900/50 text-red-300 border border-red-700/50">Violent History</Badge>
                  )}
                  {topCharge && (
                    <Badge className={getSeverityColor(topCharge.severity)}>{topCharge.severity}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                  {def.dob && <span>DOB: {formatDate(def.dob)}</span>}
                  {def.race && <span>{def.race}</span>}
                  {def.sex && <span>{def.sex === "M" ? "Male" : def.sex === "F" ? "Female" : def.sex}</span>}
                  {def.city && <span>{def.city}, TN</span>}
                  <span className="font-medium text-slate-300">{def._count?.cases || 0} case{def._count?.cases !== 1 ? "s" : ""}</span>
                </div>
                {topCharge && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">Top charge: {topCharge.description}</p>
                )}
              </div>

              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}

export default async function DefendantsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Defendant Search</h1>
        <p className="text-slate-400 text-sm">
          Search Shelby County criminal defendants by name. Results include all linked cases, charges, and judicial outcomes.
        </p>
      </div>

      <GlobalSearch />

      <div className="rounded-xl border border-amber-700/30 bg-amber-900/10 px-4 py-3 text-xs text-amber-200/70">
        Results show public court record data only. Charges do not imply guilt. All individuals have presumption of innocence.
      </div>

      <Suspense fallback={<div className="text-slate-500 py-10 text-center">Searching...</div>}>
        <DefendantResults searchParams={params} />
      </Suspense>
    </div>
  );
}
