"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { saveFinalScriptVersionAction } from "@/lib/actions/scripts";
import type { SeraChatTurn } from "@/lib/ai/sera-chat-contract";
import { ScriptEditorPane } from "./script-editor-pane";
import { SeraChatPanel } from "./sera-chat-panel";

interface SingleScriptEditorProps {
  script: {
    id: string;
    title: string;
    format: string | null;
    targetDurationSec: number | null;
    status: string;
  };
  baselineText: string;
  initialContent: string;
  initialChatTurns: SeraChatTurn[];
}

export function SingleScriptEditor({ script, baselineText, initialContent, initialChatTurns }: SingleScriptEditorProps) {
  const [content, setContent] = useState(initialContent || baselineText);
  const [aiBaseline, setAiBaseline] = useState(baselineText);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeraWorking, setIsSeraWorking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applySeraRevision(revisedContent: string) {
    setContent(revisedContent);
    setAiBaseline(revisedContent);
    setSavedSuccess(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await saveFinalScriptVersionAction({ scriptId: script.id, finalContent: content });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the script.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/scripts" aria-label="Back to scripts list" className="apple-press flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{script.title}</h1>
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono uppercase text-slate-600">{script.format || "Reel"}</span>
              {script.targetDurationSec && <span className="text-[11px] font-mono text-slate-500">~{script.targetDurationSec}s</span>}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Write directly, or work through the draft with Sera.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          <button type="button" onClick={() => setContent(aiBaseline)} disabled={content === aiBaseline || isSaving || isSeraWorking} className="apple-press flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 font-mono">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button type="button" onClick={() => void handleSave()} disabled={isSaving || isSeraWorking || !content.trim()} className="apple-btn-primary flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-xs disabled:pointer-events-none disabled:opacity-50">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isSaving ? "Saving…" : "Save Script"}</span>
          </button>
        </div>
      </header>

      {savedSuccess && (
        <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl border border-brand-emerald/30 bg-brand-emerald/10 p-3.5 text-xs text-brand-emerald font-mono">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Script saved. It can now inform future drafts.</span>
        </div>
      )}
      {error && <div role="alert" className="rounded-xl border border-brand-rose/30 bg-brand-rose/10 p-3.5 text-xs text-brand-rose font-mono">{error}</div>}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <div className="order-2 min-w-0 lg:order-1">
          <ScriptEditorPane content={content} disabled={isSaving || isSeraWorking} onChange={setContent} />
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <SeraChatPanel scriptId={script.id} scriptTitle={script.title} currentContent={content} initialTurns={initialChatTurns} onRevision={applySeraRevision} onBusyChange={setIsSeraWorking} />
        </div>
      </div>
    </div>
  );
}
