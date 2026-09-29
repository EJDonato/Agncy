"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { computeScriptDiff } from "@/lib/diff/lcs";
import { saveFinalScriptVersionAction } from "@/lib/actions/scripts";
import { DiffTokenView } from "./diff-token-view";
import { SurvivalMeter } from "./survival-meter";

interface SplitEditorProps {
  script: {
    id: string;
    title: string;
    format: string | null;
    targetDurationSec: number | null;
    status: string;
  };
  initialDraftText: string;
  initialFinalText: string;
}

export function SplitEditor({
  script,
  initialDraftText,
  initialFinalText,
}: SplitEditorProps) {
  const [finalContent, setFinalContent] = useState(initialFinalText || initialDraftText);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diffResult = useMemo(() => {
    return computeScriptDiff(initialDraftText, finalContent);
  }, [initialDraftText, finalContent]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await saveFinalScriptVersionAction({
        scriptId: script.id,
        finalContent,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save final version";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (confirm("Reset editor content to the initial Gemini draft?")) {
      setFinalContent(initialDraftText);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Link
            href="/scripts"
            className="p-1.5 rounded-lg border border-border-subtle bg-surface-subtle text-slate-400 hover:text-slate-100 hover:border-border-strong transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-100">{script.title}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-subtle text-slate-400 border border-border-subtle">
                {script.format || "Reel"}
              </span>
              {script.targetDurationSec && (
                <span className="text-[11px] font-mono text-slate-500">
                  ~{script.targetDurationSec}s
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit the draft to match your natural voice. Token deletions and additions train your style profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={finalContent === initialDraftText}
            className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-mono text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            title="Reset to initial AI draft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving & Synthesizing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Final Version</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedSuccess && (
        <div className="p-3 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Final version saved! Gemini is analyzing your edits to synthesize new Style Rules.
            </span>
          </div>
          <Link href="/brand" className="underline hover:text-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Style Profile</span>
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono">
          {error}
        </div>
      )}

      {/* Live Survival Meter */}
      <SurvivalMeter
        survivalPercentage={diffResult.survivalPercentage}
        draftWordCount={diffResult.draftWordCount}
        finalWordCount={diffResult.finalWordCount}
        retainedWordCount={diffResult.retainedWordCount}
      />

      {/* Split Screen Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: AI Initial Draft with Diff Highlights */}
        <div className="rounded-xl border border-border-subtle bg-surface-raised flex flex-col h-[560px]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-surface-subtle/50 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
              <span className="font-semibold">AI INITIAL DRAFT (GEMINI)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Retained
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Pruned
              </span>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <DiffTokenView tokens={diffResult.annotatedDraft} />
          </div>
        </div>

        {/* Right Pane: User's Final Editable Monospace Textarea */}
        <div className="rounded-xl border border-border-subtle bg-surface-raised flex flex-col h-[560px]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-surface-subtle/50 text-xs font-mono">
            <span className="font-semibold text-slate-300">YOUR FINAL EDIT (CREATOR)</span>
            <span className="text-[11px] text-slate-400">
              {diffResult.finalWordCount} words
            </span>
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <textarea
              value={finalContent}
              onChange={(e) => setFinalContent(e.target.value)}
              placeholder="Paste or edit your script here..."
              className="w-full flex-1 p-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 font-mono leading-relaxed resize-none focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
