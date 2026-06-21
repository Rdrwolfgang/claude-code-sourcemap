import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  highlight?: boolean;
  className?: string;
}

export default function StatCard({ label, value, sub, icon: Icon, highlight, className }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      highlight
        ? "border-blue-600/40 bg-blue-900/20"
        : "border-slate-700 bg-slate-800/60",
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
          <p className={cn("text-2xl font-bold", highlight ? "text-blue-300" : "text-white")}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg", highlight ? "bg-blue-600/20 text-blue-400" : "bg-slate-700/60 text-slate-400")}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
