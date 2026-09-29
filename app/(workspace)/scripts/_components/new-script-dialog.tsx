"use client";

import { useState } from "react";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";
import { createScriptDraftAction } from "@/lib/actions/scripts";
import { useRouter } from "next/navigation";

export function NewScriptDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>New Script</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border-strong bg-surface-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-brand-amber" />
                Draft New Script with Gemini
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  TOPIC / PREMISE OR HOOK ANGLE
                </label>
                <textarea
                  name="topic"
                  required
                  rows={3}
                  placeholder="e.g. Bakit nagiging ghost town ang civic apps kahit may funding?"
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">FORMAT</label>
                  <select
                    name="format"
                    defaultValue="Reel"
                    className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
                  >
                    <option value="Reel">Reel (9:16 Vertical)</option>
                    <option value="Short">YouTube Short</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">
                    TARGET DURATION
                  </label>
                  <select
                    name="targetDurationSec"
                    defaultValue="45"
                    className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
                  >
                    <option value="30">~30 seconds</option>
                    <option value="45">~45 seconds (Recommended)</option>
                    <option value="60">~60 seconds</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing with Gemini 2.5 Pro...</span>
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
