"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Lightbulb } from "lucide-react";
import { PersonaCard } from "@/components/persona-card";
import { NewScriptDialog } from "./new-script-dialog";
import { FinalizedIdeaCard } from "./finalized-idea-card";
import { ScriptCard } from "./script-card";
import type { FinalizedIdeaItem } from "@/lib/db/queries/ideas";
import type { ScriptListItem } from "@/lib/db/queries/scripts";

interface ScriptsViewProps {
  finalizedIdeas: FinalizedIdeaItem[];
  scripts: ScriptListItem[];
  initialIdeaId?: string;
}

export function ScriptsView({ finalizedIdeas, scripts, initialIdeaId = "" }: ScriptsViewProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(Boolean(initialIdeaId));
  const [selectedIdeaId, setSelectedIdeaId] = useState(
    initialIdeaId || (finalizedIdeas.length > 0 ? finalizedIdeas[0].id : "")
  );

  const handleOpenDialog = useCallback((ideaId?: string) => {
    if (ideaId) {
      setSelectedIdeaId(ideaId);
    } else if (finalizedIdeas.length > 0 && !selectedIdeaId) {
      setSelectedIdeaId(finalizedIdeas[0].id);
    }
    setIsDialogOpen(true);
  }, [finalizedIdeas, selectedIdeaId]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open && initialIdeaId) {
      router.replace("/scripts", { scroll: false });
    }
  }, [initialIdeaId, router]);

  const hasContent = finalizedIdeas.length > 0 || scripts.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Script Studio</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-assisted scripts shaped by your most recently finalized work.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenDialog()}
            disabled={finalizedIdeas.length === 0}
            className="apple-btn-primary min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            <span>{finalizedIdeas.length > 0 ? "New Script" : "Finalize an Idea First"}</span>
          </button>
        </div>
      </div>

      <PersonaCard persona="scriptWriter" />

      {/* Controlled Dialog */}
      <NewScriptDialog
        ideas={finalizedIdeas}
        isOpen={isDialogOpen}
        onOpenChange={handleOpenChange}
        selectedIdeaId={selectedIdeaId}
        onSelectIdeaId={setSelectedIdeaId}
        hideTrigger
      />

      {/* Empty State when no scripts AND no finalized ideas exist */}
      {!hasContent ? (
        <div className="apple-glass-card apple-item-enter p-8 sm:p-12 rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1f54fc]/15 to-[#4726f6]/5 border border-[#1f54fc]/30 text-[#1f54fc] flex items-center justify-center mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">No Scripts or Finalized Ideas Yet</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Finalize a content idea with the Content Strategist first, and its card will appear here ready to draft into a full script.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/ideas"
              className="apple-btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-xl text-xs"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Go to Content Strategist</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Finalized Ideas Section (Ready to Script) */}
          {finalizedIdeas.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm font-semibold tracking-tight text-slate-900">Ready to Script</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {finalizedIdeas.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Approved in Content Strategist — select a card to start writing
                </p>
              </div>

              <div className="grid gap-3">
                {finalizedIdeas.map((idea, index) => (
                  <FinalizedIdeaCard
                    key={idea.id}
                    idea={idea}
                    index={index}
                    onDraft={(id) => handleOpenDialog(id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Scripts in Production Section */}
          <section className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Scripts in Production</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {scripts.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Active drafts, versions, and teleprompters
              </p>
            </div>

            {scripts.length === 0 ? (
              <div className="p-6 sm:p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1.5 apple-item-enter">
                <p className="text-xs font-mono font-medium text-slate-600">No scripts generated yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select any finalized idea above to start your first draft.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {scripts.map((script, index) => (
                  <ScriptCard key={script.id} script={script} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
