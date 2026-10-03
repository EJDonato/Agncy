"use client";

import { useState } from "react";
import { Lightbulb, Plus, Loader2, Check } from "lucide-react";
import { createIdeaAction } from "@/lib/actions/ideas";

export function IdeaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createIdeaAction(formData);
      form.reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save topic seed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 sm:p-5 rounded-xl border border-border-subtle bg-surface-raised space-y-3"
    >
      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-brand-amber" />
          <span>Capture Topic Seed</span>
        </div>
        {success && (
          <span role="status" aria-live="polite" className="text-brand-emerald flex items-center gap-1 text-[11px]">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="p-2.5 rounded-lg bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="topic"
          required
          placeholder="Topic / Premise (e.g. Bakit mabagal ang hotline 911?)"
          aria-label="Idea topic or premise"
          className="min-h-[44px] px-3.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-amber font-mono"
        />
        <input
          name="angleHook"
          required
          placeholder="Hook Angle / Conflict (e.g. Mas mabilis pa mag-reply ang GCash)"
          aria-label="Idea hook angle"
          className="min-h-[44px] px-3.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-amber font-mono"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface-subtle border border-border-strong text-slate-200 hover:text-brand-amber text-xs font-mono transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isSubmitting ? "Saving..." : "Save Topic Seed"}</span>
        </button>
      </div>
    </form>
  );
}
