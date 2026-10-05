"use client";

import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteIdeaAction, finalizeIdeaAction } from "@/lib/actions/ideas";
import { IdeaAngleDialog } from "./idea-angle-dialog";

export interface ContentIdeaListItem {
  id: string;
  topic: string;
  angleHook: string;
  whySuggested: string;
  status: "suggested" | "saved" | "converted" | "dismissed";
  predictedFitScore: number | null;
}

export function ContentIdeaBoard({ ideas }: { ideas: ContentIdeaListItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAngle, setDraftAngle] = useState("");
  const [draftTopic, setDraftTopic] = useState("");
  const [angleOverrides, setAngleOverrides] = useState<Record<string, string>>({});
  const [topicOverrides, setTopicOverrides] = useState<Record<string, string>>({});

  async function finalizeIdea(id: string) {
    const angleHook = draftAngle.trim();
    const topic = draftTopic.trim();
    if (topic.length < 3) { setError("The title must be at least 3 characters."); return; }
    if (angleHook.length < 3) { setError("The content angle must be at least 3 characters."); return; }
    setActiveId(id); setError(null);
    setAngleOverrides((current) => ({ ...current, [id]: angleHook }));
    setTopicOverrides((current) => ({ ...current, [id]: topic }));
    try {
      await finalizeIdeaAction({ ideaId: id, topic, angleHook });
      setEditingId(null);
    } catch (finalizeError) {
      setAngleOverrides((current) => { const next = { ...current }; delete next[id]; return next; });
      setTopicOverrides((current) => { const next = { ...current }; delete next[id]; return next; });
      setError(finalizeError instanceof Error ? finalizeError.message : "Could not finalize this idea.");
    } finally { setActiveId(null); }
  }
  function openAngleEditor(idea: ContentIdeaListItem, displayedTopic: string, displayedAngle: string) {
    if (idea.status !== "suggested") return;
    setEditingId(idea.id); setDraftTopic(displayedTopic); setDraftAngle(displayedAngle); setError(null);
  }
  async function deleteIdea(id: string) {
    if (!window.confirm("Delete this content idea?")) return;
    setActiveId(id); setError(null);
    try { await deleteIdeaAction(id); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Could not delete this idea."); }
    finally { setActiveId(null); }
  }

  return <section className="space-y-4">
    {error && <div role="alert" className="rounded-xl border border-brand-rose/30 bg-brand-rose/10 p-3 text-xs font-mono text-brand-rose">{error}</div>}
    {ideas.length === 0 ? <div className="apple-glass-card rounded-2xl p-10 text-center text-xs text-slate-500">Click Vela and ask for content ideas to start your pipeline.</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea, index) => {
        const isFinalized = idea.status === "saved"; const isConverted = idea.status === "converted"; const isWorking = activeId === idea.id; const isResearched = idea.whySuggested.startsWith("Trend research · "); const displayedAngle = angleOverrides[idea.id] ?? idea.angleHook; const displayedTopic = topicOverrides[idea.id] ?? idea.topic;
        const staggerDelay = `${Math.min(index * 35, 140)}ms`;
        return <article key={idea.id} style={{ animationDelay: staggerDelay }} onClick={(event) => { if (!(event.target instanceof Element) || !event.target.closest("a, button")) openAngleEditor(idea, displayedTopic, displayedAngle); }} className={`apple-glass-card apple-item-enter p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 ${idea.status === "suggested" ? "cursor-pointer hover:border-[#1f54fc]/40" : ""}`}>
          <div className="space-y-2"><span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md border font-semibold ${isConverted ? "bg-slate-100 border-slate-200 text-slate-500" : isFinalized ? "bg-brand-emerald/10 border-brand-emerald/25 text-brand-emerald" : "bg-blue-50 border-blue-200 text-[#1f54fc]"}`}>{isConverted ? "Script in progress" : isFinalized ? "Finalized idea" : isResearched ? "Trend research" : "AI suggestion"}</span><h3 className="text-sm font-semibold leading-snug tracking-tight text-slate-900">{displayedTopic}</h3><p className="text-xs font-mono text-slate-700">&ldquo;{displayedAngle}&rdquo;</p><p className="text-[11px] text-slate-500">{isResearched ? idea.whySuggested.replace("Trend research · ", "") : idea.whySuggested}</p></div>
          <div className="flex items-center gap-2">{isFinalized ? <Link href={`/scripts?ideaId=${encodeURIComponent(idea.id)}`} className="apple-press min-h-[44px] flex flex-1 items-center justify-between rounded-xl border border-[#1f54fc] bg-blue-50 px-4 py-2.5 text-xs font-mono font-medium text-[#1f54fc]">Write Script <ArrowRight className="w-4 h-4" /></Link> : !isConverted ? <button type="button" onClick={() => openAngleEditor(idea, displayedTopic, displayedAngle)} className="apple-press flex min-h-[44px] flex-1 items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-[#1f54fc]">Review Idea <ArrowRight className="h-4 w-4" /></button> : null}<button type="button" disabled={isWorking} onClick={() => void deleteIdea(idea.id)} aria-label={`Delete ${idea.topic}`} className="apple-press min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-brand-rose disabled:opacity-50 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button></div>
        </article>;
      })}
    </div>}
    {editingId && (() => { const idea = ideas.find((item) => item.id === editingId); return idea ? <IdeaAngleDialog topic={draftTopic} angle={draftAngle} error={error} isFinalizing={activeId === idea.id} onTopicChange={setDraftTopic} onAngleChange={setDraftAngle} onClose={() => setEditingId(null)} onFinalize={() => void finalizeIdea(idea.id)} /> : null; })()}
  </section>;
}
