"use client";

import {
  Bookmark,
  Clock,
  Eye,
  Film,
  Heart,
  Hourglass,
  MessageSquare,
  Radio,
  Share2,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";
import { PostEmbed } from "./post-embed";

export function PostCard({ post, index = 0 }: { post: PostWithLatestMetrics; index?: number }) {
  const title = post.normalizedTitle || post.rawTitle || "Untitled Post";
  const staggerDelay = `${Math.min(index * 35, 140)}ms`;

  return (
    <article
      style={{ animationDelay: staggerDelay }}
      className="apple-glass-card apple-item-enter flex flex-col gap-4 overflow-hidden rounded-2xl p-4 sm:p-5 lg:flex-row transition-all shadow-apple-card"
    >
      <div className="shrink-0 self-center lg:self-start">
        <PostEmbed permalink={post.permalink} postType={post.postType} title={title} />
      </div>

      <div className="min-w-0 flex-1 space-y-3.5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-0.5 text-[10px] font-mono uppercase text-[#1f54fc] font-semibold">
                <Film className="w-3 h-3" />
                {post.postType || "Content"}
              </span>

              {post.durationSeconds && post.durationSeconds > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 border border-slate-200">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {post.durationSeconds}s
                </span>
              ) : null}

              {post.distributionScore && post.distributionScore !== "--" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-700 border border-emerald-200/60 font-semibold">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  {post.distributionScore} dist.
                </span>
              ) : null}

              {post.approximateEarningsUsd && post.approximateEarningsUsd > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-700 border border-amber-200/60 font-semibold">
                  ${post.approximateEarningsUsd.toFixed(2)}
                </span>
              ) : null}
            </div>

            <time className="text-[11px] font-mono text-slate-500" dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          <h3 className="text-sm font-semibold leading-snug text-slate-900 tracking-tight" title={title}>
            {title}
          </h3>
        </header>

        {/* Complete Meta CSV Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
          <Metric icon={Eye} label="Views" value={post.views.toLocaleString()} accent />
          <Metric icon={Users} label="Viewers" value={post.viewers.toLocaleString()} />
          <Metric icon={Radio} label="Impressions" value={post.impressions.toLocaleString()} />
          <Metric icon={Sparkles} label="Interactions" value={post.interactions.toLocaleString()} />
          <Metric icon={Heart} label="Reactions" value={post.reactions.toLocaleString()} />
          <Metric icon={MessageSquare} label="Comments" value={post.comments.toLocaleString()} />
          <Metric icon={Share2} label="Shares" value={post.shares.toLocaleString()} />
          <Metric icon={Bookmark} label="Saves" value={post.saves.toLocaleString()} />
          <Metric
            icon={Timer}
            label="Avg Watch"
            value={post.avgSecondsViewed ? `${post.avgSecondsViewed.toFixed(1)}s` : "--"}
          />
          <Metric
            icon={Hourglass}
            label="Seconds Viewed"
            value={post.totalSecondsViewed ? `${post.totalSecondsViewed.toLocaleString()}s` : "--"}
          />
        </div>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-sm px-3 py-2 transition-all duration-150">
      <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-500">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-0.5 text-xs font-mono font-semibold tracking-tight truncate ${accent ? "text-[#1f54fc]" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}
