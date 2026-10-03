"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
    <header className="md:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-brand-amber/20 to-brand-amber/10 border border-brand-amber/30 flex items-center justify-center text-amber-800 font-mono font-bold text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          A
        </div>
        <div>
          <span className="font-bold tracking-tight text-slate-900 text-sm">Agncy</span>
          <span className="text-[8px] block font-mono tracking-wider text-slate-500 font-medium">STUDIO COCKPIT</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
        aria-expanded={isOpen}
        aria-label="Open main navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex justify-start animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer Content */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="w-72 max-w-[85vw] h-full bg-white/95 backdrop-blur-2xl border-r border-slate-200 p-4 flex flex-col justify-between shadow-[0_24px_64px_rgba(0,0,0,0.15)] animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-brand-amber/20 to-brand-amber/10 border border-brand-amber/30 flex items-center justify-center text-amber-800 font-mono font-bold text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                    A
                  </div>
                  <span className="font-bold tracking-tight text-slate-900 text-sm">Agncy</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
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
                        "apple-press min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber",
                        isActive
                          ? "bg-gradient-to-r from-brand-amber/15 via-brand-amber/10 to-transparent text-amber-900 border border-brand-amber/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-amber-700" : "text-slate-500")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
