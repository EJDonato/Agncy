"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, RotateCcw, Save, Send, Sparkles } from "lucide-react";
import { reviseScriptWithPromptAction, saveFinalScriptVersionAction } from "@/lib/actions/scripts";
import { PersonaCard } from "@/components/persona-card";

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
}

export function SingleScriptEditor({
  script,
  baselineText,
  initialContent,
}: SingleScriptEditorProps) {
  const [content, setContent] = useState(initialContent || baselineText);
  const [aiBaseline, setAiBaseline] = useState(baselineText);
  const [instruction, setInstruction] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [revisionComplete, setRevisionComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const writerMessage = error
    ? "I hit a problem with that request. Try rewording it and send it again."
    : isRevising
      ? "I’m working through that revision now."
      : isSaving
        ? "I’m saving your version and its writing patterns."
        : savedSuccess
          ? "Saved. I’ll use the choices you made when we write the next script."
          : revisionComplete
            ? "Done. Read it through and tell me what still feels off."
            : instruction.trim().length >= 3
              ? "Got it. Send that instruction and I’ll reshape the current draft."
              : "Tell me what to change—hook, tone, pacing, wording, or structure.";

  async function handleRevision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = instruction.trim();
    if (prompt.length < 3) return;
    setIsRevising(true);
    setError(null);
    setSavedSuccess(false);
    setRevisionComplete(false);
    try {
      const result = await reviseScriptWithPromptAction({
        scriptId: script.id,
        currentContent: content,
        instruction: prompt,
      });
      setContent(result.revisedContent);
      setAiBaseline(result.revisedContent);
      setInstruction("");
      setRevisionComplete(true);
    } catch (revisionError) {
      setError(revisionError instanceof Error ? revisionError.message : "Gemini could not revise the script.");
    } finally {
      setIsRevising(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await saveFinalScriptVersionAction({
        scriptId: script.id,
        finalContent: content,
      });
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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            href="/scripts" 
            aria-label="Back to scripts list" 
            className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate tracking-tight">{script.title}</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-100 text-slate-600 border border-slate-200">{script.format || "Reel"}</span>
              {script.targetDurationSec && <span className="text-[11px] font-mono text-slate-500">~{script.targetDurationSec}s</span>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Edit directly or instruct Gemini. Saved scripts become context for future drafts.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button 
            type="button" 
            onClick={() => setContent(aiBaseline)} 
            disabled={content === aiBaseline || isRevising} 
            aria-label="Reset content to initial draft"
            className="apple-press min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button 
            type="button" 
            onClick={() => void handleSave()} 
            disabled={isSaving || isRevising || !content.trim()} 
            className="apple-btn-primary min-h-[44px] px-5 rounded-xl text-xs disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? "Saving..." : "Save Script"}</span>
          </button>
        </div>
      </header>

      <div aria-live="polite">
        <PersonaCard persona="scriptWriter" message={writerMessage} compact />
        <form onSubmit={handleRevision} className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-[#1f54fc]/30 bg-blue-50/50 backdrop-blur-xl p-3 sm:p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-[#1f54fc] shrink-0 ml-1" />
            <input
              value={instruction}
              onChange={(event) => {
                setInstruction(event.target.value);
                setRevisionComplete(false);
              }}
              disabled={isRevising}
              aria-label="Prompt Gemini to revise this script"
              placeholder="Make the hook shorter, add more Taglish, strengthen the CTA..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none min-h-[44px] px-1 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isRevising || instruction.trim().length < 3 || !content.trim()}
            className="apple-btn-primary min-h-[44px] px-5 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all shrink-0"
          >
            {isRevising ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isRevising ? "Updating..." : "Apply Prompt"}</span>
          </button>
        </form>
      </div>

      {savedSuccess && (
        <div role="status" aria-live="polite" className="p-3.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Script saved. Gemini will use it as a writing reference for future drafts.</span>
        </div>
      )}
      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-apple-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/80 text-xs font-mono">
          <span className="font-semibold text-slate-700 tracking-wider">SCRIPT</span>
          <span className="text-slate-500">{wordCount} words</span>
        </div>
        <textarea 
          value={content} 
          onChange={(event) => setContent(event.target.value)} 
          disabled={isRevising} 
          aria-label="Editable script draft" 
          spellCheck={false} 
          className="w-full min-h-[380px] sm:min-h-[520px] p-5 sm:p-6 bg-white text-xs sm:text-sm text-slate-900 font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#1f54fc]/50 disabled:opacity-60" 
        />
      </section>
    </div>
  );
}
