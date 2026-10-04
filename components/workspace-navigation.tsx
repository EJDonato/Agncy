"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { WorkspacePageLoading } from "@/components/workspace-page-loading";

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
    const timeoutId = window.setTimeout(() => setPending(null), 12_000);
    return () => window.clearTimeout(timeoutId);
  }, [isNavigating]);

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
  const { isNavigating } = useWorkspaceNavigation();
  return (
    <main className="flex-1 min-w-0 overflow-y-auto" aria-busy={isNavigating}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {isNavigating ? <WorkspacePageLoading /> : children}
      </div>
    </main>
  );
}
