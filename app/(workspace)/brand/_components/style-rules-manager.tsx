"use client";

import { useState } from "react";
import { Shield, Check, X, Plus, Sparkles, Loader2 } from "lucide-react";
import { approveStyleRuleAction, rejectStyleRuleAction, createManualRuleAction } from "@/lib/actions/brand";

interface RuleItem {
  id: string;
  category: "hook" | "pacing" | "vocabulary" | "structure" | "tone";
  ruleText: string;
  rationale: string | null;
  status: string;
}

interface Props {
  rules: RuleItem[];
}

export function StyleRulesManager({ rules }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRuleText, setNewRuleText] = useState("");
  const [category, setCategory] = useState<"hook" | "pacing" | "vocabulary" | "structure" | "tone">("hook");

  const proposedRules = rules.filter((r) => r.status === "proposed");
  const activeRules = rules.filter((r) => r.status === "active");

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newRuleText.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("ruleText", newRuleText);
    formData.append("category", category);

    try {
      await createManualRuleAction(formData);
      setNewRuleText("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Proposed Rules Section (Highlighted if any AI rules were synthesized) */}
      {proposedRules.length > 0 && (
        <div className="p-6 rounded-xl border border-brand-amber/30 bg-brand-amber/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-amber flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              Proposed Rules Synthesized from Your Edits
            </h3>
            <span className="text-xs font-mono text-slate-400">{proposedRules.length} pending review</span>
          </div>

          <div className="space-y-2">
            {proposedRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-subtle text-slate-400 mr-2">
                    {rule.category}
                  </span>
                  <span className="text-slate-200">{rule.ruleText}</span>
                  {rule.rationale && (
                    <span className="block text-[11px] text-slate-500 mt-0.5">{rule.rationale}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => approveStyleRuleAction(rule.id)}
                    className="p-1.5 rounded-md bg-brand-emerald/15 text-brand-emerald hover:bg-brand-emerald/25 transition-colors"
                    title="Approve & Inject in Prompts"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => rejectStyleRuleAction(rule.id)}
                    className="p-1.5 rounded-md bg-surface-subtle text-slate-400 hover:text-slate-200 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Rules List */}
      <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-brand-amber" />
            Active Style Rules (Injected in Gemini Prompts)
          </h2>
          <span className="text-xs font-mono text-brand-emerald">{activeRules.length} Active</span>
        </div>

        {activeRules.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center font-mono">
            No style rules active yet. Add a rule below or edit AI scripts to synthesize rules automatically.
          </p>
        ) : (
          <div className="space-y-2">
            {activeRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-start gap-2.5 text-xs"
              >
                <Check className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-canvas text-brand-amber mr-2 border border-border-subtle">
                    {rule.category}
                  </span>
                  <span className="text-slate-200 font-mono">{rule.ruleText}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Manual Rule Inline Form */}
        <form onSubmit={handleAddRule} className="pt-2 border-t border-border-subtle flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "hook" | "pacing" | "vocabulary" | "structure" | "tone")}
            className="px-2.5 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-300 focus:outline-none focus:border-brand-amber font-mono"
          >
            <option value="hook">HOOK</option>
            <option value="pacing">PACING</option>
            <option value="vocabulary">VOCABULARY</option>
            <option value="structure">STRUCTURE</option>
            <option value="tone">TONE</option>
          </select>

          <input
            type="text"
            placeholder="Add custom rule (e.g. 'Keep hook under 8 words')..."
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-amber font-mono"
          />

          <button
            type="submit"
            disabled={isSubmitting || !newRuleText.trim()}
            className="px-3 py-2 rounded-lg bg-surface-subtle border border-border-strong text-slate-200 hover:text-brand-amber text-xs font-mono transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
}
