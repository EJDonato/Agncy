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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Idea Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Topic concepts grounded in civic innovation, ready to convert into Reel scripts.
          </p>
        </div>
      </div>

      <PersonaCard persona="contentStrategist" />

      {/* Quick Add Topic Seed */}
      <IdeaForm />

      {/* Ideas Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
          <Sparkles className="w-4 h-4 text-brand-amber" />
          <span>Topic Concepts & Seeds ({savedIdeas.length + CURATED_SEEDS.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedIdeas.map((idea) => (
            <div
              key={idea.id}
              className="apple-glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-amber/10 border border-brand-amber/25 text-brand-amber font-semibold">
                  Saved Seed
                </span>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug tracking-tight">
                  {idea.topic}
                </h3>
                <p className="text-xs text-slate-700 font-mono">
                  &ldquo;{idea.angleHook}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500">
                  {idea.whySuggested}
                </p>
              </div>

              <Link
                href={`/scripts?topic=${encodeURIComponent(idea.topic)}`}
                className="apple-press min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-400 text-xs font-mono text-slate-800 font-medium transition-all group shadow-sm"
              >
                <span>Draft Reel Script</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          ))}

          {CURATED_SEEDS.map((seed, index) => (
            <div
              key={index}
              className="apple-glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald font-semibold">
                  Curated Concept
                </span>
                <h3 className="text-sm font-semibold text-slate-900 leading-snug tracking-tight">
                  {seed.topic}
                </h3>
                <p className="text-xs text-slate-700 font-mono">
                  &ldquo;{seed.angleHook}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500">
                  {seed.whySuggested}
                </p>
              </div>

              <Link
                href={`/scripts?topic=${encodeURIComponent(seed.topic)}`}
                className="apple-press min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs font-mono text-slate-700 transition-all group"
              >
                <span>Draft Reel Script</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
