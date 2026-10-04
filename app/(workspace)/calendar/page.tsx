import { getPostsWithLatestMetrics } from "@/lib/db/queries/posts";
import { getScriptsList } from "@/lib/db/queries/scripts";
import { getContentSchedules } from "@/lib/db/queries/schedules";
import { analyzePostingStrategy } from "@/lib/calendar/schedule-analyzer";
import { CalendarView } from "./_components/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const posts = await getPostsWithLatestMetrics();
  const scripts = getScriptsList();
  const schedules = getContentSchedules();
  const insights = analyzePostingStrategy(posts, new Date());

  return (
    <CalendarView
      posts={posts}
      scripts={scripts}
      schedules={schedules}
      insights={insights}
    />
  );
}
