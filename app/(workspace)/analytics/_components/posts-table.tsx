"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, ChevronDown, ExternalLink, Film, Search } from "lucide-react";
import { linkPostToScriptAction } from "@/lib/actions/posts";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";

type SortKey = "publishedAt" | "views" | "avgSecondsViewed" | "interactions";
type ScriptOption = { id: string; title: string };

interface Props {
  posts: PostWithLatestMetrics[];
  scripts: ScriptOption[];
}

export function PostsTable({ posts, scripts }: Props) {
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: "publishedAt",
    descending: true,
  });

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (filterType !== "All" && post.postType !== filterType) return false;
      const title = (post.normalizedTitle || post.rawTitle || "").toLowerCase();
      return !searchQuery.trim() || title.includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const left = sort.key === "publishedAt" ? Date.parse(a.publishedAt) : a[sort.key];
      const right = sort.key === "publishedAt" ? Date.parse(b.publishedAt) : b[sort.key];
      return (left - right) * (sort.descending ? -1 : 1);
    });
  }, [filterType, posts, searchQuery, sort]);

  function changeSort(key: SortKey) {
    setSort((current) => ({
      key,
      descending: current.key === key ? !current.descending : true,
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-mono">
          {["All", "Reel", "Photo", "Content"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === type ? "bg-surface-raised text-brand-amber" : "text-slate-400"
              }`}
            >
              {type === "All" ? `All (${posts.length})` : type}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            placeholder="Search captions & hooks..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 font-mono"
          />
        </div>
      </div>

      <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-raised">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle/80 border-b border-border-subtle text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Caption / Hook</th>
                <SortableHeader label="Published" onClick={() => changeSort("publishedAt")} />
                <SortableHeader label="Views" onClick={() => changeSort("views")} />
                <SortableHeader label="Avg Watch" onClick={() => changeSort("avgSecondsViewed")} />
                <SortableHeader label="Interactions" onClick={() => changeSort("interactions")} />
                <th className="py-3 px-4">Linked Script</th>
                <th className="py-3 px-4 text-center">Post</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {visiblePosts.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                  {posts.length === 0 ? "Import a Meta CSV to populate analytics." : "No matching posts."}
                </td></tr>
              ) : visiblePosts.map((post) => (
                <PostRow key={post.id} post={post} scripts={scripts} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return <th className="py-3 px-4 text-right"><button onClick={onClick} className="inline-flex items-center gap-1 hover:text-brand-amber">{label}<ArrowDownUp className="w-3 h-3" /></button></th>;
}

function PostRow({ post, scripts }: { post: PostWithLatestMetrics; scripts: ScriptOption[] }) {
  const [expanded, setExpanded] = useState(false);
  const [scriptId, setScriptId] = useState(post.scriptId ?? "");
  const [linkError, setLinkError] = useState<string | null>(null);

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

  return <>
    <tr className="hover:bg-surface-subtle/40">
      <td className="py-3 px-4"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border-subtle font-mono text-[10px]"><Film className="w-3 h-3 text-brand-amber" />{post.postType || "Content"}</span></td>
      <td className="py-3 px-4 max-w-sm"><button onClick={() => setExpanded((value) => !value)} className="flex items-center gap-1 text-left w-full"><ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} /><span className="font-medium text-slate-200 truncate">{post.normalizedTitle || "Untitled Post"}</span></button></td>
      <td className="py-3 px-4 whitespace-nowrap text-right text-slate-400 font-mono">{new Date(post.publishedAt).toLocaleDateString()}</td>
      <td className="py-3 px-4 text-right font-mono text-slate-100">{post.views.toLocaleString()}</td>
      <td className="py-3 px-4 text-right font-mono text-brand-amber">{post.avgSecondsViewed ? `${post.avgSecondsViewed.toFixed(1)}s` : "--"}</td>
      <td className="py-3 px-4 text-right font-mono text-slate-300">{post.interactions.toLocaleString()}</td>
      <td className="py-3 px-4 min-w-48"><select value={scriptId} onChange={(event) => void updateLink(event.target.value)} title={linkError ?? "Link source script"} className={`w-full rounded bg-surface-subtle border px-2 py-1 text-[11px] ${linkError ? "border-brand-rose" : "border-border-subtle"}`}><option value="">Not linked</option>{scripts.map((script) => <option key={script.id} value={script.id}>{script.title}</option>)}</select></td>
      <td className="py-3 px-4 text-center">{post.permalink ? <a href={post.permalink} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a> : "--"}</td>
    </tr>
    {expanded && <tr className="bg-canvas/60"><td colSpan={8} className="px-8 py-4"><div className="text-[11px] font-mono text-slate-400 space-y-2"><p className="text-slate-300 font-semibold">Snapshot history ({post.snapshots.length})</p>{post.snapshots.map((snapshot) => <div key={snapshot.id} className="grid grid-cols-4 gap-3 border-t border-border-subtle pt-2"><span>{snapshot.capturedAt ? new Date(snapshot.capturedAt).toLocaleString() : "Unknown date"}</span><span>{snapshot.views.toLocaleString()} views</span><span>{snapshot.interactions.toLocaleString()} interactions</span><span className="truncate" title={snapshot.fileName}>{snapshot.fileName}</span></div>)}</div></td></tr>}
  </>;
}
