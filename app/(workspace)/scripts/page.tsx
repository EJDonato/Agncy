import { FileText } from "lucide-react";
import { getScriptsList } from "@/lib/db/queries/scripts";
import { NewScriptDialog } from "./_components/new-script-dialog";
import { ScriptCard } from "./_components/script-card";

interface ScriptsPageProps {
  searchParams?: Promise<{ topic?: string }>;
}

export default async function ScriptsPage({ searchParams }: ScriptsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const topic = resolvedParams.topic || "";
  const scriptList = getScriptsList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Script Studio</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AI-assisted scripts shaped by your most recently finalized work.
          </p>
        </div>
        <NewScriptDialog initialTopic={topic} />
      </div>

      {scriptList.length === 0 ? (
        <div className="p-8 rounded-xl border border-border-subtle bg-surface-raised text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-200">No Scripts Created Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate your first Reel script from a topic. Each finalized script becomes a writing reference for future drafts.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {scriptList.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      )}
    </div>
  );
}
