import { db } from "@/lib/db";
import { brandProfiles, styleRules } from "@/lib/db/schema";
import { BrandProfileForm } from "./_components/brand-profile-form";
import { StyleRulesManager } from "./_components/style-rules-manager";
import { PersonaCard } from "@/components/persona-card";

export const dynamic = "force-dynamic";

export default async function BrandBrainPage() {
  const profile = db.select().from(brandProfiles).limit(1).get() || null;
  const rules = db.select().from(styleRules).all();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Brand Brain</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your persistent creator context and verified style rules dynamically injected into Google Gemini.
        </p>
      </div>

      <PersonaCard persona="brandStrategist" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <BrandProfileForm initialData={profile} />
        <StyleRulesManager rules={rules} />
      </div>
    </div>
  );
}
