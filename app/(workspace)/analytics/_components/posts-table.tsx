"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";
import { PostCard } from "./post-card";

type SortKey = "publishedAt" | "views" | "avgSecondsViewed" | "interactions";
type ScriptOption = { id: string; title: string };

interface Props {
  posts: PostWithLatestMetrics[];
  scripts: ScriptOption[];
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "publishedAt", label: "Newest first" },
  { value: "views", label: "Most viewed" },
  { value: "avgSecondsViewed", label: "Best watch time" },
  { value: "interactions", label: "Most interactions" },
];

export function PostsTable({ posts, scripts }: Props) {
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("publishedAt");

  const visiblePosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts
      .filter((post) => {
        if (filterType !== "All" && post.postType !== filterType) return false;
        const title = (post.normalizedTitle || post.rawTitle || "").toLowerCase();
        return !query || title.includes(query);
      })
      .sort((left, right) => {
        const leftValue = sortKey === "publishedAt" ? Date.parse(left.publishedAt) : left[sortKey];
        const rightValue = sortKey === "publishedAt" ? Date.parse(right.publishedAt) : right[sortKey];
        return rightValue - leftValue;
      });
  }, [filterType, posts, searchQuery, sortKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-raised p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter posts by type">
          {["All", "Reel", "Photo", "Content"].map((type) => (
            <button key={type} type="button" role="tab" aria-selected={filterType === type} onClick={() => setFilterType(type)} className={`min-h-11 px-3.5 rounded-lg text-xs font-mono font-medium shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber ${filterType === type ? "bg-brand-amber/15 text-brand-amber border border-brand-amber/30" : "text-slate-400 hover:text-slate-200 border border-transparent"}`}>
              {type === "All" ? `All (${posts.length})` : type}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative min-w-0 sm:w-72">
            <span className="sr-only">Search captions and hooks</span>
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
            <input type="search" placeholder="Search captions & hooks..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full min-h-11 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-amber" />
          </label>
          <label className="relative sm:w-48">
            <span className="sr-only">Sort posts</span>
            <SlidersHorizontal className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="w-full min-h-11 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-amber">
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {visiblePosts.length === 0 ? (
        <div className="rounded-xl border border-border-subtle bg-surface-raised py-16 text-center text-sm text-slate-400 font-mono">
          {posts.length === 0 ? "Import a Meta CSV to populate analytics." : "No matching posts."}
        </div>
      ) : (
        <div className="space-y-3">
          {visiblePosts.map((post) => <PostCard key={post.id} post={post} scripts={scripts} />)}
        </div>
      )}
    </div>
  );
}
