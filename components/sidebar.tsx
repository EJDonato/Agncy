"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  FileText, 
  Lightbulb, 
  Video, 
  BarChart3, 
  Calendar,
  Cpu,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brand", label: "Brand Brain", icon: BrainCircuit },
  { href: "/scripts", label: "Script Studio", icon: FileText },
  { href: "/ideas", label: "Idea Hub", icon: Lightbulb },
  { href: "/studio", label: "Captions & Media", icon: Video },
  { href: "/analytics", label: "Analytics & CSV", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border-subtle bg-surface-raised flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border-subtle gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-amber/10 border border-brand-amber/30 flex items-center justify-center text-brand-amber font-mono font-bold text-lg">
            A
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-100 text-base">Agncy</span>
            <span className="text-[10px] block font-mono text-slate-400">STUDIO COCKPIT</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-subtle text-brand-amber border border-border-strong/60 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-subtle/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-brand-amber" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Local Engine Status Panel */}
      <div className="p-4 border-t border-border-subtle bg-canvas/40 m-3 rounded-lg border">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-brand-amber" />
          <span>Local Engine</span>
        </div>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-brand-emerald" />
              SQLite WAL
            </span>
            <span className="text-[11px] font-mono text-brand-emerald">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Whisper Local</span>
            <span className="text-[11px] font-mono text-slate-400">Metal Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
