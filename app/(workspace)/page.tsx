import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp, ShieldCheck, FileEdit, Plus } from "lucide-react";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { db } from "@/lib/db";
import { styleRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const posts = await getPostsWithLatestMetrics();
  const reels = posts.filter((p) => p.postType === "Reel");
  const topReel = reels.reduce(
    (max, r) => (r.views > (max?.views ?? 0) ? r : max),
    reels[0] || null
  );

  const activeRules = db
    .select()
    .from(styleRules)
    .where(eq(styleRules.status, "active"))
    .all();

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
            <span className="text-3xl font-bold font-mono text-slate-100">--</span>
            <span className="text-xs text-slate-400 font-mono">awaiting scripts</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Share of AI draft retained in final edits</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AVG REEL RETENTION</span>
            <TrendingUp className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">
              {topReel?.avgSecondsViewed ? `${topReel.avgSecondsViewed.toFixed(1)}s` : "--"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {topReel ? `Top: ${(topReel.views / 1000).toFixed(1)}k views` : "no data"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Calculated from imported Meta Reels</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE STYLE RULES</span>
            <ShieldCheck className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">
              {activeRules.length > 0 ? activeRules.length : "--"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {activeRules.length > 0 ? "active" : "none active"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Calibrated from brand voice directives</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>POSTS RECORDED</span>
            <FileEdit className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{posts.length}</span>
            <span className="text-xs text-brand-emerald font-mono">
              {posts.length > 0 ? "live in SQLite" : "awaiting CSV"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Meta posts imported into Brand Brain</p>
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
              <p className="text-xs text-slate-400 mt-1">
                {posts.length > 0 ? `${posts.length} posts recorded • Drop newer export` : "Drop Meta Business Suite export"}
              </p>
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
