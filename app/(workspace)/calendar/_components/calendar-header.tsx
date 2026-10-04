"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  filter: "all" | "published" | "scheduled";
  onFilterChange: (filter: "all" | "published" | "scheduled") => void;
  onOpenSchedule: () => void;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  filter,
  onFilterChange,
  onOpenSchedule,
}: CalendarHeaderProps) {
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
      {/* Month Navigator */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 min-w-[180px]">
          {monthName}
        </h2>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="apple-press min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="apple-press px-2.5 py-1 text-xs font-mono font-medium rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-all"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="apple-press min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters and CTA */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("published")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "published"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Past Posts
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("scheduled")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "scheduled"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Future & Planned
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenSchedule}
          className="apple-btn-primary min-h-[40px] flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Post</span>
        </button>
      </div>
    </div>
  );
}
