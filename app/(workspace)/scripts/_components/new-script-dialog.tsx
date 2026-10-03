"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";
import { createScriptDraftAction } from "@/lib/actions/scripts";
import { useRouter } from "next/navigation";
import { PersonaCard } from "@/components/persona-card";

interface NewScriptDialogProps {
  initialTopic?: string;
  defaultOpen?: boolean;
}

export function NewScriptDialog({ initialTopic = "", defaultOpen = false }: NewScriptDialogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || Boolean(initialTopic));
  const [topic, setTopic] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const writerMessage = error
    ? "That didn’t go through. Adjust the prompt or try once more."
    : isGenerating
      ? "I’m drafting it now—tight hook first, then the supporting beats."
      : topic.trim().length >= 3
        ? "That’s a workable angle. I’ll build the script around its strongest tension."
        : "Tell me the premise or rough hook. It doesn’t need to be polished.";

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setIsOpen(true);
    }
  }, [initialTopic]);

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
        className="apple-btn-primary min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
      >
        <Plus className="w-4 h-4" />
        <span>New Script</span>
      </button>

      <div aria-live="polite">
        <PersonaCard persona="scriptWriter" message={writerMessage} compact />
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 md:left-64 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-script-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)] space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <h2 id="new-script-dialog-title" className="font-semibold text-slate-900 flex items-center gap-2.5 text-sm tracking-tight">
                <Sparkles className="w-4 h-4 text-brand-amber shrink-0" />
                <span>Draft New Script with Gemini</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close dialog"
                className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="script-topic-input" className="text-[11px] font-mono tracking-wider text-slate-600 block mb-1.5 font-medium">
                  TOPIC / PREMISE OR HOOK ANGLE
                </label>
                <textarea
                  id="script-topic-input"
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Bakit nagiging ghost town ang civic apps kahit may funding?"
                  className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 transition-all font-mono shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="script-format-select" className="text-[11px] font-mono tracking-wider text-slate-600 block mb-1.5 font-medium">FORMAT</label>
                  <select
                    id="script-format-select"
                    name="format"
                    defaultValue="Reel"
                    className="w-full min-h-[44px] px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
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
                    className="w-full min-h-[44px] px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
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
                  className="p-3.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="apple-press min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || topic.trim().length < 3}
                  className="apple-btn-primary min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs disabled:opacity-50 disabled:pointer-events-none"
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
