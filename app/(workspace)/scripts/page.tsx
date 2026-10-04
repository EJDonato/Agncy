import { getScriptsList } from "@/lib/db/queries/scripts";
import { getFinalizedIdeas } from "@/lib/db/queries/ideas";
import { ScriptsView } from "./_components/scripts-view";

interface ScriptsPageProps {
  searchParams?: Promise<{ ideaId?: string }>;
}

export default async function ScriptsPage({ searchParams }: ScriptsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const ideaId = resolvedParams.ideaId || "";
  const scriptList = getScriptsList();
  const finalizedIdeas = getFinalizedIdeas();

  return (
    <ScriptsView
      finalizedIdeas={finalizedIdeas}
      scripts={scriptList}
      initialIdeaId={ideaId}
    />
  );
}
