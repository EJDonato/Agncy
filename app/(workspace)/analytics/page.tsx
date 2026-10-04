import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { UploadCsvDialog } from "./_components/upload-csv-dialog";
import { PostsTable } from "./_components/posts-table";
import { BarChart3, TrendingUp, Film, Eye, Sparkles } from "lucide-react";
import { PersonaCard } from "@/components/persona-card";
import { GeminiPerformanceAnalysis } from "./_components/gemini-performance-analysis";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const posts = await getPostsWithLatestMetrics();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Analytics & Meta CSV</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Meta Business Suite lifetime snapshots normalized and indexed for the Brand Brain.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          <div className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
            <span>Database: </span>
            <span className="text-brand-emerald font-semibold">{posts.length} posts recorded</span>
          </div>
          <UploadCsvDialog />
        </div>
      </div>

      <PersonaCard persona="performanceAnalyst" />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-glass-card apple-item-enter p-5 rounded-2xl" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>TOTAL POSTS</span>
            <Film className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {posts.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {reels.length} Reels • {posts.length - reels.length} Photos & Content
          </p>
        </div>

        <div className="apple-glass-card apple-item-enter p-5 rounded-2xl" style={{ animationDelay: "40ms" }}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>TOTAL VIEWS</span>
            <Eye className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Cumulative lifetime impressions</p>
        </div>

        <div className="apple-glass-card apple-item-enter p-5 rounded-2xl" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>TOP REEL VIEWS</span>
            <TrendingUp className="w-4 h-4 text-[#1f54fc]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#1f54fc] tracking-tight">
            {topReel ? `${topReel.views.toLocaleString()} views` : "--"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {topReel?.avgSecondsViewed ? `${topReel.avgSecondsViewed.toFixed(1)}s avg watch time` : "No Reel data"}
          </p>
        </div>

        <div className="apple-glass-card apple-item-enter p-5 rounded-2xl" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>INTERACTIONS</span>
            <Sparkles className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {totalInteractions.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Reactions, comments & shares</p>
        </div>
      </div>

      <GeminiPerformanceAnalysis />

      {/* Posts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#1f54fc]" />
            Ingested Content History
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Showing latest lifetime snapshots
          </span>
        </div>
        <PostsTable posts={posts} />
      </div>
    </div>
  );
}
