"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface PendingNavigation {
  fromPath: string;
  href: string;
}

interface WorkspaceNavigationValue {
  activePath: string;
  beginNavigation: (href: string) => void;
  isNavigating: boolean;
}

const WorkspaceNavigationContext = createContext<WorkspaceNavigationValue | null>(null);

export function WorkspaceNavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const isNavigating = pending !== null && pathname === pending.fromPath && pending.href !== pathname;

  useEffect(() => {
    if (!isNavigating) return;
    const timeoutId = window.setTimeout(() => setPending(null), 10_000);
    return () => window.clearTimeout(timeoutId);
  }, [isNavigating]);

  // When pathname changes to the pending href, clear pending immediately
  useEffect(() => {
    if (pending && pathname === pending.href) {
      setPending(null);
    }
  }, [pathname, pending]);

  const value = useMemo<WorkspaceNavigationValue>(() => ({
    activePath: isNavigating && pending ? pending.href : pathname,
    beginNavigation: (href) => setPending({ fromPath: pathname, href }),
    isNavigating,
  }), [isNavigating, pathname, pending]);

  return <WorkspaceNavigationContext.Provider value={value}>{children}</WorkspaceNavigationContext.Provider>;
}

export function useWorkspaceNavigation(): WorkspaceNavigationValue {
  const context = useContext(WorkspaceNavigationContext);
  if (!context) throw new Error("useWorkspaceNavigation must be used within WorkspaceNavigationProvider");
  return context;
}

export function WorkspaceContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isNavigating } = useWorkspaceNavigation();

  return (
    <main className="flex-1 min-w-0 overflow-y-auto relative" aria-busy={isNavigating}>
      {/* Liquid Top Progress Bar for Sidebar Navigation */}
      {isNavigating && (
        <div
          role="progressbar"
          aria-label="Navigating to page"
          className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] bg-gradient-to-r from-[#1f54fc] via-[#3872fa] to-[#4726f6] shadow-[0_0_12px_rgba(31,84,252,0.85)] apple-nav-progress"
        />
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div
          key={pathname}
          className={`apple-page-enter ${isNavigating ? "opacity-60 transition-opacity duration-150" : ""}`}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
