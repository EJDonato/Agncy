import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingUp, ShieldCheck, FileEdit, Plus } from "lucide-react";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { db } from "@/lib/db";
import { styleRules, scripts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GEMINI_SCRIPT_MODEL_LABEL } from "@/lib/ai/models";
import { PersonaCard } from "@/components/persona-card";

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

  const finalizedScripts = db
    .select({ id: scripts.id })
    .from(scripts)
    .where(eq(scripts.status, "finalized"))
    .all();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Studio Cockpit</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Brand Brain active • {GEMINI_SCRIPT_MODEL_LABEL} connected • Local SQLite WAL enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scripts"
            className="apple-btn-primary min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
          >
            <Plus className="w-4 h-4" />
            <span>New Script</span>
          </Link>
        </div>
      </div>

      <PersonaCard persona="creativeDirector" />

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-700 font-mono tracking-wider font-semibold">
            <span>WRITING REFERENCES</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {Math.min(finalizedScripts.length, 3)}
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">
              {Math.min(finalizedScripts.length, 3) === 1 ? "script" : "scripts"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Up to 3 recent finals guide structure and wording</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-700 font-mono tracking-wider font-semibold">
            <span>AVG REEL RETENTION</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {topReel?.avgSecondsViewed ? `${topReel.avgSecondsViewed.toFixed(1)}s` : "--"}
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">
              {topReel ? `Top: ${(topReel.views / 1000).toFixed(1)}k views` : "no data"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Calculated from imported Meta Reels</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-700 font-mono tracking-wider font-semibold">
            <span>ACTIVE STYLE RULES</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {activeRules.length > 0 ? activeRules.length : "--"}
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">
              {activeRules.length > 0 ? "active" : "none active"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Calibrated from brand voice directives</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-700 font-mono tracking-wider font-semibold">
            <span>POSTS RECORDED</span>
            <FileEdit className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">{posts.length}</span>
            <span className="text-xs text-emerald-700 font-mono font-semibold">
              {posts.length > 0 ? "live in SQLite" : "awaiting CSV"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">Meta posts imported into Brand Brain</p>
        </div>
      </div>

      {/* Main Grid: Quick Action & Recent Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Script Drafting Studio Box */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl apple-glass space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">Quick Script Draft</h2>
              <p className="text-xs text-slate-600 mt-0.5">Generate a short-form video draft using your Brand Brain & verified style rules.</p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium self-start sm:self-center">
              {GEMINI_SCRIPT_MODEL_LABEL}
            </span>
          </div>

          <form action="/scripts" method="GET" className="space-y-3">
            <label htmlFor="dashboard-quick-draft-input" className="sr-only">
              Topic, premise or hook angle
            </label>
            <input
              id="dashboard-quick-draft-input"
              name="topic"
              type="text"
              placeholder="e.g., Bakit nagiging ghost town ang mga barangay tech projects?"
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono shadow-sm"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono font-medium">
                  Reel (45s)
                </span>
                <span className="text-xs px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono font-medium">
                  Taglish
                </span>
              </div>
              <button
                type="submit"
                className="apple-btn-primary min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
              >
                Generate Draft →
              </button>
            </div>
          </form>
        </div>

        {/* Quick Launch Cards */}
        <div className="p-6 sm:p-7 rounded-2xl apple-glass space-y-4">
          <h2 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">Studio Actions</h2>
          <div className="space-y-2.5">
            <Link
              href="/analytics"
              className="apple-press min-h-[44px] block p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Import Meta CSV</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {posts.length > 0 ? `${posts.length} posts recorded • Drop newer export` : "Drop Meta Business Suite export"}
              </p>
            </Link>

            <Link
              href="/studio"
              className="apple-press min-h-[44px] block p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Burn Captions Locally</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-600 mt-1">Apple Silicon Whisper + VideoToolbox export</p>
            </Link>

            <Link
              href="/brand"
              className="apple-press min-h-[44px] block p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Review Style Rules</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-600 mt-1">Manage the writing preferences Gemini should follow</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
