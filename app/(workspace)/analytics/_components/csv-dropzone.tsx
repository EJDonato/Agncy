"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CsvDropzone() {
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

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? "border-brand-amber bg-brand-amber/5"
            : "border-border-subtle bg-surface-raised hover:border-border-strong hover:bg-surface-raised/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileUpload(files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-subtle border border-border-strong flex items-center justify-center text-brand-amber">
              <UploadCloud className="w-5 h-5" />
            </div>
          )}

          <div>
            <span className="text-sm font-semibold text-slate-200 block">
              {isUploading ? "Parsing & Ingesting Meta CSV..." : "Drop Meta Business Suite CSV export here"}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Click to browse or drop `Content_Publish_time_Summary_*.csv`
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-500">
            <span>• Strips BOM</span>
            <span>• Normalizes Unicode Bold</span>
            <span>• Snapshots Lifetime Views</span>
          </div>
        </div>
      </div>

      {/* Result Notification Banner */}
      {result && (
        <div
          className={`p-4 rounded-lg text-xs font-mono flex items-start gap-3 border ${
            result.success
              ? "bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald"
              : "bg-brand-rose/10 border-brand-rose/30 text-brand-rose"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{result.message}</div>
          <button
            onClick={() => setResult(null)}
            className="text-slate-400 hover:text-slate-200 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
