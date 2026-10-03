import { Lightbulb, Sparkles } from "lucide-react";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Idea Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Trend-grounded content concepts matched against top-performing past hooks.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-subtle border border-brand-amber/40 text-brand-amber text-xs font-mono hover:bg-brand-amber/10 transition-colors">
          <Sparkles className="w-4 h-4" />
          <span>Scan Trends with Gemini</span>
        </button>
      </div>

      <div className="p-8 rounded-xl border border-border-subtle bg-surface-raised text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto">
          <Lightbulb className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">No Content Ideas Queued</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Run the Idea Research agent with Google Search Grounding to find emerging civic issues, or manually add topic seeds to your backlog.
        </p>
      </div>
    </div>
  );
}
