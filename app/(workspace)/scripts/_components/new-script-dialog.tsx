"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";
import { createScriptDraftAction } from "@/lib/actions/scripts";
import { useRouter } from "next/navigation";
import { PersonaCard } from "@/components/persona-card";

interface FinalizedIdea {
  id: string;
  topic: string;
  angleHook: string;
}

interface NewScriptDialogProps {
  ideas: FinalizedIdea[];
  initialIdeaId?: string;
  defaultOpen?: boolean;
}

export function NewScriptDialog({ ideas, initialIdeaId = "", defaultOpen = false }: NewScriptDialogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || Boolean(initialIdeaId));
  const [isClosing, setIsClosing] = useState(false);
  const [ideaId, setIdeaId] = useState(initialIdeaId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const writerMessage = error
    ? "That didn’t go through. Adjust the prompt or try once more."
    : isGenerating
      ? "I’m drafting it now—tight hook first, then the supporting beats."
      : ideaId
        ? "The finalized strategic angle is ready. I’ll turn it into a clear script."
        : "Choose a finalized content idea first, then I’ll turn it into a script.";

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }, [isClosing]);

  useEffect(() => {
    if (initialIdeaId) {
      setIdeaId(initialIdeaId);
      setIsOpen(true);
    }
  }, [initialIdeaId]);

  // Escape key handler with symmetric exit animation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await createScriptDraftAction(formData);
      if (res.success && res.scriptId) {
        setIsOpen(false);
        router.push(`/scripts/${res.scriptId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate script draft";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  const selectedIdea = ideas.find((idea) => idea.id === ideaId);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)} disabled={ideas.length === 0}
        className="apple-btn-primary min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"
      >
        <Plus className="w-4 h-4" />
        <span>{ideas.length ? "New Script" : "Finalize an Idea First"}</span>
      </button>

      <PersonaCard persona="scriptWriter" message={writerMessage} compact />

      {isOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 md:left-64 ${
            isClosing ? "apple-backdrop-out" : "apple-backdrop-in"
          }`}
          onClick={handleClose}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-script-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)] space-y-5 ${
              isClosing ? "apple-modal-out" : "apple-modal-in"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <h2 id="new-script-dialog-title" className="font-semibold text-slate-900 flex items-center gap-2.5 text-sm tracking-tight">
                <Sparkles className="w-4 h-4 text-[#1f54fc] shrink-0" />
                <span>Draft Script from Finalized Idea</span>
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="script-idea-select" className="text-[11px] font-mono tracking-wider text-slate-600 block mb-1.5 font-medium">
                  FINALIZED CONTENT IDEA
                </label>
                <select
                  id="script-idea-select"
                  name="ideaId"
                  value={ideaId}
                  onChange={(e) => setIdeaId(e.target.value)}
                  required
                  className="w-full min-h-[44px] px-3.5 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc] focus:ring-2 focus:ring-[#1f54fc]/20 transition-all font-mono shadow-sm"
                >
                  <option value="">Choose an idea...</option>
                  {ideas.map((idea) => <option key={idea.id} value={idea.id}>{idea.topic}</option>)}
                </select>
                {selectedIdea && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 apple-item-enter">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#1f54fc] font-semibold mb-0.5">
                      Approved Angle
                    </p>
                    <p className="text-xs font-mono text-slate-700 leading-relaxed">
                      &ldquo;{selectedIdea.angleHook}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="script-format-select" className="text-[11px] font-mono tracking-wider text-slate-600 block mb-1.5 font-medium">FORMAT</label>
                  <select
                    id="script-format-select"
                    name="format"
                    defaultValue="Reel"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc] font-mono shadow-sm"
                  >
                    <option value="Reel">Reel (9:16 Vertical)</option>
                    <option value="Short">YouTube Short</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="script-duration-select" className="text-[11px] font-mono tracking-wider text-slate-600 block mb-1.5 font-medium">
                    TARGET DURATION
                  </label>
                  <select
                    id="script-duration-select"
                    name="targetDurationSec"
                    defaultValue="45"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc] font-mono shadow-sm"
                  >
                    <option value="30">~30 seconds</option>
                    <option value="45">~45 seconds (Recommended)</option>
                    <option value="60">~60 seconds</option>
                  </select>
                </div>
              </div>

              {error && (
                <div 
                  role="alert"
                  className="p-3.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono apple-item-enter"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="apple-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !ideaId}
                  className={`apple-btn-primary min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs disabled:opacity-50 disabled:pointer-events-none ${
                    isGenerating ? "apple-btn-generating" : ""
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft Script</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
