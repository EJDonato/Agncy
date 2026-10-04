"use client";

import { useMemo } from "react";
import { Sparkles, Film, Clock } from "lucide-react";
import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";
import type { ContentScheduleItem } from "@/lib/db/queries/schedules";
import type { RecommendedSlot } from "@/lib/calendar/schedule-analyzer";

interface CalendarGridProps {
  year: number;
  month: number; // 0 to 11
  posts: PostWithLatestMetrics[];
  schedules: ContentScheduleItem[];
  recommendedSlots: RecommendedSlot[];
  filter: "all" | "published" | "scheduled";
  onSelectDate: (dateStr: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  year,
  month,
  posts,
  schedules,
  recommendedSlots,
  filter,
  onSelectDate,
}: CalendarGridProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Map published posts by YYYY-MM-DD
  const postsByDate = useMemo(() => {
    const map = new Map<string, PostWithLatestMetrics[]>();
    for (const p of posts) {
      const d = p.publishedAt.split("T")[0];
      const list = map.get(d) ?? [];
      list.push(p);
      map.set(d, list);
    }
    return map;
  }, [posts]);

  // Map scheduled posts by YYYY-MM-DD
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ContentScheduleItem[]>();
    for (const s of schedules) {
      const list = map.get(s.scheduledDate) ?? [];
      list.push(s);
      map.set(s.scheduledDate, list);
    }
    return map;
  }, [schedules]);

  // Map recommended slots by YYYY-MM-DD
  const slotsByDate = useMemo(() => {
    const map = new Map<string, RecommendedSlot>();
    for (const r of recommendedSlots) {
      map.set(r.date, r);
    }
    return map;
  }, [recommendedSlots]);

  // Build calendar matrix
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean; isToday: boolean }[] = [];

  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ dateStr, dayNum: d, isCurrentMonth: false, isPast: dateStr < todayStr, isToday: dateStr === todayStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ dateStr, dayNum: d, isCurrentMonth: true, isPast: dateStr < todayStr, isToday: dateStr === todayStr });
  }

  // Next month padding to fill grid
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ dateStr, dayNum: d, isCurrentMonth: false, isPast: dateStr < todayStr, isToday: dateStr === todayStr });
  }

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-[11px] font-mono font-semibold text-slate-500 py-2.5">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* Calendar Day Cells */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {cells.map((cell) => {
          const published = postsByDate.get(cell.dateStr) || [];
          const scheduled = schedulesByDate.get(cell.dateStr) || [];
          const slot = slotsByDate.get(cell.dateStr);

          const showPublished = filter !== "scheduled" && published.length > 0;
          const showScheduled = filter !== "published" && scheduled.length > 0;
          const showSlot = filter !== "published" && Boolean(slot) && scheduled.length === 0 && !cell.isPast;

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`min-h-[105px] sm:min-h-[125px] p-2 flex flex-col justify-between cursor-pointer transition-colors group ${
                cell.isCurrentMonth
                  ? cell.isToday
                    ? "bg-blue-50/40 hover:bg-blue-50/70"
                    : "bg-white hover:bg-slate-50/80"
                  : "bg-slate-50/40 opacity-40 hover:opacity-75"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-medium rounded-full flex items-center justify-center ${
                    cell.isToday
                      ? "w-6 h-6 bg-[#1f54fc] text-white font-bold shadow-sm"
                      : cell.isCurrentMonth
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {cell.dayNum}
                </span>

                {slot && !cell.isPast && scheduled.length === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Recommended Drop Day" />
                )}
              </div>

              {/* Items in Cell */}
              <div className="space-y-1 my-1 overflow-hidden">
                {/* Published Post Chips */}
                {showPublished &&
                  published.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/90 text-blue-900 text-[10px] font-mono truncate flex items-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      title={`${post.postType}: ${post.normalizedTitle || post.rawTitle}`}
                    >
                      <Film className="w-2.5 h-2.5 shrink-0 text-[#1f54fc]" />
                      <span className="truncate">{post.normalizedTitle || post.postType || "Drop"}</span>
                      {post.views > 0 && (
                        <span className="ml-auto text-blue-700 font-bold shrink-0">
                          {(post.views / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                  ))}

                {/* Scheduled Post Chips */}
                {showScheduled &&
                  scheduled.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-mono truncate flex items-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      title={`Planned: ${item.title}`}
                    >
                      <Clock className="w-2.5 h-2.5 shrink-0 text-[#4726f6]" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))}

                {/* Recommended Slot Chip */}
                {showSlot && slot && (
                  <div
                    className="px-1.5 py-0.5 rounded-md border border-dashed border-emerald-500/40 bg-emerald-50/50 text-emerald-800 text-[10px] font-mono truncate flex items-center gap-1 hover:border-emerald-600 transition-colors"
                    title={slot.reason}
                  >
                    <Sparkles className="w-2.5 h-2.5 shrink-0 text-emerald-600" />
                    <span className="truncate">Optimal: {slot.format} @ {slot.time}</span>
                  </div>
                )}

                {/* Overflow count */}
                {published.length + scheduled.length > 2 && (
                  <span className="text-[9px] font-mono text-slate-400 block pl-1">
                    +{published.length + scheduled.length - 2} more
                  </span>
                )}
              </div>

              {/* Bottom Cue */}
              <div className="h-1 flex items-center justify-end">
                <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  View
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
