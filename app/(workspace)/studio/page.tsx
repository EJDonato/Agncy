import { Video, UploadCloud, Cpu, Sparkles } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Captions & Media Studio</h1>
          <p className="text-sm text-slate-400 mt-1">
            Local speech-to-text with Whisper and hardware-accelerated subtitle burning via VideoToolbox.
          </p>
        </div>
      </div>

      <div className="p-10 rounded-xl border border-dashed border-border-strong bg-surface-raised text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-surface-subtle border border-border-strong text-slate-400 flex items-center justify-center mx-auto">
          <UploadCloud className="w-7 h-7 text-brand-amber" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-200">Drop your raw video here</h2>
          <p className="text-xs text-slate-400 mt-1">Supports .mp4 and .mov files up to any size on your local disk.</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas border border-border-subtle">
            <Cpu className="w-3.5 h-3.5 text-brand-emerald" />
            Apple Silicon Metal Engine
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas border border-border-subtle">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            Taglish Prompt Optimized
          </span>
        </div>
      </div>
    </div>
  );
}
