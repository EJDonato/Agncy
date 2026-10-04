"use client";

import { Loader2, Save, X } from "lucide-react";
import { useEffect } from "react";

interface IdeaAngleDialogProps {
  angle: string;
  isSaving: boolean;
  onAngleChange: (angle: string) => void;
  onClose: () => void;
  onSave: () => void;
  topic: string;
  onTopicChange: (topic: string) => void;
}

export function IdeaAngleDialog({ angle, isSaving, onAngleChange, onClose, onSave, topic, onTopicChange }: IdeaAngleDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm md:left-64" onClick={() => !isSaving && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="angle-dialog-title" aria-describedby="angle-dialog-topic" onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:p-7">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div><h2 id="angle-dialog-title" className="text-sm font-semibold text-slate-900">Edit content idea</h2><p id="angle-dialog-topic" className="mt-1 text-xs leading-relaxed text-slate-500">Refine the title and angle before finalizing.</p></div>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Close angle editor" className="apple-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X className="h-4 w-4" /></button>
        </header>
        <div className="mt-5 space-y-4"><label className="block"><span className="mb-2 block text-[10px] font-mono font-semibold tracking-wider text-slate-600">CONTENT TITLE / TOPIC</span><input value={topic} onChange={(event) => onTopicChange(event.target.value)} maxLength={500} autoFocus disabled={isSaving} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 focus:border-[#1f54fc] focus:outline-none focus:ring-2 focus:ring-[#1f54fc]/20 disabled:opacity-50" /></label><label className="block"><span className="mb-2 block text-[10px] font-mono font-semibold tracking-wider text-slate-600">CONTENT ANGLE / HOOK</span><textarea value={angle} onChange={(event) => onAngleChange(event.target.value)} maxLength={500} rows={6} disabled={isSaving} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-mono leading-relaxed text-slate-900 focus:border-[#1f54fc] focus:outline-none focus:ring-2 focus:ring-[#1f54fc]/20 disabled:opacity-50" /></label></div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={onClose} disabled={isSaving} className="apple-press min-h-[44px] rounded-xl px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button><button type="button" onClick={onSave} disabled={isSaving || topic.trim().length < 3 || angle.trim().length < 3} className="apple-btn-primary flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 text-xs disabled:opacity-50">{isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{isSaving ? "Saving..." : "Save Idea"}</button></div>
      </div>
    </div>
  );
}
