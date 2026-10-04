import { getIdeasList } from "@/lib/db/queries/ideas";
import { PersonaCard } from "@/components/persona-card";
import { ContentIdeaBoard, type ContentIdeaListItem } from "./_components/content-idea-board";

export default async function IdeasPage() {
  const ideas: ContentIdeaListItem[] = getIdeasList().map((idea) => ({
    ...idea,
    status: idea.status as ContentIdeaListItem["status"],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Content Strategist</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Start here: generate, evaluate, and finalize the content idea before it reaches the Script Writer.
          </p>
        </div>
      </div>

      <PersonaCard persona="contentStrategist" />

      <ContentIdeaBoard ideas={ideas} />
    </div>
  );
}
