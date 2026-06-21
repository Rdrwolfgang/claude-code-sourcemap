import type { Metadata } from "next";
import { ExternalLink, CheckCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Data Sources" };

export default async function DataSourcesPage() {
  const sources = await prisma.dataSource.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <ExternalLink className="h-6 w-6 text-blue-400" />
          Data Sources
        </h1>
        <p className="text-slate-400 text-sm">
          Official public sources used to populate the Shelby Justice Tracker. All data is obtained from government-maintained public records.
        </p>
      </div>

      <div className="space-y-3">
        {sources.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {s.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                  <h3 className="font-semibold text-white">{s.name}</h3>
                </div>
                {s.description && <p className="text-sm text-slate-400">{s.description}</p>}
                {s.lastChecked && (
                  <p className="text-xs text-slate-500 mt-2">Last verified: {formatDate(s.lastChecked)}</p>
                )}
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 text-xs transition-colors shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Ethical Data Collection Guidelines</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-green-400 shrink-0 mt-0.5">✓</span>
            We only access publicly available data — no authentication bypass, no sealed records
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 shrink-0 mt-0.5">✓</span>
            We respect robots.txt and site terms of service on government portals
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 shrink-0 mt-0.5">✓</span>
            Rate limiting on scraping (when used) to avoid undue server load
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 shrink-0 mt-0.5">✓</span>
            Manual CSV import is preferred over automated scraping for sensitive portals
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 shrink-0 mt-0.5">✓</span>
            No juvenile records, no sealed/expunged records, no non-public information
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
            Data may be days to weeks behind official records due to processing lag
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-blue-700/40 bg-blue-900/10 p-5">
        <h2 className="text-sm font-semibold text-blue-300 mb-2">Contribute Data</h2>
        <p className="text-sm text-slate-400">
          Researchers, journalists, and advocates can contribute by uploading CSV exports from official sources.
          Contact us to discuss bulk data contributions or corrections to existing records.
        </p>
        <p className="text-xs text-slate-500 mt-3">
          Preferred format: CSV with columns matching our schema (case number, defendant name, charge, date, judge, disposition, bond).
          See our import template for details.
        </p>
      </div>
    </div>
  );
}
