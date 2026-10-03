import Link from "next/link";
import { Clock, Film, Activity, ChevronRight } from "lucide-react";
import type { ScriptListItem } from "@/lib/db/queries/scripts";

export function ScriptCard({ script }: { script: ScriptListItem }) {
  const survivalRate = script.survivalPercentage;

  const survivalColor =
    survivalRate === null
      ? "text-slate-400 border-border-subtle"
      : survivalRate >= 70
      ? "text-brand-emerald border-brand-emerald/30 bg-brand-emerald/10"
      : survivalRate >= 45
      ? "text-brand-amber border-brand-amber/30 bg-brand-amber/10"
      : "text-brand-rose border-brand-rose/30 bg-brand-rose/10";

  return (
    <Link
      href={`/scripts/${script.id}`}
      className="group block p-4 rounded-xl border border-border-subtle bg-surface-raised hover:border-brand-amber/50 hover:bg-surface-raised/80 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                script.status === "finalized"
                  ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30"
                  : "bg-surface-subtle text-slate-400 border border-border-subtle"
              }`}
            >
              {script.status}
            </span>
            {script.format && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Film className="w-3 h-3 text-slate-400" />
                {script.format}
              </span>
            )}
            {script.targetDurationSec && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                ~{script.targetDurationSec}s
              </span>
            )}
          </div>

          <h3 className="text-sm font-medium text-slate-100 group-hover:text-brand-amber transition-colors truncate">
            {script.title}
          </h3>

          <p className="text-[11px] font-mono text-slate-400">
            {script.createdAt ? new Date(script.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) : "Recently"}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t border-border-subtle/50 sm:border-t-0">
          {survivalRate !== null ? (
            <div className={`px-2.5 py-1 rounded-md border text-xs font-mono font-medium flex items-center gap-1.5 ${survivalColor}`}>
              <Activity className="w-3.5 h-3.5" />
              <span>{survivalRate}% Survival</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-400 px-2 py-1">
              Draft Pending
            </span>
          )}

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
