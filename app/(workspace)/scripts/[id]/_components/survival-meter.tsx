"use client";

import { Activity, Clock } from "lucide-react";

interface SurvivalMeterProps {
  survivalPercentage: number;
  draftWordCount: number;
  finalWordCount: number;
  retainedWordCount: number;
}

export function SurvivalMeter({
  survivalPercentage,
  draftWordCount,
  finalWordCount,
  retainedWordCount,
}: SurvivalMeterProps) {
  const estSeconds = Math.round(finalWordCount / 2.3);

  const getMeterColor = (val: number) => {
    if (val >= 70) return "bg-brand-emerald text-brand-emerald border-brand-emerald/30";
    if (val >= 45) return "bg-brand-amber text-brand-amber border-brand-amber/30";
    return "bg-brand-rose text-brand-rose border-brand-rose/30";
  };

  const meterColor = getMeterColor(survivalPercentage);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border border-border-subtle bg-surface-subtle text-xs font-mono">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-brand-amber" />
          <span className="text-slate-400">SURVIVAL:</span>
          <span className="font-bold text-slate-100">{survivalPercentage}%</span>
        </div>

        <div className="w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden border border-border-subtle">
          <div
            className={`h-full transition-all duration-300 ${meterColor.split(" ")[0]}`}
            style={{ width: `${Math.min(100, Math.max(0, survivalPercentage))}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div>
          <span>Retained: </span>
          <span className="text-slate-200 font-semibold">{retainedWordCount}</span>
          <span className="text-slate-500"> / {draftWordCount} w</span>
        </div>

        <div>
          <span>Final: </span>
          <span className="text-slate-200 font-semibold">{finalWordCount} w</span>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-brand-amber" />
          <span>~{estSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
