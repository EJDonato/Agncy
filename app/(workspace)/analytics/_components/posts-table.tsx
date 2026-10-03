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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div 
          className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-mono overflow-x-auto"
          role="tablist"
          aria-label="Filter posts by type"
        >
          {["All", "Reel", "Photo", "Content"].map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={filterType === type}
              onClick={() => setFilterType(type)}
              className={`min-h-[44px] px-3.5 rounded-md transition-colors shrink-0 flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber ${
                filterType === type ? "bg-surface-raised text-brand-amber shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type === "All" ? `All (${posts.length})` : type}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <label htmlFor="analytics-search-input" className="sr-only">Search captions and hooks</label>
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
          <input
            id="analytics-search-input"
            type="search"
            placeholder="Search captions & hooks..."
            aria-label="Search captions and hooks"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-amber focus-visible:ring-1 focus-visible:ring-brand-amber"
          />
        </div>
      </div>

      <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-raised shadow-sm">
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-surface-subtle/80 border-b border-border-subtle text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th scope="col" className="py-3 px-4">Format</th>
                <th scope="col" className="py-3 px-4">Caption / Hook</th>
                <SortableHeader label="Published" onClick={() => changeSort("publishedAt")} />
                <SortableHeader label="Views" onClick={() => changeSort("views")} />
                <SortableHeader label="Avg Watch" onClick={() => changeSort("avgSecondsViewed")} />
                <SortableHeader label="Interactions" onClick={() => changeSort("interactions")} />
                <th scope="col" className="py-3 px-4">Linked Script</th>
                <th scope="col" className="py-3 px-4 text-center">Post</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {visiblePosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                    {posts.length === 0 ? "Import a Meta CSV to populate analytics." : "No matching posts."}
                  </td>
                </tr>
              ) : (
                visiblePosts.map((post) => (
                  <PostRow key={post.id} post={post} scripts={scripts} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th scope="col" className="py-2 px-3 text-right">
      <button 
        type="button"
        onClick={onClick} 
        aria-label={`Sort by ${label}`}
        className="min-h-[44px] inline-flex items-center gap-1.5 hover:text-brand-amber transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded px-1"
      >
        <span>{label}</span>
        <ArrowDownUp className="w-3.5 h-3.5" />
      </button>
    </th>
  );
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

  const postTitle = post.normalizedTitle || post.rawTitle || "Untitled Post";

  return (
    <>
      <tr className="hover:bg-surface-subtle/40 transition-colors">
        <td className="py-3 px-4">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border-subtle font-mono text-[10px]">
            <Film className="w-3 h-3 text-brand-amber" />
            {post.postType || "Content"}
          </span>
        </td>
        <td className="py-2 px-4 max-w-sm">
          <button 
            type="button"
            onClick={() => setExpanded((value) => !value)} 
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} snapshot history for ${postTitle}`}
            className="min-h-[44px] flex items-center gap-2 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded group"
          >
            <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 group-hover:text-brand-amber transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            <span className="font-medium text-slate-200 group-hover:text-slate-100 truncate">{postTitle}</span>
          </button>
        </td>
        <td className="py-3 px-4 whitespace-nowrap text-right text-slate-400 font-mono">
          {new Date(post.publishedAt).toLocaleDateString()}
        </td>
        <td className="py-3 px-4 text-right font-mono text-slate-100 font-medium">
          {post.views.toLocaleString()}
        </td>
        <td className="py-3 px-4 text-right font-mono text-brand-amber">
          {post.avgSecondsViewed ? `${post.avgSecondsViewed.toFixed(1)}s` : "--"}
        </td>
        <td className="py-3 px-4 text-right font-mono text-slate-300">
          {post.interactions.toLocaleString()}
        </td>
        <td className="py-2 px-4 min-w-48">
          <select 
            value={scriptId} 
            onChange={(event) => void updateLink(event.target.value)} 
            aria-label={`Link script for post: ${postTitle}`}
            title={linkError ?? "Link source script"} 
            className={`w-full min-h-[44px] rounded-lg bg-surface-subtle border px-3 py-2 text-xs focus:outline-none focus:border-brand-amber ${
              linkError ? "border-brand-rose text-brand-rose" : "border-border-subtle text-slate-200"
            }`}
          >
            <option value="">Not linked</option>
            {scripts.map((script) => (
              <option key={script.id} value={script.id}>{script.title}</option>
            ))}
          </select>
        </td>
        <td className="py-2 px-4 text-center">
          {post.permalink ? (
            <a 
              href={post.permalink} 
              target="_blank" 
              rel="noreferrer"
              aria-label={`Open post on Meta: ${postTitle}`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-amber hover:bg-surface-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-slate-500 font-mono">--</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-canvas/60">
          <td colSpan={8} className="px-6 py-4">
            <div className="text-[11px] font-mono text-slate-400 space-y-2">
              <p className="text-slate-200 font-semibold">Snapshot history ({post.snapshots.length})</p>
              {post.snapshots.map((snapshot) => (
                <div key={snapshot.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border-subtle pt-2">
                  <span>{snapshot.capturedAt ? new Date(snapshot.capturedAt).toLocaleString() : "Unknown date"}</span>
                  <span className="text-slate-200">{snapshot.views.toLocaleString()} views</span>
                  <span className="text-slate-300">{snapshot.interactions.toLocaleString()} interactions</span>
                  <span className="truncate col-span-2 sm:col-span-1" title={snapshot.fileName}>{snapshot.fileName}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
