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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Script Studio</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-assisted scripts shaped by your most recently finalized work.
          </p>
        </div>
        <NewScriptDialog initialTopic={topic} />
      </div>

      {scriptList.length === 0 ? (
        <div className="apple-glass-card p-8 sm:p-12 rounded-2xl text-center space-y-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-brand-amber/20 to-brand-amber/5 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">No Scripts Created Yet</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
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
