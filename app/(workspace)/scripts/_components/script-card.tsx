import Link from "next/link";
import { Clock, Film, ChevronRight } from "lucide-react";
import type { ScriptListItem } from "@/lib/db/queries/scripts";

export function ScriptCard({ script }: { script: ScriptListItem }) {
  return (
    <Link
      href={`/scripts/${script.id}`}
      className="apple-glass-card apple-press group block p-4 sm:p-5 rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-medium ${
                script.status === "finalized"
                  ? "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)]"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {script.status}
            </span>
            {script.format && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                <Film className="w-3.5 h-3.5 text-slate-400" />
                {script.format}
              </span>
            )}
            {script.targetDurationSec && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{script.targetDurationSec}s
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-amber transition-colors truncate tracking-tight">
            {script.title}
          </h3>

          <p className="text-[11px] font-mono text-slate-500">
            {script.createdAt ? new Date(script.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) : "Recently"}
          </p>
        </div>

        <div className="flex items-center justify-end shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-amber group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </Link>
  );
}
