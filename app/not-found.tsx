import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl apple-glass-card text-center space-y-4 shadow-apple-card">
        <div className="w-12 h-12 rounded-full bg-[#1f54fc]/10 border border-[#1f54fc]/30 text-[#1f54fc] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Page Not Found</h1>
          <p className="text-xs text-slate-500 mt-1">
            The studio view or resource you requested does not exist.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="apple-press min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio Cockpit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
