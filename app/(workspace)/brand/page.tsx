import { BrainCircuit, Check, Shield, Plus, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BrandBrainPage() {
  const profile = db.select().from(brandProfiles).limit(1).get();
  const activeRules = db
    .select()
    .from(styleRules)
    .where(eq(styleRules.status, "active"))
    .all();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Brand Brain</h1>
          <p className="text-sm text-slate-400 mt-1">
            Persistent persona guidelines and learned style rules injected into Gemini prompts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Profile Card */}
        <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-brand-amber" />
              Creator Identity
            </h2>
            <span className={`text-xs font-mono ${profile ? "text-brand-emerald" : "text-slate-500"}`}>
              {profile ? "Synced" : "Not configured"}
            </span>
          </div>

          {profile ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-mono">CREATOR NAME</span>
                <span className="text-slate-200">{profile.creatorName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">NICHE & TOPICS</span>
                <span className="text-slate-200">{profile.niche}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">LANGUAGE MIX</span>
                <span className="text-slate-200">{profile.languageMix}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">TONE</span>
                <span className="text-slate-200">{profile.toneOfVoice}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-surface-subtle/50 border border-border-subtle text-center space-y-2">
              <p className="text-xs text-slate-400">
                No brand profile configured yet. Set up your identity, language mix, and tone to seed Google Gemini.
              </p>
            </div>
          )}
        </div>

        {/* Active Style Rules Card */}
        <div className="p-6 rounded-xl border border-border-subtle bg-surface-raised space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-amber" />
              Active Style Rules
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {activeRules.length > 0 ? `${activeRules.length} Injected` : "0 Injected"}
            </span>
          </div>

          {activeRules.length > 0 ? (
            <div className="space-y-2">
              {activeRules.map((rule) => (
                <div key={rule.id} className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-emerald mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-200 font-mono">{rule.ruleText}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-surface-subtle/50 border border-border-subtle text-center space-y-2">
              <p className="text-xs text-slate-400">
                No active style rules yet. As you edit script drafts, Agncy will synthesize your style patterns and propose rules for you to approve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
