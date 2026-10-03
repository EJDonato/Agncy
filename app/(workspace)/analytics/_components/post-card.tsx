"use client";

import { useState } from "react";
import { ChevronDown, Clock3, Eye, Film, History, MessageCircle } from "lucide-react";
import { linkPostToScriptAction } from "@/lib/actions/posts";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";
import { PostEmbed } from "./post-embed";

type ScriptOption = { id: string; title: string };

export function PostCard({ post, scripts }: { post: PostWithLatestMetrics; scripts: ScriptOption[] }) {
  const [scriptId, setScriptId] = useState(post.scriptId ?? "");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const title = post.normalizedTitle || post.rawTitle || "Untitled Post";

  async function updateLink(nextId: string) {
    const previous = scriptId;
    setScriptId(nextId);
    setLinkError(null);
    try {
      await linkPostToScriptAction({ postId: post.id, scriptId: nextId || null });
    } catch (error) {
      setScriptId(previous);
      setLinkError(error instanceof Error ? error.message : "Could not link script");
    }
  }

  return (
    <article className="flex flex-col gap-4 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised p-3 shadow-sm sm:p-4 lg:flex-row">
      <div className="shrink-0 self-center lg:self-start">
        <PostEmbed permalink={post.permalink} postType={post.postType} title={title} />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-amber/30 bg-brand-amber/10 px-2.5 py-1 text-[10px] font-mono uppercase text-brand-amber"><Film className="w-3 h-3" />{post.postType || "Content"}</span>
            <time className="text-[11px] font-mono text-slate-500" dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString()}</time>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-slate-100 line-clamp-2" title={title}>{title}</h3>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Metric icon={Eye} label="Views" value={post.views.toLocaleString()} />
          <Metric icon={Clock3} label="Avg watch" value={post.avgSecondsViewed ? `${post.avgSecondsViewed.toFixed(1)}s` : "--"} accent />
          <Metric icon={MessageCircle} label="Interactions" value={post.interactions.toLocaleString()} />
          <Metric icon={History} label="Snapshots" value={String(post.snapshots.length)} />
        </div>

        <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
          <label className="text-[10px] font-mono uppercase tracking-wide text-slate-500 block mb-1.5">Linked source script</label>
          <select value={scriptId} onChange={(event) => void updateLink(event.target.value)} aria-label={`Link source script for ${title}`} className={`w-full min-h-11 rounded-lg bg-surface-subtle border px-3 text-xs focus:outline-none focus:border-brand-amber ${linkError ? "border-brand-rose text-brand-rose" : "border-border-subtle text-slate-200"}`}>
            <option value="">Not linked</option>
            {scripts.map((script) => <option key={script.id} value={script.id}>{script.title}</option>)}
          </select>
          {linkError && <p className="mt-1 text-[11px] text-brand-rose">{linkError}</p>}
          </div>
          <button type="button" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen} className="min-h-11 flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-subtle px-3 text-xs font-mono text-slate-300 hover:border-border-strong">
          <span>Metric snapshot history</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
        {historyOpen && <SnapshotHistory post={post} />}
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value, accent = false }: { icon: typeof Eye; label: string; value: string; accent?: boolean }) {
  return <div className="rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-2"><div className="flex items-center gap-1 text-[9px] font-mono uppercase text-slate-500"><Icon className="w-3 h-3" />{label}</div><p className={`mt-0.5 text-xs font-mono font-semibold ${accent ? "text-brand-amber" : "text-slate-100"}`}>{value}</p></div>;
}

function SnapshotHistory({ post }: { post: PostWithLatestMetrics }) {
  return <div className="space-y-2 rounded-lg border border-border-subtle bg-canvas/60 p-3 text-[11px] font-mono text-slate-400">{post.snapshots.map((snapshot) => <div key={snapshot.id} className="grid grid-cols-2 gap-2 border-b border-border-subtle pb-2 last:border-0 last:pb-0"><span>{snapshot.capturedAt ? new Date(snapshot.capturedAt).toLocaleString() : "Unknown date"}</span><span className="text-right text-slate-200">{snapshot.views.toLocaleString()} views</span><span>{snapshot.interactions.toLocaleString()} interactions</span><span className="text-right truncate" title={snapshot.fileName}>{snapshot.fileName}</span></div>)}</div>;
}
