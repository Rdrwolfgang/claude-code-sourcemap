import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Database, AlertTriangle, Shield, Code } from "lucide-react";

export const metadata: Metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-400" />
          Methodology & How It Works
        </h1>
        <p className="text-slate-400">
          This page explains how data is collected, processed, scored, and presented in the Shelby Justice Tracker.
        </p>
      </div>

      {[
        {
          icon: Database,
          title: "Data Sources",
          color: "text-blue-400",
          content: (
            <div className="space-y-3 text-slate-400 text-sm">
              <p>All data in this system originates from <strong className="text-white">public court records</strong> in Shelby County, TN. Primary sources include:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-slate-300">Shelby County CJS Portal</strong> (cjs.shelbycountytn.gov) — official case search</li>
                <li><strong className="text-slate-300">Tennessee Administrative Office of the Courts</strong> (tncrtinfo.com) — statewide records</li>
                <li><strong className="text-slate-300">Criminal Court Clerk of Shelby County</strong> — official filings</li>
                <li><strong className="text-slate-300">TDOC Offender Lookup</strong> — incarceration records</li>
                <li>Manual CSV uploads from authorized researchers</li>
              </ul>
              <p className="text-xs text-slate-500 italic">Note: Some Shelby County portals require login or have rate-limiting. This system uses manual data entry and file uploads where direct scraping is unavailable.</p>
            </div>
          ),
        },
        {
          icon: Code,
          title: "Data Processing",
          color: "text-green-400",
          content: (
            <div className="space-y-3 text-slate-400 text-sm">
              <p><strong className="text-slate-300">Defendant matching</strong> uses normalized name comparison (trimmed whitespace, case-insensitive). The system supports partial name searches and phonetic matching for common misspellings.</p>
              <p><strong className="text-slate-300">Charge classification:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Severity: Felony A/B/C, Misdemeanor, Violation — sourced directly from charge records</li>
                <li>&quot;Violent&quot; flag: applied per Tennessee Code § 40-35-120 (violent offenses enumeration)</li>
                <li>&quot;Drug-related&quot; flag: applied to T.C.A. § 39-17-400 series charges</li>
              </ul>
              <p><strong className="text-slate-300">Bond analysis</strong> captures the amount set at each bail hearing. OR (Own Recognizance) releases are flagged separately. &quot;Held Without Bond&quot; indicates denial.</p>
              <p><strong className="text-slate-300">Repeat offender detection</strong> is based on multiple cases for the same defendant across different filing dates, not just charges within a single case.</p>
            </div>
          ),
        },
        {
          icon: Shield,
          title: "Judge Scoring & Stats",
          color: "text-purple-400",
          content: (
            <div className="space-y-3 text-slate-400 text-sm">
              <p>Judge statistics are <strong className="text-white">descriptive, not evaluative</strong>. We display what the data shows; we do not assign a &quot;score&quot; that implies a judge is good or bad.</p>
              <p>Displayed metrics per judge:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-slate-300">Total/open cases</strong> — raw caseload</li>
                <li><strong className="text-slate-300">Violent case count</strong> — cases with at least one violent charge</li>
                <li><strong className="text-slate-300">Average bond</strong> — mean dollar amount across all set bonds</li>
                <li><strong className="text-slate-300">Guilty plea rate</strong> — % of disposed charges ending in guilty plea or verdict</li>
                <li><strong className="text-slate-300">Dismissal rate</strong> — % of charges dismissed (can reflect many factors)</li>
                <li><strong className="text-slate-300">Nolle Pros rate</strong> — % of charges not pursued by DA (reflects DA decisions, not judge)</li>
              </ul>
              <p className="text-xs text-slate-500 italic">Important: A high dismissal or nolle pros rate reflects the DA&apos;s charging decisions, not necessarily leniency by the judge.</p>
            </div>
          ),
        },
        {
          icon: AlertTriangle,
          title: "Limitations & Disclaimers",
          color: "text-amber-400",
          content: (
            <div className="space-y-3 text-slate-400 text-sm">
              <div className="rounded-lg border border-amber-700/40 bg-amber-900/10 p-4 text-amber-200/80">
                <p className="font-semibold text-amber-300 mb-2">Critical Limitations</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This system contains a <strong>sample of public data</strong>, not the complete Shelby County docket</li>
                  <li>Data may be delayed, incomplete, or contain entry errors</li>
                  <li>Charges listed do not imply guilt — all defendants have presumption of innocence</li>
                  <li>Dismissed or nolle pros charges may indicate wrongful arrest, insufficient evidence, or victim non-cooperation — not guilt</li>
                  <li>Sentencing data may be incomplete if disposition hearings are not yet recorded</li>
                  <li>Identical names may refer to different individuals</li>
                  <li>This is NOT a substitute for official court records</li>
                </ul>
              </div>
              <p>For authoritative records, always consult the <Link href="/data-sources" className="text-blue-400 hover:text-blue-300">official sources</Link>.</p>
            </div>
          ),
        },
        {
          icon: Shield,
          title: "Privacy & Security",
          color: "text-slate-400",
          content: (
            <div className="space-y-3 text-slate-400 text-sm">
              <p>This system stores <strong className="text-white">only public court record data</strong>. We do not store:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Social Security Numbers</li>
                <li>Financial account information</li>
                <li>Private addresses (only city/county)</li>
                <li>Information from sealed or expunged records</li>
                <li>Juvenile records</li>
              </ul>
              <p>Rate limiting is applied to all search endpoints to prevent abuse. Data exports are logged for accountability.</p>
              <p>If you believe data about you should be removed (e.g., expunged record), contact us with documentation.</p>
            </div>
          ),
        },
      ].map(({ icon: Icon, title, color, content }) => (
        <div key={title} className="rounded-xl border border-slate-700 bg-slate-800/60 p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Icon className={`h-5 w-5 ${color}`} />
            {title}
          </h2>
          {content}
        </div>
      ))}

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 text-xs text-slate-500">
        <p>Questions about methodology? Data corrections? Contact us via GitHub or submit an issue. This is an open-source transparency project.</p>
        <p className="mt-2">Also see: <Link href="/data-sources" className="text-blue-400 hover:text-blue-300">Data Sources</Link></p>
      </div>
    </div>
  );
}
