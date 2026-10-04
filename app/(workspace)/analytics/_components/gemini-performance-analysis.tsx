"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { generatePerformanceAnalysisAction } from "@/lib/actions/analytics";
import type { PerformanceAnalysis } from "@/lib/ai/schemas";

export function GeminiPerformanceAnalysis() {
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConstraints, setCurrentConstraints] = useState("");

  async function runAnalysis() {
    setIsAnalyzing(true);
    setError(null);
    try {
      setAnalysis(await generatePerformanceAnalysisAction({ currentConstraints: currentConstraints.trim() || undefined }));
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Gemini could not analyze performance right now.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#1f54fc]/25 bg-blue-50/50 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 tracking-tight">
            <Sparkles className="w-4 h-4 text-[#1f54fc]" />
            <span>Gemini pattern analysis</span>
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
            Use Gemini to compare similar themes, hooks, formats, and outcomes across your imported posts. Results cite the available data and recommend experiments—not guarantees.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runAnalysis()}
          disabled={isAnalyzing}
          className={`apple-btn-primary flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs disabled:opacity-50 ${
            isAnalyzing ? "apple-btn-generating" : ""
          }`}
        >
          {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isAnalyzing ? "Analyzing..." : "Analyze"}</span>
        </button>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[10px] font-mono font-semibold tracking-wider text-slate-600">CURRENT CONTEXT &amp; CONSTRAINTS</span>
        <textarea
          value={currentConstraints}
          onChange={(event) => { setCurrentConstraints(event.target.value); setAnalysis(null); }}
          maxLength={1_500}
          rows={3}
          disabled={isAnalyzing}
          placeholder="e.g. The financial-assistance application period has ended. Focus on evergreen civic-tech topics and currently active opportunities."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-mono leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-[#1f54fc] focus:outline-none focus:ring-2 focus:ring-[#1f54fc]/20 disabled:opacity-50"
        />
        <span className="mt-1.5 block text-[11px] text-slate-500">Optional. Add expired programs, current priorities, or topics you cannot act on.</span>
      </label>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-brand-rose/30 bg-brand-rose/10 p-3 text-xs font-mono text-brand-rose apple-item-enter">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-5 space-y-4 apple-item-enter">
          <p className="text-sm leading-relaxed text-slate-800 font-medium">
            {analysis.executiveSummary}
          </p>

          <div className="grid gap-3 lg:grid-cols-3">
            {analysis.winningPatterns.map((pattern) => (
              <article key={pattern.finding} className="apple-glass-card rounded-xl p-4 transition-all">
                <h4 className="text-xs font-semibold text-slate-900 tracking-tight">{pattern.finding}</h4>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-700">Evidence:</span> {pattern.evidence}
                </p>
                <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#1f54fc]">
                  <span className="font-semibold">Test:</span> {pattern.recommendation}
                </p>
              </article>
            ))}
          </div>

          <div className="apple-glass-card rounded-xl p-4 space-y-2">
            <h4 className="text-[11px] font-mono font-semibold tracking-wider text-slate-700 uppercase">
              NEXT EXPERIMENTS
            </h4>
            <ul className="space-y-1.5 text-xs leading-relaxed text-slate-700">
              {analysis.experiments.map((experiment) => (
                <li key={experiment} className="flex items-start gap-2">
                  <span className="text-[#1f54fc] font-bold">•</span>
                  <span>{experiment}</span>
                </li>
              ))}
            </ul>
            <p className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
              <span className="font-semibold">Caveat:</span> {analysis.caveat}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
