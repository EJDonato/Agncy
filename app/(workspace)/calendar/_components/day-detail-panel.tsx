"use client";

import { useState } from "react";
import { X, Sparkles, Plus, Trash2, ExternalLink, Clock, Eye, MessageSquare, Share2, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteScheduleAction, updateScheduleStatusAction } from "@/lib/actions/schedules";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";
import type { ContentScheduleItem } from "@/lib/db/queries/schedules";
import type { RecommendedSlot } from "@/lib/calendar/schedule-analyzer";

interface DayDetailPanelProps {
  dateStr: string; // YYYY-MM-DD
  isOpen: boolean;
  onClose: () => void;
  publishedPosts: PostWithLatestMetrics[];
  scheduledPosts: ContentScheduleItem[];
  recommendedSlot: RecommendedSlot | null;
  onScheduleHere: (date: string, time?: string) => void;
}

export function DayDetailPanel({
  dateStr,
  isOpen,
  onClose,
  publishedPosts,
  scheduledPosts,
  recommendedSlot,
  onScheduleHere,
}: DayDetailPanelProps) {
  const router = useRouter();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  if (!isOpen || !dateStr) return null;

  const dateObj = new Date(`${dateStr}T12:00:00`);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const isPast = dateStr < todayStr;
  const isToday = dateStr === todayStr;

  async function handleDeleteSchedule(id: string) {
    if (!window.confirm("Remove this planned drop from your schedule?")) return;
    setIsDeletingId(id);
    try {
      await deleteScheduleAction(id);
      router.refresh();
    } finally {
      setIsDeletingId(null);
    }
  }

  async function handleToggleStatus(item: ContentScheduleItem) {
    const nextStatus = item.status === "planned" ? "filmed" : item.status === "filmed" ? "published" : "planned";
    await updateScheduleStatusAction(item.id, nextStatus);
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 md:left-64 apple-backdrop-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.12)] space-y-5 apple-modal-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold ${
                isToday ? "bg-blue-100 text-[#1f54fc]" : isPast ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-800"
              }`}>
                {isToday ? "Today" : isPast ? "Historical Date" : "Upcoming Window"}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 tracking-tight">
              {formattedDate}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Strategic Recommendation for Future/Today */}
        {!isPast && (
          <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {recommendedSlot ? "Optimal Posting Slot" : "Standard Posting Day"}
              </span>
              {recommendedSlot && (
                <span className="text-[10px] font-mono bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded uppercase font-semibold">
                  {recommendedSlot.expectedPerformance} Window
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-950 font-mono leading-relaxed">
              {recommendedSlot
                ? `${recommendedSlot.reason}. Recommended drop time: ${recommendedSlot.time} (${recommendedSlot.format}).`
                : "A regular cadence slot. If you have completed reels, this is a good day to publish."}
            </p>
          </div>
        )}

        {/* Scheduled Content List */}
        {!isPast && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold tracking-wider text-slate-700 uppercase">
                Planned Content ({scheduledPosts.length})
              </h3>
              <button
                type="button"
                onClick={() => onScheduleHere(dateStr, recommendedSlot?.time || "19:00")}
                className="apple-press flex items-center gap-1 text-xs text-[#1f54fc] hover:underline font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Planned Drop</span>
              </button>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-mono">
                No posts scheduled for this day yet.
              </div>
            ) : (
              <div className="space-y-2">
                {scheduledPosts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1f54fc] font-semibold border border-blue-200">
                          {item.format || "Reel"}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleToggleStatus(item)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors uppercase font-medium"
                          title="Click to toggle status: planned -> filmed -> published"
                        >
                          Status: {item.status}
                        </button>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.scheduledTime || "19:00"}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          Notes: {item.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSchedule(item.id)}
                      disabled={isDeletingId === item.id}
                      aria-label="Delete planned drop"
                      className="apple-press min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-rose hover:bg-slate-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Historical Published Posts */}
        {publishedPosts.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-semibold tracking-wider text-slate-700 uppercase">
              Published Posts Recorded ({publishedPosts.length})
            </h3>
            <div className="space-y-2.5">
              {publishedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100/80 text-[#1f54fc] font-semibold">
                      {post.postType || "Post"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(post.publishedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="font-sans font-medium text-slate-900 line-clamp-2">
                    {post.normalizedTitle || post.rawTitle || "Untitled Post"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 border-t border-slate-200/70">
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {post.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {post.comments} comments
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      {post.shares} shares
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      {post.saves} saves
                    </span>
                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-[#1f54fc] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPast && publishedPosts.length === 0 && (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-mono">
            No published posts were recorded on this date.
          </div>
        )}
      </div>
    </div>
  );
}
