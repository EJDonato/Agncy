"use client";

import Link from "next/link";
import { ArrowRight, Check, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteIdeaAction, finalizeIdeaAction, generateContentIdeasAction } from "@/lib/actions/ideas";

export interface ContentIdeaListItem {
  id: string;
  topic: string;
  angleHook: string;
  whySuggested: string;
  status: "suggested" | "saved" | "converted" | "dismissed";
  predictedFitScore: number | null;
}

export function ContentIdeaBoard({ ideas }: { ideas: ContentIdeaListItem[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateIdeas() {
    setIsGenerating(true); setError(null);
    try { await generateContentIdeasAction(); }
    catch (generationError) { setError(generationError instanceof Error ? generationError.message : "Could not generate content ideas."); }
    finally { setIsGenerating(false); }
  }
  async function finalizeIdea(id: string) {
    setActiveId(id); setError(null);
    try { await finalizeIdeaAction(id); }
    catch (finalizeError) { setError(finalizeError instanceof Error ? finalizeError.message : "Could not finalize this idea."); }
    finally { setActiveId(null); }
  }
  async function deleteIdea(id: string) {
    if (!window.confirm("Delete this content idea?")) return;
    setActiveId(id); setError(null);
    try { await deleteIdeaAction(id); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Could not delete this idea."); }
    finally { setActiveId(null); }
  }

  return <section className="space-y-4">
    <div className="apple-glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 rounded-2xl">
      <div><h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900"><Sparkles className="w-4 h-4 text-[#1f54fc]" /> AI Content Ideas</h2><p className="mt-1 text-xs text-slate-500">Gemini learns from your previous posts and scripts, then proposes the next angles to pursue.</p></div>
      <button type="button" onClick={() => void generateIdeas()} disabled={isGenerating} className="apple-btn-primary min-h-[44px] shrink-0 px-5 rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-2">{isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}{isGenerating ? "Generating..." : "Generate Ideas"}</button>
    </div>
    {error && <div role="alert" className="rounded-xl border border-brand-rose/30 bg-brand-rose/10 p-3 text-xs font-mono text-brand-rose">{error}</div>}
    {ideas.length === 0 ? <div className="apple-glass-card rounded-2xl p-10 text-center text-xs text-slate-500">Generate ideas to start your content pipeline.</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => {
        const isFinalized = idea.status === "saved"; const isConverted = idea.status === "converted"; const isWorking = activeId === idea.id;
        return <article key={idea.id} className="apple-glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2"><span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md border font-semibold ${isConverted ? "bg-slate-100 border-slate-200 text-slate-500" : isFinalized ? "bg-brand-emerald/10 border-brand-emerald/25 text-brand-emerald" : "bg-blue-50 border-blue-200 text-[#1f54fc]"}`}>{isConverted ? "Script in progress" : isFinalized ? "Finalized idea" : "AI suggestion"}</span><h3 className="text-sm font-semibold leading-snug tracking-tight text-slate-900">{idea.topic}</h3><p className="text-xs font-mono text-slate-700">&ldquo;{idea.angleHook}&rdquo;</p><p className="text-[11px] text-slate-500">{idea.whySuggested}</p></div>
          <div className="flex gap-2">{isFinalized ? <Link href={`/scripts?ideaId=${encodeURIComponent(idea.id)}`} className="apple-press min-h-[44px] flex flex-1 items-center justify-between rounded-xl border border-[#1f54fc] bg-blue-50 px-4 py-2.5 text-xs font-mono font-medium text-[#1f54fc]">Write Script <ArrowRight className="w-4 h-4" /></Link> : !isConverted ? <button type="button" disabled={isWorking} onClick={() => void finalizeIdea(idea.id)} className="apple-btn-primary min-h-[44px] flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs disabled:opacity-50">{isWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Finalize Idea</button> : null}<button type="button" disabled={isWorking} onClick={() => void deleteIdea(idea.id)} aria-label={`Delete ${idea.topic}`} className="apple-press min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-brand-rose disabled:opacity-50 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button></div>
        </article>;
      })}
    </div>}
  </section>;
}
