"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2, Loader2 } from "lucide-react";
import { deleteIdeaAction } from "@/lib/actions/ideas";
import type { FinalizedIdeaItem } from "@/lib/db/queries/ideas";

interface FinalizedIdeaCardProps {
  idea: FinalizedIdeaItem;
  index?: number;
  onDraft: (ideaId: string) => void;
}

export function FinalizedIdeaCard({ idea, index = 0, onDraft }: FinalizedIdeaCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteIdea() {
    if (!window.confirm(`Remove “${idea.topic}”? It will be removed from your script queue.`)) return;
    setIsDeleting(true);
    try {
      await deleteIdeaAction(idea.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  const staggerDelay = `${Math.min(index * 45, 180)}ms`;
  const formattedDate = idea.createdAt
    ? new Date(idea.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently finalized";

  return (
    <article
      style={{ animationDelay: staggerDelay }}
      tabIndex={isDeleting ? undefined : 0}
      aria-label={`Draft a script from ${idea.topic}`}
      onClick={(event) => {
        if (!(event.target instanceof Element) || !event.target.closest("button")) onDraft(idea.id);
      }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onDraft(idea.id);
        }
      }}
      className={`apple-glass-card apple-press apple-item-enter group flex cursor-pointer flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.03] to-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] hover:border-emerald-500/40 ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="space-y-2.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)]">
            Ready to Script
          </span>
          {typeof idea.predictedFitScore === "number" && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {Math.round(idea.predictedFitScore * 100)}% Fit
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-500">
            {formattedDate}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
          {idea.topic}
        </h3>

        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs font-mono text-slate-700 leading-relaxed">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#1f54fc] block mb-0.5">
            Approved Angle
          </span>
          &ldquo;{idea.angleHook}&rdquo;
        </div>

        {idea.whySuggested && (
          <p className="text-[11px] text-slate-500 line-clamp-2">
            {idea.whySuggested.replace("Trend research · ", "")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0 self-end md:self-center">
        <button
          type="button"
          onClick={() => void deleteIdea()}
          disabled={isDeleting}
          aria-label={`Remove finalized idea: ${idea.topic}`}
          className="apple-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-brand-rose disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </article>
  );
}
