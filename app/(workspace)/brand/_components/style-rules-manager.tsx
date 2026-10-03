"use client";

import { useState } from "react";
import { Shield, Check, X, Plus, Sparkles, Loader2, Pencil } from "lucide-react";
import { approveStyleRuleAction, rejectStyleRuleAction, createManualRuleAction, editAndApproveStyleRuleAction } from "@/lib/actions/brand";

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
  const [error, setError] = useState<string | null>(null);

  const proposedRules = rules.filter((r) => r.status === "proposed");
  const activeRules = rules.filter((r) => r.status === "active");

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newRuleText.trim()) return;

    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append("ruleText", newRuleText);
    formData.append("category", category);

    try {
      await createManualRuleAction(formData);
      setNewRuleText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add style rule");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Proposed Rules Section */}
      {proposedRules.length > 0 && (
        <div className="p-4 sm:p-6 rounded-xl border border-brand-amber/30 bg-brand-amber/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-amber flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Proposed Rules Awaiting Review</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{proposedRules.length} pending</span>
          </div>

          <div className="space-y-2.5">
            {proposedRules.map((rule) => (
              <ProposedRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* Active Rules List */}
      <div className="p-4 sm:p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-brand-amber shrink-0" />
            <span>Active Style Rules</span>
          </h2>
          <span className="text-xs font-mono text-brand-emerald">{activeRules.length} Active</span>
        </div>

        {activeRules.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center font-mono">
            No style rules active yet. Add an explicit writing preference below.
          </p>
        ) : (
          <div className="space-y-2">
            {activeRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-start gap-2.5 text-xs"
              >
                <Check className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-canvas text-brand-amber mr-2 border border-border-subtle">
                    {rule.category}
                  </span>
                  <span className="text-slate-200 font-mono break-words">{rule.ruleText}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div 
            role="alert"
            className="p-3 rounded-lg bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono"
          >
            {error}
          </div>
        )}

        {/* Add Manual Rule Inline Form */}
        <form onSubmit={handleAddRule} className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row gap-2">
          <select
            value={category}
            aria-label="New rule category"
            onChange={(e) => setCategory(e.target.value as "hook" | "pacing" | "vocabulary" | "structure" | "tone")}
            className="min-h-[44px] px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 focus:outline-none focus:border-brand-amber font-mono"
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
            aria-label="New rule text"
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            className="flex-1 min-h-[44px] px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-brand-amber font-mono"
          />

          <button
            type="submit"
            disabled={isSubmitting || !newRuleText.trim()}
            className="min-h-[44px] px-4 rounded-lg bg-surface-subtle border border-border-strong text-slate-200 hover:text-brand-amber text-xs font-mono transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function ProposedRuleCard({ rule }: { rule: RuleItem }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(rule.ruleText);
  const [category, setCategory] = useState(rule.category);
  const [saving, setSaving] = useState(false);

  async function saveEditedRule() {
    setSaving(true);
    try {
      await editAndApproveStyleRuleAction({ ruleId: rule.id, ruleText: text, category });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-3.5 rounded-lg bg-surface-raised border border-border-subtle text-xs space-y-2">
      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <select 
            value={category} 
            aria-label="Rule category"
            onChange={(event) => setCategory(event.target.value as RuleItem["category"])} 
            className="min-h-[44px] rounded-lg bg-surface-subtle border border-border-subtle px-3 text-xs text-slate-200 font-mono"
          >
            {["hook", "pacing", "vocabulary", "structure", "tone"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input 
            value={text} 
            aria-label="Rule text"
            onChange={(event) => setText(event.target.value)} 
            className="flex-1 min-h-[44px] rounded-lg bg-surface-subtle border border-border-subtle px-3 text-xs text-slate-200 font-mono" 
          />
          <button 
            type="button"
            disabled={saving || text.trim().length < 5} 
            onClick={() => void saveEditedRule()} 
            aria-label="Save and approve rule"
            className="min-h-[44px] min-w-[44px] rounded-lg border border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/10 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-subtle text-slate-400 mr-2 border border-border-subtle">
              {rule.category}
            </span>
            <span className="text-slate-200 font-mono break-words">{rule.ruleText}</span>
            {rule.rationale && (
              <span className="block text-[11px] text-slate-400 mt-1">{rule.rationale}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
            <button 
              type="button"
              onClick={() => setEditing(true)} 
              title="Edit before approving" 
              aria-label="Edit rule before approving"
              className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-amber hover:bg-surface-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => void approveStyleRuleAction(rule.id)} 
              title="Approve" 
              aria-label="Approve style rule"
              className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-brand-emerald hover:bg-brand-emerald/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => void rejectStyleRuleAction(rule.id)} 
              title="Dismiss" 
              aria-label="Dismiss style rule"
              className="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-rose hover:bg-brand-rose/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
