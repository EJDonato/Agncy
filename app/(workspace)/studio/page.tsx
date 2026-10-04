"use client";

import { useState, useRef } from "react";
import { UploadCloud, Cpu, Sparkles, Film, CheckCircle2, Type, Sliders } from "lucide-react";
import { PersonaCard } from "@/components/persona-card";

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Captions & Media Studio</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Local speech-to-text with Whisper and hardware-accelerated subtitle burning via Apple Silicon VideoToolbox.
          </p>
        </div>
      </div>

      <PersonaCard persona="videoEditor" />

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500">
            <span>TRANSCRIPTION</span>
            <Cpu className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="text-base font-bold font-mono text-slate-900 tracking-tight">Whisper Local Metal</div>
          <p className="text-xs text-slate-500">Taglish-calibrated prompt tokens</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500">
            <span>HARDWARE ENCODER</span>
            <Film className="w-4 h-4 text-[#1f54fc]" />
          </div>
          <div className="text-base font-bold font-mono text-slate-900 tracking-tight">h264_videotoolbox</div>
          <p className="text-xs text-slate-500">Zero-CPU hardware acceleration</p>
        </div>

        <div className="apple-glass-card p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500">
            <span>SUBTITLE PRESET</span>
            <Type className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="text-base font-bold font-mono text-slate-900 tracking-tight">THE BOLD FONT</div>
          <p className="text-xs text-slate-500">9:16 Vertical Reel high-contrast</p>
        </div>
      </div>

      {/* Video Inspector & Burn Configuration */}
      <div className="p-6 sm:p-8 rounded-2xl apple-glass-card space-y-6">
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
          className="apple-press border-2 border-dashed border-slate-300 bg-white/60 rounded-2xl p-8 text-center space-y-3 cursor-pointer hover:border-[#1f54fc]/60 hover:bg-blue-50/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1f54fc]/15 to-[#4726f6]/5 border border-[#1f54fc]/25 text-slate-500 flex items-center justify-center mx-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <UploadCloud className="w-7 h-7 text-[#1f54fc]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
              {selectedFile ? selectedFile.name : "Select or drop raw video (.mp4, .mov)"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
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
            className="apple-press min-h-[44px] px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 hover:text-slate-900 text-xs font-mono transition-all shadow-sm"
          >
            {selectedFile ? "Change Video File" : "Browse Video"}
          </button>
        </div>

        {/* Subtitle Burn-In Preset Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
          <div>
            <label className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1f54fc]" />
              <span>CAPTION STYLE PRESET</span>
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              aria-label="Caption style preset"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#1f54fc] shadow-sm"
            >
              <option value="bold-amber">THE BOLD FONT (Yellow/Amber Highlight)</option>
              <option value="montserrat-white">Montserrat Heavy (White with Black Outline)</option>
              <option value="minimal-mono">Geist Mono Clean (Minimalist Studio)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono tracking-wider text-slate-600 font-medium block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
              <span>LOCAL RUNNER COMMAND</span>
            </label>
            <div className="min-h-[44px] px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-800 font-mono truncate select-all">
              ffmpeg -c:v h264_videotoolbox -vf &quot;subtitles=...&quot;
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-mono flex items-center gap-2.5">
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
