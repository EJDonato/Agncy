"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { generatePerformanceAnalysisAction } from "@/lib/actions/analytics";
import type { PerformanceAnalysis } from "@/lib/ai/schemas";

export function GeminiPerformanceAnalysis() {
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setIsAnalyzing(true);
    setError(null);
    try {
      setAnalysis(await generatePerformanceAnalysisAction());
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Gemini could not analyze performance right now.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return <section className="rounded-2xl border border-[#1f54fc]/25 bg-blue-50/50 p-5 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles className="w-4 h-4 text-[#1f54fc]" /> Gemini pattern analysis</h3><p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">Use Gemini to compare similar themes, hooks, formats, and outcomes across your imported posts. Results cite the available data and recommend experiments—not guarantees.</p></div>
      <button type="button" onClick={() => void runAnalysis()} disabled={isAnalyzing} className="apple-btn-primary flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs disabled:opacity-50">{isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}{isAnalyzing ? "Analyzing..." : "Analyze"}</button>
    </div>
    {error && <div role="alert" className="mt-4 rounded-xl border border-brand-rose/30 bg-brand-rose/10 p-3 text-xs font-mono text-brand-rose">{error}</div>}
    {analysis && <div className="mt-5 space-y-4"><p className="text-sm leading-relaxed text-slate-800">{analysis.executiveSummary}</p><div className="grid gap-3 lg:grid-cols-3">{analysis.winningPatterns.map((pattern) => <article key={pattern.finding} className="rounded-xl border border-slate-200 bg-white/80 p-4"><h4 className="text-xs font-semibold text-slate-900">{pattern.finding}</h4><p className="mt-2 text-[11px] leading-relaxed text-slate-600">Evidence: {pattern.evidence}</p><p className="mt-3 text-[11px] font-medium leading-relaxed text-[#1f54fc]">Test: {pattern.recommendation}</p></article>)}</div><div className="rounded-xl border border-slate-200 bg-white/70 p-4"><h4 className="text-[11px] font-mono font-semibold tracking-wider text-slate-700">NEXT EXPERIMENTS</h4><ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700">{analysis.experiments.map((experiment) => <li key={experiment}>• {experiment}</li>)}</ul><p className="mt-3 text-[11px] text-slate-500">Caveat: {analysis.caveat}</p></div></div>}
  </section>;
}
