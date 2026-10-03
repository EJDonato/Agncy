"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Cpu, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKSPACE_NAV_ITEMS } from "@/components/workspace-nav-items";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="md:hidden sticky top-0 z-40 bg-surface-raised border-b border-border-subtle h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-brand-amber/10 border border-brand-amber/30 flex items-center justify-center text-brand-amber font-mono font-bold text-sm">
          A
        </div>
        <div>
          <span className="font-bold tracking-tight text-slate-100 text-sm">Agncy</span>
          <span className="text-[9px] block font-mono text-slate-400">STUDIO COCKPIT</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-100 hover:bg-surface-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
        aria-expanded={isOpen}
        aria-label="Open main navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-start"
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer Content */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="w-72 max-w-[85vw] h-full bg-surface-raised border-r border-border-subtle p-4 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-amber/10 border border-brand-amber/30 flex items-center justify-center text-brand-amber font-mono font-bold text-sm">
                    A
                  </div>
                  <span className="font-bold tracking-tight text-slate-100 text-sm">Agncy</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="py-3 space-y-1" aria-label="Mobile Navigation Links">
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
                        "min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber",
                        isActive
                          ? "bg-surface-subtle text-brand-amber border border-border-strong/60 shadow-sm"
                          : "text-slate-300 hover:text-slate-100 hover:bg-surface-subtle/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-brand-amber" : "text-slate-400")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Local Engine Status */}
            <div className="p-3 border border-border-subtle bg-canvas/40 rounded-lg text-xs text-slate-300">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-amber" />
                <span>Local Engine</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <Database className="w-3 h-3 text-brand-emerald" />
                  SQLite WAL
                </span>
                <span className="text-brand-emerald">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
