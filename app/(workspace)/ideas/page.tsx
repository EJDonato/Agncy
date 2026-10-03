import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getIdeasList } from "@/lib/db/queries/ideas";
import { IdeaForm } from "./_components/idea-form";
import { PersonaCard } from "@/components/persona-card";

const CURATED_SEEDS = [
  {
    topic: "Bakit nagiging ghost town ang civic apps kahit may funding?",
    angleHook: "Ang problema sa barangay tech ay hindi budget—ito ay lack of community ownership.",
    whySuggested: "High retention potential based on grassroots tech problem-solving.",
  },
  {
    topic: "Paano i-audit ang local government procurement gamit ang open data?",
    angleHook: "Lahat ng binibili ng city hall mo ay public record. Narito kung paano ito basahin.",
    whySuggested: "Empowering civic transparency with clear analytical tone.",
  },
  {
    topic: "Open-source tools para sa community disaster readiness",
    angleHook: "Kapag bumaha, huwag umasa sa Facebook announcements na huli nang darating.",
    whySuggested: "Urgent grassroots public interest concept with high shareability.",
  },
];

export default async function IdeasPage() {
  const savedIdeas = getIdeasList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Idea Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Topic concepts grounded in civic innovation, ready to convert into Reel scripts.
          </p>
        </div>
      </div>

      <PersonaCard persona="contentStrategist" />

      {/* Quick Add Topic Seed */}
      <IdeaForm />

      {/* Ideas Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-amber" />
          <span>Topic Concepts & Seeds ({savedIdeas.length + CURATED_SEEDS.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedIdeas.map((idea) => (
            <div
              key={idea.id}
              className="p-5 rounded-xl border border-border-subtle bg-surface-raised flex flex-col justify-between space-y-4 hover:border-brand-amber/40 transition-colors"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle text-brand-amber">
                  Saved Seed
                </span>
                <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                  {idea.topic}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  &ldquo;{idea.angleHook}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400">
                  {idea.whySuggested}
                </p>
              </div>

              <Link
                href={`/scripts?topic=${encodeURIComponent(idea.topic)}`}
                className="min-h-[44px] flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface-subtle hover:bg-brand-amber/15 hover:text-brand-amber border border-border-subtle hover:border-brand-amber/30 text-xs font-mono text-slate-200 transition-colors group"
              >
                <span>Draft Reel Script</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          ))}

          {CURATED_SEEDS.map((seed, index) => (
            <div
              key={index}
              className="p-5 rounded-xl border border-border-subtle bg-surface-raised flex flex-col justify-between space-y-4 hover:border-brand-amber/40 transition-colors"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle text-brand-emerald">
                  Curated Concept
                </span>
                <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                  {seed.topic}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  &ldquo;{seed.angleHook}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400">
                  {seed.whySuggested}
                </p>
              </div>

              <Link
                href={`/scripts?topic=${encodeURIComponent(seed.topic)}`}
                className="min-h-[44px] flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface-subtle hover:bg-brand-amber/15 hover:text-brand-amber border border-border-subtle hover:border-brand-amber/30 text-xs font-mono text-slate-200 transition-colors group"
              >
                <span>Draft Reel Script</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
