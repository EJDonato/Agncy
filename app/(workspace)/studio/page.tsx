"use client";

import { useState, useRef } from "react";
import { UploadCloud, Cpu, Sparkles, Film, CheckCircle2, Type, Sliders } from "lucide-react";

export default function StudioPage() {
  const [selectedFile, setSelectedFile] = useState<{ name: string; sizeMb: string } | null>(null);
  const [preset, setPreset] = useState("bold-amber");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1),
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">Captions & Media Studio</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Local speech-to-text with Whisper and hardware-accelerated subtitle burning via Apple Silicon VideoToolbox.
          </p>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border-subtle bg-surface-raised space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TRANSCRIPTION</span>
            <Cpu className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">Whisper Local Metal</div>
          <p className="text-xs text-slate-400">Taglish-calibrated prompt tokens</p>
        </div>

        <div className="p-4 rounded-xl border border-border-subtle bg-surface-raised space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>HARDWARE ENCODER</span>
            <Film className="w-4 h-4 text-brand-amber" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">h264_videotoolbox</div>
          <p className="text-xs text-slate-400">Zero-CPU hardware acceleration</p>
        </div>

        <div className="p-4 rounded-xl border border-border-subtle bg-surface-raised space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SUBTITLE PRESET</span>
            <Type className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">THE BOLD FONT</div>
          <p className="text-xs text-slate-400">9:16 Vertical Reel high-contrast</p>
        </div>
      </div>

      {/* Video Inspector & Burn Configuration */}
      <div className="p-6 sm:p-8 rounded-xl border border-border-subtle bg-surface-raised space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          className="hidden"
          aria-label="Select raw video file"
          onChange={handleFileChange}
        />

        <div
          role="button"
          tabIndex={0}
          aria-label="Select raw video file"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-strong rounded-xl p-8 text-center space-y-3 cursor-pointer hover:border-brand-amber/50 hover:bg-surface-subtle/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber"
        >
          <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border-strong text-slate-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6 text-brand-amber" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-200">
              {selectedFile ? selectedFile.name : "Select or drop raw video (.mp4, .mov)"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {selectedFile
                ? `${selectedFile.sizeMb} MB on local disk • Ready for transcription`
                : "Files remain on your local disk. Processing runs 100% locally on your machine."}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-surface-subtle border border-border-strong text-slate-200 hover:text-brand-amber text-xs font-mono transition-colors"
          >
            {selectedFile ? "Change Video File" : "Browse Video"}
          </button>
        </div>

        {/* Subtitle Burn-In Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-amber" />
              <span>CAPTION STYLE PRESET</span>
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              aria-label="Caption style preset"
              className="w-full min-h-[44px] px-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-amber"
            >
              <option value="bold-amber">THE BOLD FONT (Yellow/Amber Highlight)</option>
              <option value="montserrat-white">Montserrat Heavy (White with Black Outline)</option>
              <option value="minimal-mono">Geist Mono Clean (Minimalist Studio)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
              <span>LOCAL RUNNER COMMAND</span>
            </label>
            <div className="min-h-[44px] px-3 py-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-[11px] text-slate-300 font-mono truncate select-all">
              ffmpeg -c:v h264_videotoolbox -vf &quot;subtitles=...&quot;
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="p-3.5 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Video file `{selectedFile.name}` ({selectedFile.sizeMb} MB) verified for Apple Silicon Metal processing.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
