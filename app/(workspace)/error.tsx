"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div 
        role="alert"
        aria-live="assertive"
        className="w-full max-w-md p-6 sm:p-8 rounded-xl border border-brand-rose/30 bg-surface-raised shadow-xl text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-brand-rose/10 border border-brand-rose/30 flex items-center justify-center text-brand-rose mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-100">
            Studio Encountered an Issue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {error.message || "An unexpected error occurred while loading this studio view."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-surface-subtle text-slate-300 hover:text-slate-100 hover:border-border-strong text-xs font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Cockpit Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
