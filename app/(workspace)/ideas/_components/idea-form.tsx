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
      className="apple-glass-card p-5 sm:p-6 rounded-2xl space-y-4"
    >
      <div className="flex items-center justify-between text-xs font-mono text-slate-700">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#1f54fc]" />
          <span className="font-semibold tracking-wider">CAPTURE TOPIC SEED</span>
        </div>
        {success && (
          <span role="status" aria-live="polite" className="text-brand-emerald flex items-center gap-1.5 text-xs font-mono">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="topic"
          required
          placeholder="Topic / Premise (e.g. Bakit mabagal ang hotline 911?)"
          aria-label="Idea topic or premise"
          className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1f54fc] focus:ring-2 focus:ring-[#1f54fc]/20 font-mono transition-all shadow-sm"
        />
        <input
          name="angleHook"
          required
          placeholder="Hook Angle / Conflict (e.g. Mas mabilis pa mag-reply ang GCash)"
          aria-label="Idea hook angle"
          className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1f54fc] focus:ring-2 focus:ring-[#1f54fc]/20 font-mono transition-all shadow-sm"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="apple-btn-primary min-h-[44px] flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isSubmitting ? "Saving..." : "Save Topic Seed"}</span>
        </button>
      </div>
    </form>
  );
}
