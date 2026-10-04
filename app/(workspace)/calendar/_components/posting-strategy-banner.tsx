"use client";

import { Sparkles, TrendingUp, Clock, CalendarDays, Plus } from "lucide-react";
import type { PostingStrategyInsights } from "@/lib/calendar/schedule-analyzer";

interface PostingStrategyBannerProps {
  insights: PostingStrategyInsights;
  onScheduleNext: () => void;
}

export function PostingStrategyBanner({ insights, onScheduleNext }: PostingStrategyBannerProps) {
  const topDaysText = insights.bestDays.length > 0
    ? insights.bestDays.map((d) => d.dayName).join(" & ")
    : "Thursdays & Saturdays";

  const nextSlot = insights.nextRecommendedSlot;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 apple-item-enter">
      {/* Best Days Card */}
      <div className="apple-glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
          <span>PEAK POSTING DAYS</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 tracking-tight">
            {topDaysText}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Highest average views historically
          </p>
        </div>
      </div>

      {/* Optimal Drop Time */}
      <div className="apple-glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
          <span>OPTIMAL DROP TIME</span>
          <Clock className="w-4 h-4 text-[#1f54fc]" />
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 tracking-tight font-mono">
            {insights.peakTime} (Local)
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Peak viewer retention window
          </p>
        </div>
      </div>

      {/* Target Cadence */}
      <div className="apple-glass-card p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tracking-wider">
          <span>RECOMMENDED CADENCE</span>
          <CalendarDays className="w-4 h-4 text-[#4726f6]" />
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 tracking-tight">
            {insights.recommendedCadence}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Optimized for algorithm momentum
          </p>
        </div>
      </div>

      {/* Next Optimal Slot CTA */}
      <div className="apple-glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-700 font-mono tracking-wider font-semibold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            NEXT RECOMMENDED
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 uppercase">
            {nextSlot?.expectedPerformance || "Peak"}
          </span>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 truncate">
            {nextSlot ? `${nextSlot.dayName}, ${nextSlot.date.split("-").slice(1).join("/")}` : "This Week"}
          </div>
          <p className="text-[11px] text-slate-600 font-mono">
            Target @ {nextSlot?.time || "19:00"} ({insights.topFormat})
          </p>
        </div>
        <button
          type="button"
          onClick={onScheduleNext}
          className="apple-btn-primary min-h-[38px] w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Plan This Slot</span>
        </button>
      </div>
    </div>
  );
}
