"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CsvDropzoneProps {
  onUploadSuccess?: () => void;
}

export function CsvDropzone({ onUploadSuccess }: CsvDropzoneProps = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setResult({ success: false, message: "Please select a valid .csv export file." });
      return;
    }

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/analytics/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: data.message });
        router.refresh();
        onUploadSuccess?.();
      } else {
        setResult({ success: false, message: data.error || "Failed to import CSV." });
      }
    } catch {
      setResult({ success: false, message: "Network or server error during CSV upload." });
    } finally {
      setIsUploading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload Meta Business Suite CSV export file"
        onKeyDown={handleKeyDown}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`apple-press p-6 sm:p-9 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-amber ${
          isDragging
            ? "border-brand-amber/80 bg-brand-amber/10 shadow-[0_0_24px_rgba(31,84,252,0.2)]"
            : "border-slate-300 bg-white/70 backdrop-blur-xl hover:border-brand-amber/60 hover:bg-blue-50/20 shadow-apple-card"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          aria-hidden="true"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileUpload(files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3.5">
          {isUploading ? (
            <Loader2 className="w-9 h-9 text-brand-amber animate-spin" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-brand-amber/20 to-brand-amber/5 border border-brand-amber/30 flex items-center justify-center text-brand-amber shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
              <UploadCloud className="w-7 h-7" />
            </div>
          )}

          <div>
            <span className="text-sm font-semibold text-slate-900 block tracking-tight">
              {isUploading ? "Parsing & Ingesting Meta CSV..." : "Drop Meta Business Suite CSV export here"}
            </span>
            <span className="text-xs text-slate-500 mt-1 block font-mono">
              Tap to browse or drop `Content_Publish_time_Summary_*.csv`
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="apple-press min-h-[44px] px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 hover:text-slate-900 text-xs font-mono transition-all shadow-sm"
          >
            Browse CSV File
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
            <span>• Strips BOM</span>
            <span>• Normalizes Unicode Bold</span>
            <span>• Snapshots Lifetime Views</span>
          </div>
        </div>
      </div>

      {/* Result Notification Banner */}
      {result && (
        <div
          role={result.success ? "status" : "alert"}
          aria-live="polite"
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-3 border ${
            result.success
              ? "bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald"
              : "bg-brand-rose/10 border-brand-rose/30 text-brand-rose"
          }`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 break-words">{result.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setResult(null)}
            aria-label="Dismiss upload notification"
            className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-xl shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
