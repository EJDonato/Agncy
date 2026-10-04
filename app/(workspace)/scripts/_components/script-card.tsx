"use client";

import Link from "next/link";
import { Clock, Film, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteScriptAction } from "@/lib/actions/scripts";
import type { ScriptListItem } from "@/lib/db/queries/scripts";

export function ScriptCard({ script, index = 0 }: { script: ScriptListItem; index?: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteScript() {
    if (!window.confirm(`Delete “${script.title}”? This also removes its version history.`)) return;
    setIsDeleting(true);
    try {
      await deleteScriptAction(script.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  const staggerDelay = `${Math.min(index * 45, 180)}ms`;

  return (
    <article
      style={{ animationDelay: staggerDelay }}
      className={`apple-glass-card apple-item-enter group flex items-center gap-2 p-4 sm:p-5 rounded-2xl transition-all duration-200 ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Link href={`/scripts/${script.id}`} className="apple-press flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] rounded-xl">
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

          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#1f54fc] transition-colors truncate tracking-tight">
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
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1f54fc] group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
      </Link>
      <button
        type="button"
        onClick={() => void deleteScript()}
        disabled={isDeleting}
        aria-label={`Delete ${script.title}`}
        className="apple-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-brand-rose disabled:opacity-50"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </article>
  );
}
