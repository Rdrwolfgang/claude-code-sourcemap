import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "Felony A": return "bg-red-900 text-red-200";
    case "Felony B": return "bg-red-700 text-red-100";
    case "Felony C": return "bg-orange-700 text-orange-100";
    case "Misdemeanor": return "bg-yellow-700 text-yellow-100";
    case "Violation": return "bg-slate-600 text-slate-200";
    default: return "bg-slate-700 text-slate-200";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Open": return "bg-blue-700 text-blue-100";
    case "Closed": return "bg-slate-600 text-slate-200";
    case "Pending": return "bg-yellow-700 text-yellow-100";
    case "Appealed": return "bg-purple-700 text-purple-100";
    default: return "bg-slate-700 text-slate-200";
  }
}

export function getDispositionColor(disposition: string | null): string {
  if (!disposition) return "bg-slate-700 text-slate-200";
  switch (disposition) {
    case "Guilty": return "bg-red-700 text-red-100";
    case "Guilty Plea": return "bg-orange-700 text-orange-100";
    case "Not Guilty": return "bg-green-700 text-green-100";
    case "Nolle Pros": return "bg-yellow-700 text-yellow-100";
    case "Dismissed": return "bg-blue-700 text-blue-100";
    case "Diversion": return "bg-purple-700 text-purple-100";
    case "Pending": return "bg-slate-600 text-slate-200";
    default: return "bg-slate-700 text-slate-200";
  }
}

export function getPartyColor(party: string | null): string {
  if (!party) return "text-slate-400";
  switch (party) {
    case "D": return "text-blue-400";
    case "R": return "text-red-400";
    case "I": return "text-yellow-400";
    default: return "text-slate-400";
  }
}

export function getPartyLabel(party: string | null): string {
  if (!party) return "Unknown";
  switch (party) {
    case "D": return "Democrat";
    case "R": return "Republican";
    case "I": return "Independent";
    default: return party;
  }
}

export const LEGAL_TERMS: Record<string, string> = {
  "Nolle Pros": "Nolle Prosequi — the prosecution has decided not to pursue this charge. Does not mean innocent, but the state is declining to proceed.",
  "Diversion": "Pre-trial diversion — defendant completes program requirements in lieu of prosecution. May result in charge dismissal.",
  "OR Release": "Own Recognizance Release — defendant released without posting bail, based on promise to appear.",
  "TDOC": "Tennessee Department of Correction — the state prison system.",
  "Bound Over": "Case transferred from General Sessions to Grand Jury or Criminal Court for felony proceedings.",
  "Grand Jury": "Panel of citizens that reviews evidence to determine if there is probable cause to formally charge (indict) a defendant.",
  "Arraignment": "Initial court appearance where defendant is formally read charges and enters a plea.",
  "Preliminary Hearing": "Hearing to determine if probable cause exists to proceed with felony charges.",
  "Probation Revocation": "Hearing to determine if a defendant on probation has violated conditions, potentially resulting in incarceration.",
};

export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    totalPages,
  };
}
