import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { CsvDropzone } from "./_components/csv-dropzone";
import { PostsTable } from "./_components/posts-table";
import { getScriptsList } from "@/lib/db/queries/scripts";
import { BarChart3, TrendingUp, Film, Eye, Sparkles } from "lucide-react";
import { PersonaCard } from "@/components/persona-card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const posts = await getPostsWithLatestMetrics();
  const scripts = getScriptsList();

  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);
  const totalInteractions = posts.reduce((acc, p) => acc + p.interactions, 0);
  const reels = posts.filter((p) => p.postType === "Reel");
  const topReel = reels.reduce(
    (max, r) => (r.views > (max?.views ?? 0) ? r : max),
    reels[0] || null
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Analytics & Meta CSV</h1>
          <p className="text-sm text-slate-400 mt-1">
            Meta Business Suite lifetime snapshots normalized and indexed for the Brand Brain.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-surface-raised px-3 py-1.5 rounded-lg border border-border-subtle">
          <span>Database: </span>
          <span className="text-brand-emerald">{posts.length} posts recorded</span>
        </div>
      </div>

      <PersonaCard persona="performanceAnalyst" />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL POSTS</span>
            <Film className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {posts.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {reels.length} Reels • {posts.length - reels.length} Photos & Content
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL VIEWS</span>
            <Eye className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Cumulative lifetime impressions</p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOP REEL VIEWS</span>
            <TrendingUp className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-brand-amber">
            {topReel ? `${topReel.views.toLocaleString()} views` : "--"}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {topReel?.avgSecondsViewed ? `${topReel.avgSecondsViewed.toFixed(1)}s avg watch time` : "No Reel data"}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>INTERACTIONS</span>
            <Sparkles className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {totalInteractions.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Reactions, comments & shares</p>
        </div>
      </div>

      {/* CSV Dropzone */}
      <CsvDropzone />

      {/* Posts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-amber" />
            Ingested Content History
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Showing latest lifetime snapshots
          </span>
        </div>
        <PostsTable
          posts={posts}
          scripts={scripts.map(({ id, title }) => ({ id, title }))}
        />
      </div>
    </div>
  );
}
