"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Search, BarChart2, Users, BookOpen, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { href: "/defendants", label: "Defendants", icon: Search },
  { href: "/judges", label: "Judges", icon: Users },
  { href: "/cases", label: "Cases", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/da-office", label: "DA Office", icon: AlertTriangle },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 bg-blue-600/20 rounded-lg border border-blue-600/30 group-hover:bg-blue-600/30 transition-colors">
              <Scale className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-none block">Shelby Justice</span>
              <span className="text-[10px] text-slate-400 leading-none block">Tracker</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* County badge */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-500 border border-slate-700 rounded px-2 py-1">
              Shelby County, TN • 30th Judicial District
            </span>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <span className={cn("block w-5 h-0.5 bg-current transition-transform", menuOpen && "translate-y-1.5 rotate-45")} />
              <span className={cn("block w-5 h-0.5 bg-current transition-opacity", menuOpen && "opacity-0")} />
              <span className={cn("block w-5 h-0.5 bg-current transition-transform", menuOpen && "-translate-y-1.5 -rotate-45")} />
            </div>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
