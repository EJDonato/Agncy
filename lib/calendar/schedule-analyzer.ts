import type { PostWithLatestMetrics } from "@/lib/db/queries/posts";

export interface DayPerformance {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  postCount: number;
  avgViews: number;
  totalViews: number;
  bestHour: string;
  isRecommended: boolean;
}

export interface RecommendedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  format: "Reel" | "Photo" | "Content";
  reason: string;
  dayName: string;
  expectedPerformance: "Peak" | "High" | "Balanced";
}

export interface PostingStrategyInsights {
  bestDays: DayPerformance[];
  recommendedCadence: string;
  peakTime: string;
  topFormat: string;
  nextRecommendedSlot: RecommendedSlot | null;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function analyzePostingStrategy(
  posts: PostWithLatestMetrics[],
  referenceDate: Date = new Date()
): PostingStrategyInsights {
  // Group historical posts by day of the week
  const dayBuckets: { views: number[]; hours: number[] }[] = Array.from({ length: 7 }, () => ({
    views: [],
    hours: [],
  }));

  for (const post of posts) {
    const d = new Date(post.publishedAt);
    if (isNaN(d.getTime())) continue;
    const day = d.getDay();
    dayBuckets[day].views.push(post.views || 0);
    dayBuckets[day].hours.push(d.getHours());
  }

  // Calculate stats for each day
  const dayStats: DayPerformance[] = dayBuckets.map((bucket, dayIdx) => {
    const postCount = bucket.views.length;
    const totalViews = bucket.views.reduce((a, b) => a + b, 0);
    const avgViews = postCount > 0 ? Math.round(totalViews / postCount) : 0;

    // Find most frequent hour or fallback to 19:00
    let bestHour = "19:00";
    if (bucket.hours.length > 0) {
      const hourCounts: Record<number, number> = {};
      for (const h of bucket.hours) {
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
      const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
      if (topHour) {
        bestHour = `${String(topHour[0]).padStart(2, "0")}:00`;
      }
    }

    return {
      dayOfWeek: dayIdx,
      dayName: DAY_NAMES[dayIdx],
      postCount,
      avgViews,
      totalViews,
      bestHour,
      isRecommended: false,
    };
  });

  // Rank days by average views (require at least 1 post if data exists)
  const ranked = [...dayStats].sort((a, b) => {
    if (b.postCount > 0 && a.postCount === 0) return 1;
    if (a.postCount > 0 && b.postCount === 0) return -1;
    return b.avgViews - a.avgViews;
  });

  // Default optimal days if sparse data: Thursday (4), Saturday (6), Tuesday (2)
  const recommendedDayIndices = new Set<number>();
  if (posts.length >= 3) {
    // Pick top 2-3 performing days
    ranked.slice(0, 3).forEach((d) => {
      if (d.postCount > 0) recommendedDayIndices.add(d.dayOfWeek);
    });
  } else {
    recommendedDayIndices.add(4); // Thursday
    recommendedDayIndices.add(6); // Saturday
    recommendedDayIndices.add(2); // Tuesday
  }

  // Mark recommended
  dayStats.forEach((d) => {
    d.isRecommended = recommendedDayIndices.has(d.dayOfWeek);
  });

  // Find peak hour overall
  const topDay = ranked[0] || dayStats[4];
  const peakTime = topDay.bestHour || "19:00";

  // Project next recommended slot
  const nextSlot = findNextSlot(referenceDate, recommendedDayIndices, dayStats);

  return {
    bestDays: dayStats.filter((d) => d.isRecommended),
    recommendedCadence: "3 posts / week",
    peakTime,
    topFormat: "Reel",
    nextRecommendedSlot: nextSlot,
  };
}

function findNextSlot(
  from: Date,
  recommendedDays: Set<number>,
  dayStats: DayPerformance[]
): RecommendedSlot | null {
  for (let i = 1; i <= 14; i++) {
    const target = new Date(from);
    target.setDate(from.getDate() + i);
    const day = target.getDay();

    if (recommendedDays.has(day)) {
      const stats = dayStats[day];
      const dateStr = target.toISOString().split("T")[0];
      return {
        id: `rec_${dateStr}`,
        date: dateStr,
        time: stats?.bestHour || "19:00",
        format: "Reel",
        reason: stats && stats.avgViews > 0
          ? `Peak day: ~${(stats.avgViews / 1000).toFixed(1)}k avg views`
          : "Recommended consistency cadence",
        dayName: DAY_NAMES[day],
        expectedPerformance: stats && stats.avgViews > 5000 ? "Peak" : "High",
      };
    }
  }
  return null;
}

export function getRecommendedSlotsForMonth(
  year: number,
  month: number, // 0-indexed (0 = Jan, 9 = Oct)
  insights: PostingStrategyInsights,
  referenceDate: Date = new Date()
): RecommendedSlot[] {
  const slots: RecommendedSlot[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const recommendedDays = new Set(insights.bestDays.map((d) => d.dayOfWeek));
  const todayStr = referenceDate.toISOString().split("T")[0];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // Only recommend future or today slots
    if (dateStr >= todayStr && recommendedDays.has(dateObj.getDay())) {
      const dayStat = insights.bestDays.find((b) => b.dayOfWeek === dateObj.getDay());
      slots.push({
        id: `rec_${dateStr}`,
        date: dateStr,
        time: dayStat?.bestHour || insights.peakTime,
        format: "Reel",
        reason: dayStat && dayStat.avgViews > 0
          ? `Optimal drop: ~${(dayStat.avgViews / 1000).toFixed(1)}k avg views`
          : "Recommended weekly cadence",
        dayName: DAY_NAMES[dateObj.getDay()],
        expectedPerformance: dayStat && dayStat.avgViews > 5000 ? "Peak" : "High",
      });
    }
  }

  return slots;
}
