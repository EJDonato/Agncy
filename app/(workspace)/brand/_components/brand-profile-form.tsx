"use client";

import { useState } from "react";
import { saveBrandProfileAction } from "@/lib/actions/brand";
import { BrainCircuit, Check, Loader2, Save } from "lucide-react";

interface Props {
  initialData?: {
    creatorName: string;
    niche: string;
    targetAudience: string;
    toneOfVoice: string;
    languageMix: string;
    dosAndDonts: string | null;
  } | null;
}

export function BrandProfileForm({ initialData }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      await saveBrandProfileAction(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <h2 className="font-semibold text-slate-100 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-brand-amber" />
          Creator Identity & Context
        </h2>
        {savedSuccess && (
          <span className="text-xs font-mono text-brand-emerald flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Saved to SQLite
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">CREATOR NAME</label>
          <input
            name="creatorName"
            defaultValue={initialData?.creatorName || "Elton"}
            required
            className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">LANGUAGE MIX</label>
          <input
            name="languageMix"
            defaultValue={initialData?.languageMix || "Taglish (Filipino/English)"}
            required
            className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-mono text-slate-400 block mb-1">NICHE & CORE TOPICS</label>
        <input
          name="niche"
          defaultValue={initialData?.niche || "Civic tech, grassroots community apps, public interest technology"}
          required
          className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber"
        />
      </div>

      <div>
        <label className="text-xs font-mono text-slate-400 block mb-1">TARGET AUDIENCE</label>
        <input
          name="targetAudience"
          defaultValue={initialData?.targetAudience || "Filipino youth developers, civic organizers, local community builders"}
          required
          className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber"
        />
      </div>

      <div>
        <label className="text-xs font-mono text-slate-400 block mb-1">TONE OF VOICE</label>
        <input
          name="toneOfVoice"
          defaultValue={initialData?.toneOfVoice || "Direct, grounded, empathetic, analytical. No cringe hype or generic buzzwords."}
          required
          className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber"
        />
      </div>

      <div>
        <label className="text-xs font-mono text-slate-400 block mb-1">DO&apos;S &amp; DON&apos;TS / GUARDRAILS</label>
        <textarea
          name="dosAndDonts"
          defaultValue={initialData?.dosAndDonts || "Never start with 'Hey guys'. Start directly at the paradox or friction. Use natural Taglish particles (kasi, naman, talaga)."}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-100 focus:outline-none focus:border-brand-amber font-mono"
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-xs hover:bg-brand-amber/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? "Saving..." : "Save Brand Profile"}</span>
        </button>
      </div>
    </form>
  );
}
