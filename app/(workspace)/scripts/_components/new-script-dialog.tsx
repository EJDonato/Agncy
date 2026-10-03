"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";
import { createScriptDraftAction } from "@/lib/actions/scripts";
import { useRouter } from "next/navigation";
import { GEMINI_SCRIPT_MODEL_LABEL } from "@/lib/ai/models";

export function NewScriptDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
      >
        <Plus className="w-4 h-4" />
        <span>New Script</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-script-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border-strong bg-surface-raised p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 id="new-script-dialog-title" className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-brand-amber shrink-0" />
                <span>Draft New Script with Gemini</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="script-topic-input" className="text-xs font-mono text-slate-400 block mb-1">
                  TOPIC / PREMISE OR HOOK ANGLE
                </label>
                <textarea
                  id="script-topic-input"
                  name="topic"
                  required
                  rows={3}
                  placeholder="e.g. Bakit nagiging ghost town ang civic apps kahit may funding?"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="script-format-select" className="text-xs font-mono text-slate-400 block mb-1">FORMAT</label>
                  <select
                    id="script-format-select"
                    name="format"
                    defaultValue="Reel"
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
                  >
                    <option value="Reel">Reel (9:16 Vertical)</option>
                    <option value="Short">YouTube Short</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="script-duration-select" className="text-xs font-mono text-slate-400 block mb-1">
                    TARGET DURATION
                  </label>
                  <select
                    id="script-duration-select"
                    name="targetDurationSec"
                    defaultValue="45"
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
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
                  className="p-3 rounded-lg bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing with {GEMINI_SCRIPT_MODEL_LABEL}...</span>
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
