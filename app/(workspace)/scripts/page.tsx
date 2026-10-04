import { FileText } from "lucide-react";
import { getScriptsList } from "@/lib/db/queries/scripts";
import { getFinalizedIdeas } from "@/lib/db/queries/ideas";
import { NewScriptDialog } from "./_components/new-script-dialog";
import { ScriptCard } from "./_components/script-card";

interface ScriptsPageProps {
  searchParams?: Promise<{ ideaId?: string }>;
}

export default async function ScriptsPage({ searchParams }: ScriptsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const ideaId = resolvedParams.ideaId || "";
  const scriptList = getScriptsList();
  const finalizedIdeas = getFinalizedIdeas();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Script Studio</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-assisted scripts shaped by your most recently finalized work.
          </p>
        </div>
        <div className="flex items-center gap-3">
        <NewScriptDialog ideas={finalizedIdeas} initialIdeaId={ideaId} />
        </div>
      </div>

      {scriptList.length === 0 ? (
        <div className="apple-glass-card apple-item-enter p-8 sm:p-12 rounded-2xl text-center space-y-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1f54fc]/15 to-[#4726f6]/5 border border-[#1f54fc]/30 text-[#1f54fc] flex items-center justify-center mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">No Scripts Created Yet</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Finalize a content idea with the Content Strategist, then turn it into your first script here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {scriptList.map((script, index) => (
            <ScriptCard key={script.id} script={script} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
