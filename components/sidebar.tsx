"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { WORKSPACE_NAV_ITEMS } from "@/components/workspace-nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside 
      className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col justify-between h-screen sticky top-0 z-[55] shrink-0 shadow-[1px_0_12px_rgba(0,0,0,0.02)]"
      aria-label="Sidebar navigation"
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
            A
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 text-sm">Agncy</span>
            <span className="text-[9px] block font-mono tracking-wider text-slate-500 font-semibold">STUDIO COCKPIT</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Main navigation">
          {WORKSPACE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                title={item.feature}
                aria-label={`${item.label}: ${item.feature}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "apple-press flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber",
                  isActive
                    ? "bg-amber-50 text-amber-950 font-semibold border border-amber-200 shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-amber-600" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div id="persona-dock" className="relative h-64 shrink-0 border-t border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/40" />
    </aside>
  );
}
