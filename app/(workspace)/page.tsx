import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp, ShieldCheck, FileEdit, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Studio Cockpit</h1>
          <p className="text-sm text-slate-400 mt-1">
            Brand Brain active • Google Gemini 2.5 Pro & Flash connected • Local SQLite WAL enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scripts"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-sm hover:bg-brand-amber/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Script</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>DRAFT SURVIVAL</span>
            <Sparkles className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">76%</span>
            <span className="text-xs text-brand-emerald font-mono">+14% vs avg</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Share of AI draft retained in final edits</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AVG REEL RETENTION</span>
            <TrendingUp className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">11.2s</span>
            <span className="text-xs text-slate-400 font-mono">Top: 15.8k views</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Civic question hooks outperform by 3.5x</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE STYLE RULES</span>
            <ShieldCheck className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">5</span>
            <span className="text-xs text-slate-400 font-mono">2 proposed</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Calibrated from recent script diffs</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>POSTS LINKED</span>
            <FileEdit className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">85%</span>
            <span className="text-xs text-slate-400 font-mono">19 imported</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Meta posts tied to origin scripts</p>
        </div>
      </div>

      {/* Main Grid: Quick Action & Recent Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Script Drafting Studio Box */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-semibold text-slate-100">Quick Script Draft</h2>
              <p className="text-xs text-slate-400">Generate a short-form video draft using your Brand Brain & verified style rules.</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-subtle border border-border-strong text-slate-300">
              Gemini 2.5 Pro
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="e.g., Bakit nagiging ghost town ang mga barangay tech projects?"
              className="w-full px-4 py-3 rounded-lg bg-surface-subtle border border-border-strong text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand-amber transition-colors font-mono"
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-canvas border border-border-subtle text-slate-300 font-mono">
                  Reel (45s)
                </span>
                <span className="text-xs px-2.5 py-1 rounded bg-canvas border border-border-subtle text-slate-300 font-mono">
                  Taglish
                </span>
              </div>
              <Link
                href="/scripts"
                className="px-4 py-2 rounded-lg bg-brand-amber/15 text-brand-amber border border-brand-amber/30 text-xs font-medium hover:bg-brand-amber/25 transition-colors"
              >
                Generate Draft →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
          <h2 className="font-semibold text-slate-100">Studio Actions</h2>
          <div className="space-y-2">
            <Link
              href="/analytics"
              className="block p-3 rounded-lg bg-surface-subtle/60 hover:bg-surface-subtle border border-border-subtle transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Import Meta CSV</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber transition-colors" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Drop latest Meta Business Suite export</p>
            </Link>

            <Link
              href="/studio"
              className="block p-3 rounded-lg bg-surface-subtle/60 hover:bg-surface-subtle border border-border-subtle transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Burn Captions Locally</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber transition-colors" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Apple Silicon Whisper + VideoToolbox export</p>
            </Link>

            <Link
              href="/brand"
              className="block p-3 rounded-lg bg-surface-subtle/60 hover:bg-surface-subtle border border-border-subtle transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Review Style Rules</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber transition-colors" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Approve learned patterns from your edits</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
