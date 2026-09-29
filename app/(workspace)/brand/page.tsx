import { BrainCircuit, Check, Shield } from "lucide-react";

export default function BrandBrainPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Brand Brain</h1>
          <p className="text-sm text-slate-400 mt-1">
            Persistent persona guidelines and learned style rules injected into Gemini prompts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Profile Card */}
        <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-brand-amber" />
              Creator Identity
            </h2>
            <span className="text-xs font-mono text-brand-emerald">Synced</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-mono">CREATOR NAME</span>
              <span className="text-slate-200">Elton</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-mono">NICHE & TOPICS</span>
              <span className="text-slate-200">Civic tech, grassroots community systems, open data</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-mono">LANGUAGE MIX</span>
              <span className="text-slate-200">Conversational Taglish (Filipino/English)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-mono">TONE</span>
              <span className="text-slate-200">Direct, empathetic, grounded, analytical. No cringe hype.</span>
            </div>
          </div>
        </div>

        {/* Active Style Rules Card */}
        <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-amber" />
              Active Style Rules
            </h2>
            <span className="text-xs font-mono text-slate-400">3 Injected</span>
          </div>

          <div className="space-y-2">
            {[
              "Hook must be under 8 words and present a paradox.",
              "Use conversational Taglish particles (kasi, naman, talaga).",
              "Never use generic greetings like 'Hey guys' or 'Kumusta'.",
            ].map((rule, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
                <span className="text-xs text-slate-200 font-mono">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
