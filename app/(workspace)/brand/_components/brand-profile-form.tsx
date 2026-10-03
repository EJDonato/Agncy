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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      await saveBrandProfileAction(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save brand profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="apple-glass-card p-6 sm:p-7 rounded-2xl space-y-5 shadow-apple-card">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2.5 text-sm sm:text-base tracking-tight">
          <BrainCircuit className="w-4 h-4 text-brand-amber shrink-0" />
          <span>Creator Identity & Context</span>
        </h2>
        {savedSuccess && (
          <span 
            role="status"
            aria-live="polite"
            className="text-xs font-mono text-brand-emerald flex items-center gap-1.5 font-semibold"
          >
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {errorMessage && (
        <div 
          role="alert"
          className="p-3.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand-creator-name" className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5">
            CREATOR NAME
          </label>
          <input
            id="brand-creator-name"
            name="creatorName"
            defaultValue={initialData?.creatorName || "Elton"}
            required
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="brand-language-mix" className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5">
            LANGUAGE MIX
          </label>
          <input
            id="brand-language-mix"
            name="languageMix"
            defaultValue={initialData?.languageMix || "Taglish (Filipino/English)"}
            required
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="brand-niche" className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5">
          NICHE & CORE TOPICS
        </label>
        <input
          id="brand-niche"
          name="niche"
          defaultValue={initialData?.niche || "Civic tech, grassroots community apps, public interest technology"}
          required
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="brand-target-audience" className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5">
          TARGET AUDIENCE
        </label>
        <input
          id="brand-target-audience"
          name="targetAudience"
          defaultValue={initialData?.targetAudience || "Filipino youth developers, civic organizers, local community builders"}
          required
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="brand-tone-of-voice" className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5">
          TONE OF VOICE
        </label>
        <input
          id="brand-tone-of-voice"
          name="toneOfVoice"
          defaultValue={initialData?.toneOfVoice || "Direct, grounded, empathetic, analytical. No cringe hype or generic buzzwords."}
          required
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="brand-dos-and-donts" className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5">
          DO&apos;S &amp; DON&apos;TS / GUARDRAILS
        </label>
        <textarea
          id="brand-dos-and-donts"
          name="dosAndDonts"
          defaultValue={initialData?.dosAndDonts || "Never start with 'Hey guys'. Start directly at the paradox or friction. Use natural Taglish particles (kasi, naman, talaga)."}
          rows={3}
          className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono leading-relaxed shadow-sm"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="apple-btn-primary min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Saving..." : "Save Brand Profile"}</span>
        </button>
      </div>
    </form>
  );
}
