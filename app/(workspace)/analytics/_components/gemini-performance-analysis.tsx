"use client";

import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { PerformanceAnalysisJob } from "@/lib/analytics/performance-analysis-contract";

const POLL_INTERVAL_MS = 2_000;
const JOB_ENDPOINT = "/api/analytics/performance-analysis";

async function requestJob(url: string, init?: RequestInit): Promise<PerformanceAnalysisJob | null> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const { PerformanceAnalysisApiResponseSchema } = await import("@/lib/analytics/performance-analysis-contract");
  const payload = PerformanceAnalysisApiResponseSchema.parse(await response.json());
  if (!payload.success) throw new Error(payload.error);
  return payload.job;
}

export function GeminiPerformanceAnalysis() {
  const [job, setJob] = useState<PerformanceAnalysisJob | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAnalyzing = job?.status === "queued" || job?.status === "running";
  const activeJobId = isAnalyzing ? job.id : null;

  useEffect(() => {
    let cancelled = false;
    void requestJob(JOB_ENDPOINT)
      .then((latestJob) => {
        if (!cancelled) setJob(latestJob);
      })
      .catch(() => {
        if (!cancelled) setError("Could not restore the latest analysis status.");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeJobId) return;
    const jobId = activeJobId;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const updatedJob = await requestJob(`${JOB_ENDPOINT}?id=${encodeURIComponent(jobId)}`);
        if (cancelled || !updatedJob) return;
        setJob(updatedJob);
        if (updatedJob.status === "queued" || updatedJob.status === "running") {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [activeJobId]);

  async function runAnalysis() {
    setIsStarting(true);
    setError(null);
    try {
      const startedJob = await requestJob(JOB_ENDPOINT, { method: "POST" });
      if (!startedJob) throw new Error("The analysis job could not be started.");
      setJob(startedJob);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Gemini could not analyze performance right now.");
    } finally {
      setIsStarting(false);
    }
  }

  const displayedError = error || (job?.status === "failed" ? job.error : null);
  const analysis = job?.analysis;
  const contextSummary = job?.context;

  return (
    <section className="rounded-2xl border border-[#1f54fc]/25 bg-blue-50/50 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 tracking-tight">
            <Sparkles className="w-4 h-4 text-[#1f54fc]" />
            <span>Gemini pattern analysis</span>
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
            Axiom compares themes, hooks, formats, and outcomes, then automatically verifies whether time-sensitive opportunities are still actionable before recommending experiments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runAnalysis()}
          disabled={isStarting || isAnalyzing}
          className={`apple-btn-primary flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs disabled:opacity-50 ${
            isStarting || isAnalyzing ? "apple-btn-generating" : ""
          }`}
        >
          {isStarting || isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isStarting ? "Starting..." : isAnalyzing ? "Analyzing..." : analysis ? "Analyze again" : "Analyze"}</span>
        </button>
      </div>

      {isAnalyzing && (
        <div role="status" aria-live="polite" className="mt-4 flex items-start gap-2 rounded-xl border border-[#1f54fc]/20 bg-white/70 p-3 text-xs text-slate-600 apple-item-enter">
          <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-[#1f54fc]" />
          <span>Analysis is running in the background. You can use the rest of Agncy or leave this page; the result will be here when you return.</span>
        </div>
      )}

      {job?.status === "completed" && analysis && (
        <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-brand-emerald/25 bg-brand-emerald/5 p-3 text-xs text-emerald-800 apple-item-enter">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Background analysis completed.</span>
        </div>
      )}

      {displayedError && (
        <div role="alert" className="mt-4 rounded-xl border border-brand-rose/30 bg-brand-rose/10 p-3 text-xs font-mono text-brand-rose apple-item-enter">
          {displayedError}
        </div>
      )}

      {analysis && (
        <div className="mt-5 space-y-4 apple-item-enter">
          {contextSummary && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2.5 text-[11px] font-mono text-slate-600">
              <span className="font-semibold text-slate-800">Context verified automatically</span>
              <span>{contextSummary.activeCount} active or evergreen</span>
              <span>{contextSummary.excludedCount} expired topics excluded</span>
              {contextSummary.unclearCount > 0 && <span>{contextSummary.unclearCount} require verification</span>}
              <time className="sm:ml-auto" dateTime={contextSummary.checkedAt}>{new Date(contextSummary.checkedAt).toLocaleString()}</time>
            </div>
          )}
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
