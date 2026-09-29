import { FileText, Plus, Sparkles } from "lucide-react";

export default function ScriptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Script Studio</h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-drafted short-form video scripts with token-level survival diffing.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-sm hover:bg-brand-amber/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Script</span>
        </button>
      </div>

      <div className="p-8 rounded-xl border border-border-subtle bg-surface-raised text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">No Scripts Created Yet</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Generate your first Reel script draft from a topic. As you edit the draft, Agncy measures draft survival and synthesizes your style profile.
        </p>
        <div className="pt-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-subtle border border-border-strong text-slate-200 hover:text-brand-amber text-xs font-mono transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            <span>Draft with Gemini 2.5 Pro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
