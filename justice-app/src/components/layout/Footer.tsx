import Link from "next/link";
import { Scale, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-700/60 bg-slate-900/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-white text-sm">Shelby Justice Tracker</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Public transparency tool aggregating court records from Shelby County, Tennessee.
              All data sourced from public records only.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Navigate</h3>
            <ul className="space-y-2 text-xs text-slate-500">
              {[
                ["/defendants", "Defendant Search"],
                ["/judges", "Judge Dashboard"],
                ["/cases", "Case Explorer"],
                ["/analytics", "Analytics & Patterns"],
                ["/da-office", "DA Office"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-slate-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Information</h3>
            <ul className="space-y-2 text-xs text-slate-500">
              {[
                ["/methodology", "Methodology"],
                ["/data-sources", "Data Sources"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-slate-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Official Sources</h3>
            <ul className="space-y-2 text-xs text-slate-500">
              {[
                ["https://cjs.shelbycountytn.gov", "Shelby County CJS Portal"],
                ["https://www.shelbycountytn.gov/185/District-Attorney", "DA Office (Mulroy)"],
                ["https://tncrtinfo.com", "TN Court Info"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors flex items-center gap-1">
                    {label} <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-[11px] text-slate-600 text-center leading-relaxed max-w-3xl mx-auto">
            This tool aggregates publicly available court records for transparency and accountability purposes only.
            This is NOT legal advice. Data may be incomplete, delayed, or contain errors.
            Charges do not imply guilt. Contact an attorney for legal guidance.
            © {new Date().getFullYear()} Shelby Justice Tracker. Not affiliated with any government agency.
          </p>
        </div>
      </div>
    </footer>
  );
}
