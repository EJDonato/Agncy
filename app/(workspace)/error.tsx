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
        className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-brand-rose/30 bg-white/95 backdrop-blur-2xl shadow-apple-card text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-brand-rose/10 border border-brand-rose/30 flex items-center justify-center text-brand-rose mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            Studio Encountered an Issue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {error.message || "An unexpected error occurred while loading this studio view."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="apple-btn-primary w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="apple-press w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Cockpit Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
