import type { Metadata } from "next";
import {
  CasesByYearChart, SeverityPieChart, DispositionChart,
  JudgeVolumeChart, ViolentCasesJudgeChart, BondTypeChart,
} from "@/components/charts/AnalyticsCharts";

export const metadata: Metadata = { title: "Analytics & Patterns" };

async function getAnalytics() {
  const res = await fetch("http://localhost:3000/api/analytics", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-500 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  );
}

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const totalCases = data.casesByYear.reduce((s: number, d: { count: number }) => s + d.count, 0);
  const totalCharges = data.chargesBySeverity.reduce((s: number, d: { value: number }) => s + d.value, 0);
  const felonyA = data.chargesBySeverity.find((d: { name: string }) => d.name === "Felony A")?.value || 0;
  const totalDisp = data.dispositions.reduce((s: number, d: { value: number }) => s + d.value, 0);
  const guiltyCount = data.dispositions.find((d: { name: string }) => d.name === "Guilty Plea" || d.name === "Guilty")?.value || 0;
  const nolleCount = data.dispositions.find((d: { name: string }) => d.name === "Nolle Pros")?.value || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Analytics & Patterns</h1>
        <p className="text-slate-400 text-sm">
          Aggregated patterns from Shelby County court data. Charts show trends across judges, charge types, and case outcomes.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Cases Analyzed", value: totalCases.toLocaleString() },
          { label: "Total Charges", value: totalCharges.toLocaleString() },
          { label: "Felony A Charges", value: felonyA.toLocaleString(), highlight: true },
          { label: "Guilty Plea Rate", value: totalDisp > 0 ? `${((guiltyCount / totalDisp) * 100).toFixed(1)}%` : "N/A" },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-xl border p-4 text-center ${highlight ? "border-red-700/40 bg-red-900/10" : "border-slate-700 bg-slate-800/60"}`}>
            <p className={`text-2xl font-bold ${highlight ? "text-red-300" : "text-white"}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Cases Filed by Year" description="Total cases filed per year in Shelby County courts">
          <CasesByYearChart data={data.casesByYear} />
        </ChartCard>

        <ChartCard title="Charge Severity Distribution" description="Breakdown of all charges by severity level">
          <SeverityPieChart data={data.chargesBySeverity} />
        </ChartCard>

        <ChartCard title="Case Dispositions" description="How charges resolved — guilty, dismissed, nolle pros, etc.">
          <DispositionChart data={data.dispositions} />
        </ChartCard>

        <ChartCard title="Bond Type Frequency" description="Most common bond types and average amounts">
          <BondTypeChart data={data.bondTypes} />
        </ChartCard>
      </div>

      {/* Full-width judge charts */}
      <ChartCard title="Case Volume by Judge" description="Total cases presided over per active judge (last name shown — hover for full name)">
        <JudgeVolumeChart data={data.judgeVolume} />
      </ChartCard>

      <ChartCard title="Violent Cases by Judge" description="Number of cases involving at least one violent charge per judge">
        <ViolentCasesJudgeChart data={data.violentCasesByJudge} />
      </ChartCard>

      {/* Key metrics callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-blue-700/40 bg-blue-900/10 p-4">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">Guilty Plea Rate</h3>
          <p className="text-3xl font-bold text-white">
            {totalDisp > 0 ? `${((guiltyCount / totalDisp) * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-slate-400 mt-1">of charged resolved by guilty plea or verdict</p>
        </div>
        <div className="rounded-xl border border-yellow-700/40 bg-yellow-900/10 p-4">
          <h3 className="text-sm font-semibold text-yellow-300 mb-2">Nolle Pros Rate</h3>
          <p className="text-3xl font-bold text-white">
            {totalDisp > 0 ? `${((nolleCount / totalDisp) * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-slate-400 mt-1">of charges dropped by the DA&apos;s office</p>
        </div>
        <div className="rounded-xl border border-red-700/40 bg-red-900/10 p-4">
          <h3 className="text-sm font-semibold text-red-300 mb-2">Felony A Exposure</h3>
          <p className="text-3xl font-bold text-white">
            {totalCharges > 0 ? `${((felonyA / totalCharges) * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-slate-400 mt-1">of all charges are Class A Felonies (most serious)</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Methodology note:</strong> All statistics are computed from public court records loaded into this system.
        Sample data may not reflect all Shelby County cases. For complete records, visit the{" "}
        <a href="https://cjs.shelbycountytn.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">official CJS portal</a>.
        See <a href="/methodology" className="text-blue-400 hover:text-blue-300">Methodology</a> for data collection details.
      </div>
    </div>
  );
}
