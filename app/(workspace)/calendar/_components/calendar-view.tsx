"use client";

import { useState, useMemo, useCallback } from "react";
import { PersonaCard } from "@/components/persona-card";
import { PostingStrategyBanner } from "./posting-strategy-banner";
import { CalendarHeader } from "./calendar-header";
import { CalendarGrid } from "./calendar-grid";
import { DayDetailPanel } from "./day-detail-panel";
import { SchedulePostDialog } from "./schedule-post-dialog";
import { getRecommendedSlotsForMonth, type PostingStrategyInsights } from "@/lib/calendar/schedule-analyzer";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";
import type { ScriptListItem } from "@/lib/db/queries/scripts";
import type { ContentScheduleItem } from "@/lib/db/queries/schedules";

interface CalendarViewProps {
  posts: PostWithLatestMetrics[];
  scripts: ScriptListItem[];
  schedules: ContentScheduleItem[];
  insights: PostingStrategyInsights;
}

export function CalendarView({ posts, scripts, schedules, insights }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [filter, setFilter] = useState<"all" | "published" | "scheduled">("all");
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Scheduling modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState(insights.peakTime || "19:00");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Project recommended slots for the visible month
  const recommendedSlots = useMemo(() => {
    return getRecommendedSlotsForMonth(year, month, insights, new Date());
  }, [year, month, insights]);

  // Handlers for month navigation
  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Handlers for scheduling
  const handleOpenSchedule = useCallback((dateStr?: string, timeStr?: string) => {
    const today = new Date().toISOString().split("T")[0];
    setScheduleDate(dateStr || today);
    setScheduleTime(timeStr || insights.peakTime || "19:00");
    setIsScheduleOpen(true);
  }, [insights.peakTime]);

  const handleScheduleNext = useCallback(() => {
    if (insights.nextRecommendedSlot) {
      handleOpenSchedule(insights.nextRecommendedSlot.date, insights.nextRecommendedSlot.time);
    } else {
      handleOpenSchedule();
    }
  }, [insights.nextRecommendedSlot, handleOpenSchedule]);

  // Selected day data for Detail Panel
  const selectedDayPublished = useMemo(() => {
    if (!selectedDateStr) return [];
    return posts.filter((p) => p.publishedAt.split("T")[0] === selectedDateStr);
  }, [selectedDateStr, posts]);

  const selectedDayScheduled = useMemo(() => {
    if (!selectedDateStr) return [];
    return schedules.filter((s) => s.scheduledDate === selectedDateStr);
  }, [selectedDateStr, schedules]);

  const selectedDaySlot = useMemo(() => {
    if (!selectedDateStr) return null;
    return recommendedSlots.find((r) => r.date === selectedDateStr) || null;
  }, [selectedDateStr, recommendedSlots]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Content Planner</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical drop cadence, algorithm-optimized posting windows, and scheduled production.
          </p>
        </div>
      </div>

      <PersonaCard persona="contentPlanner" />

      {/* AI Strategy Insights (When should I post in the future) */}
      <PostingStrategyBanner insights={insights} onScheduleNext={handleScheduleNext} />

      {/* Calendar Section */}
      <div className="space-y-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          filter={filter}
          onFilterChange={setFilter}
          onOpenSchedule={() => handleOpenSchedule()}
        />

        <CalendarGrid
          year={year}
          month={month}
          posts={posts}
          schedules={schedules}
          recommendedSlots={recommendedSlots}
          filter={filter}
          onSelectDate={(dateStr) => setSelectedDateStr(dateStr)}
        />
      </div>

      {/* Day Detail Panel */}
      <DayDetailPanel
        dateStr={selectedDateStr || ""}
        isOpen={Boolean(selectedDateStr)}
        onClose={() => setSelectedDateStr(null)}
        publishedPosts={selectedDayPublished}
        scheduledPosts={selectedDayScheduled}
        recommendedSlot={selectedDaySlot}
        onScheduleHere={(date, time) => {
          setSelectedDateStr(null);
          handleOpenSchedule(date, time);
        }}
      />

      {/* Schedule Post Dialog */}
      <SchedulePostDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialDate={scheduleDate}
        initialTime={scheduleTime}
        scripts={scripts}
      />
    </div>
  );
}
