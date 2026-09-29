"use client";

import type { AnnotatedToken } from "@/lib/diff/lcs";

interface DiffTokenViewProps {
  tokens: AnnotatedToken[];
}

export function DiffTokenView({ tokens }: DiffTokenViewProps) {
  if (tokens.length === 0) {
    return <p className="text-xs font-mono text-slate-500 italic">No content to display.</p>;
  }

  return (
    <div className="font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
      {tokens.map((token, index) => {
        if (!token.isWord) {
          return <span key={index}>{token.text}</span>;
        }

        if (token.status === "deleted") {
          return (
            <span
              key={index}
              className="line-through text-brand-rose/80 bg-brand-rose/10 px-0.5 rounded transition-colors"
              title="Removed in final version"
            >
              {token.text}
            </span>
          );
        }

        if (token.status === "retained") {
          return (
            <span
              key={index}
              className="text-slate-200 bg-brand-emerald/10 text-emerald-300 px-0.5 rounded transition-colors"
              title="Retained from initial draft"
            >
              {token.text}
            </span>
          );
        }

        return <span key={index} className="text-slate-200">{token.text}</span>;
      })}
    </div>
  );
}
