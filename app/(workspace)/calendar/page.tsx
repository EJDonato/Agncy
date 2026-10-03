import { Calendar as CalendarIcon, Film, Clock, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { getScriptsList } from "@/lib/db/queries/scripts";

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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Content Calendar</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Production schedule, finalized filming backlog, and published Reel drops.
          </p>
        </div>
      </div>

      {/* Production Pipeline Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>READY TO FILM</span>
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {finalizedScripts.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Finalized scripts in production queue</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>IN DRAFTING</span>
            <FileText className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-brand-amber">
            {inDraftScripts.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Active script drafts being edited</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-raised">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PUBLISHED DROPS</span>
            <Film className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100">
            {posts.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Live organic Meta posts recorded</p>
        </div>
      </div>

      {/* Filming Queue Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-amber" />
          <span>Filming & Production Queue</span>
        </h2>

        {finalizedScripts.length === 0 ? (
          <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised text-center text-xs text-slate-400 font-mono">
            No scripts marked as finalized yet. Finalize a script draft in <Link href="/scripts" className="text-brand-amber underline">Script Studio</Link> to queue it for filming.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {finalizedScripts.map((script) => (
              <Link
                key={script.id}
                href={`/scripts/${script.id}`}
                className="p-4 rounded-xl border border-border-subtle bg-surface-raised hover:border-brand-amber/40 transition-colors block group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald">
                    Ready to Shoot
                  </span>
                  {script.targetDurationSec && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ~{script.targetDurationSec}s
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-brand-amber transition-colors mt-2 truncate">
                  {script.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Format: {script.format || "Reel"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Drops Timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Film className="w-4 h-4 text-brand-amber" />
          <span>Recent Published Posts Timeline</span>
        </h2>

        {posts.length === 0 ? (
          <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised text-center text-xs text-slate-400 font-mono">
            No published posts imported. Import a Meta CSV in <Link href="/analytics" className="text-brand-amber underline">Analytics</Link> to see your timeline.
          </div>
        ) : (
          <div className="border border-border-subtle rounded-xl divide-y divide-border-subtle bg-surface-raised overflow-hidden">
            {posts.slice(0, 8).map((post) => (
              <div key={post.id} className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-surface-subtle/30 transition-colors">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle text-brand-amber shrink-0">
                    {post.postType || "Post"}
                  </span>
                  <span className="font-medium text-slate-200 truncate">
                    {post.normalizedTitle || post.rawTitle || "Untitled"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] shrink-0 self-end sm:self-center">
                  <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="text-slate-200">{post.views.toLocaleString()} views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
