"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const SEVERITY_COLORS: Record<string, string> = {
  "Felony A": "#dc2626",
  "Felony B": "#ea580c",
  "Felony C": "#d97706",
  "Misdemeanor": "#65a30d",
  "Violation": "#64748b",
};

interface AnalyticsData {
  casesByYear: Array<{ year: string; count: number }>;
  chargesBySeverity: Array<{ name: string; value: number }>;
  dispositions: Array<{ name: string; value: number }>;
  judgeVolume: Array<{ name: string; fullName: string; court: string; cases: number }>;
  violentCasesByJudge: Array<{ name: string; fullName: string; violentCases: number }>;
  bondTypes: Array<{ name: string; count: number; avgAmount: number }>;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
}

export function CasesByYearChart({ data }: { data: AnalyticsData["casesByYear"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Cases Filed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SeverityPieChart({ data }: { data: AnalyticsData["chargesBySeverity"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#64748b"} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DispositionChart({ data }: { data: AnalyticsData["dispositions"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function JudgeVolumeChart({ data }: { data: AnalyticsData["judgeVolume"] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl text-xs">
                <p className="font-semibold text-white">{d.fullName}</p>
                <p className="text-slate-400">{d.court}</p>
                <p className="text-blue-400 mt-1">Cases: {d.cases}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="cases" name="Total Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ViolentCasesJudgeChart({ data }: { data: AnalyticsData["violentCasesByJudge"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl text-xs">
                <p className="font-semibold text-white">{d.fullName}</p>
                <p className="text-red-400">Violent Cases: {d.violentCases}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="violentCases" name="Violent Cases" fill="#ef4444" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BondTypeChart({ data }: { data: AnalyticsData["bondTypes"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 60, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-slate-600 bg-slate-800 p-3 shadow-xl text-xs">
                <p className="font-semibold text-white">{d.name}</p>
                <p className="text-blue-400">Count: {d.count}</p>
                <p className="text-green-400">Avg Bond: ${d.avgAmount.toLocaleString()}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="count" name="Count" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
