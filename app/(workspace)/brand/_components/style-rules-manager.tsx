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
        <div className="apple-glass-card p-5 sm:p-6 rounded-2xl border border-brand-amber/35 bg-amber-50/40 space-y-3.5 shadow-apple-card">
          <div className="flex items-center justify-between border-b border-brand-amber/25 pb-3">
            <h3 className="font-semibold text-brand-amber flex items-center gap-2 text-sm tracking-tight">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Proposed Rules Awaiting Review</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{proposedRules.length} pending</span>
          </div>

          <div className="space-y-2.5">
            {proposedRules.map((rule) => (
              <ProposedRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* Active Rules List */}
      <div className="apple-glass-card p-5 sm:p-6 rounded-2xl space-y-4 shadow-apple-card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm tracking-tight">
            <Shield className="w-4 h-4 text-brand-amber shrink-0" />
            <span>Active Style Rules</span>
          </h2>
          <span className="text-xs font-mono text-brand-emerald font-semibold">{activeRules.length} Active</span>
        </div>

        {activeRules.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center font-mono">
            No style rules active yet. Add an explicit writing preference below.
          </p>
        ) : (
          <div className="space-y-2">
            {activeRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 flex items-start gap-2.5 text-xs transition-colors hover:bg-slate-100"
              >
                <Check className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-brand-amber mr-2 border border-amber-200 font-semibold">
                    {rule.category}
                  </span>
                  <span className="text-slate-900 font-mono break-words">{rule.ruleText}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div 
            role="alert"
            className="p-3.5 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs font-mono"
          >
            {error}
          </div>
        )}

        {/* Add Manual Rule Inline Form */}
        <form onSubmit={handleAddRule} className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
          <select
            value={category}
            aria-label="New rule category"
            onChange={(e) => setCategory(e.target.value as "hook" | "pacing" | "vocabulary" | "structure" | "tone")}
            className="min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
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
            className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-amber font-mono shadow-sm"
          />

          <button
            type="submit"
            disabled={isSubmitting || !newRuleText.trim()}
            className="apple-press min-h-[44px] px-5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 hover:text-slate-900 text-xs font-mono transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
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
    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2.5 transition-all shadow-sm">
      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <select 
            value={category} 
            aria-label="Rule category"
            onChange={(event) => setCategory(event.target.value as RuleItem["category"])} 
            className="min-h-[44px] rounded-xl bg-white border border-slate-200 px-3 text-xs text-slate-900 font-mono shadow-sm"
          >
            {["hook", "pacing", "vocabulary", "structure", "tone"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <input 
            value={text} 
            aria-label="Rule text"
            onChange={(event) => setText(event.target.value)} 
            className="flex-1 min-h-[44px] rounded-xl bg-white border border-slate-200 px-3 text-xs text-slate-900 font-mono shadow-sm" 
          />
          <button 
            type="button"
            disabled={saving || text.trim().length < 5} 
            onClick={() => void saveEditedRule()} 
            aria-label="Save and approve rule"
            className="apple-press min-h-[44px] min-w-[44px] rounded-xl border border-brand-emerald/40 text-brand-emerald hover:bg-brand-emerald/10 flex items-center justify-center transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 mr-2 border border-slate-200 font-semibold">
              {rule.category}
            </span>
            <span className="text-slate-900 font-mono break-words">{rule.ruleText}</span>
            {rule.rationale && (
              <span className="block text-[11px] text-slate-500 mt-1">{rule.rationale}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button 
              type="button"
              onClick={() => setEditing(true)} 
              title="Edit before approving" 
              aria-label="Edit rule before approving"
              className="apple-press min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-brand-amber hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => void approveStyleRuleAction(rule.id)} 
              title="Approve" 
              aria-label="Approve style rule"
              className="apple-press min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-brand-emerald hover:bg-brand-emerald/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => void rejectStyleRuleAction(rule.id)} 
              title="Dismiss" 
              aria-label="Dismiss style rule"
              className="apple-press min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-rose hover:bg-brand-rose/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-rose"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
