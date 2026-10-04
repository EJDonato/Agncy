import { Calendar as CalendarIcon, Film, Clock, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { getScriptsList } from "@/lib/db/queries/scripts";
import { PersonaCard } from "@/components/persona-card";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const posts = await getPostsWithLatestMetrics();
  const scripts = getScriptsList();

  const finalizedScripts = scripts.filter((s) => s.status === "finalized");
  const inDraftScripts = scripts.filter((s) => s.status !== "finalized");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Content Calendar</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Production schedule, finalized filming backlog, and published Reel drops.
          </p>
        </div>
      </div>

      <PersonaCard persona="contentPlanner" />

      {/* Production Pipeline Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>READY TO FILM</span>
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {finalizedScripts.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Finalized scripts in production queue</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>IN DRAFTING</span>
            <FileText className="w-4 h-4 text-[#1f54fc]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#1f54fc] tracking-tight">
            {inDraftScripts.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Active script drafts being edited</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
            <span>PUBLISHED DROPS</span>
            <Film className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {posts.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Live organic Meta posts recorded</p>
        </div>
      </div>

      {/* Filming Queue Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
          <CalendarIcon className="w-4 h-4 text-[#1f54fc]" />
          <span>Filming & Production Queue</span>
        </h2>

        {finalizedScripts.length === 0 ? (
          <div className="apple-glass-card p-6 sm:p-8 rounded-2xl text-center text-xs text-slate-500 font-mono">
            No scripts marked as finalized yet. Finalize a script draft in <Link href="/scripts" className="text-[#1f54fc] underline hover:text-[#4726f6]">Script Studio</Link> to queue it for filming.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {finalizedScripts.map((script) => (
              <Link
                key={script.id}
                href={`/scripts/${script.id}`}
                className="apple-glass-card apple-press p-5 rounded-2xl block group transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald font-semibold">
                    Ready to Shoot
                  </span>
                  {script.targetDurationSec && (
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{script.targetDurationSec}s
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#1f54fc] transition-colors mt-2.5 truncate tracking-tight">
                  {script.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Format: {script.format || "Reel"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Drops Timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
          <Film className="w-4 h-4 text-[#1f54fc]" />
          <span>Recent Published Posts Timeline</span>
        </h2>

        {posts.length === 0 ? (
          <div className="apple-glass-card p-6 sm:p-8 rounded-2xl text-center text-xs text-slate-500 font-mono">
            No published posts imported. Import a Meta CSV in <Link href="/analytics" className="text-[#1f54fc] underline hover:text-[#4726f6]">Analytics</Link> to see your timeline.
          </div>
        ) : (
          <div className="apple-glass-card rounded-2xl divide-y divide-slate-200 overflow-hidden">
            {posts.slice(0, 8).map((post) => (
              <div key={post.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/80 transition-colors">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#1f54fc] font-semibold shrink-0">
                    {post.postType || "Post"}
                  </span>
                  <span className="font-medium text-slate-900 truncate">
                    {post.normalizedTitle || post.rawTitle || "Untitled"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px] shrink-0 self-end sm:self-center">
                  <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="text-slate-900 font-semibold">{post.views.toLocaleString()} views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
