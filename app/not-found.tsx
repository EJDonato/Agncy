import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-xl border border-border-subtle bg-surface-raised text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Page Not Found</h1>
          <p className="text-xs text-slate-400 mt-1">
            The studio view or resource you requested does not exist.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-mono text-slate-200 hover:text-brand-amber hover:border-brand-amber/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio Cockpit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
