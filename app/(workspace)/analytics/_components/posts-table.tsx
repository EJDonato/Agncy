"use client";

import { useState } from "react";
import { ExternalLink, Search, Film, Image as ImageIcon, FileText } from "lucide-react";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";

interface Props {
  posts: PostWithLatestMetrics[];
}

export function PostsTable({ posts }: Props) {
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = posts.filter((post) => {
    if (filterType !== "All" && post.postType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (post.normalizedTitle || post.rawTitle || "").toLowerCase();
      return title.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs font-mono">
          {["All", "Reel", "Photo", "Content"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === type
                  ? "bg-surface-raised text-brand-amber font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type === "All" ? `All (${posts.length})` : type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search captions & hooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-amber transition-colors font-mono"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface-raised">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle/80 border-b border-border-subtle text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Caption / Hook</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Avg Watch</th>
                <th className="py-3 px-4 text-right">Interactions</th>
                <th className="py-3 px-4 text-right">Dist</th>
                <th className="py-3 px-4 text-center">Post</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    {posts.length === 0
                      ? "No posts imported yet. Drag and drop your Meta Business Suite CSV export above to populate your analytics."
                      : "No posts matching the selected search or filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono ${
                          post.postType === "Reel"
                            ? "bg-brand-amber/15 text-brand-amber border border-brand-amber/30"
                            : post.postType === "Photo"
                            ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                            : "bg-slate-700/30 text-slate-300 border border-slate-700/50"
                        }`}
                      >
                        {post.postType === "Reel" ? <Film className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {post.postType || "Content"}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="font-medium text-slate-200 truncate" title={post.rawTitle || ""}>
                        {post.normalizedTitle || post.rawTitle || "Untitled Post"}
                      </p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-100 font-semibold">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-brand-amber">
                      {post.avgSecondsViewed > 0 ? `${post.avgSecondsViewed.toFixed(1)}s` : "--"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {post.interactions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {post.distributionScore || "--"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {post.permalink ? (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1 rounded hover:bg-surface-subtle text-slate-400 hover:text-brand-amber transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
