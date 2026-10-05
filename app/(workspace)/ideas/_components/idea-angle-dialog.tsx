"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

interface IdeaAngleDialogProps {
  angle: string;
  error: string | null;
  isFinalizing: boolean;
  onAngleChange: (angle: string) => void;
  onClose: () => void;
  onFinalize: () => void;
  onTopicChange: (topic: string) => void;
  topic: string;
}

export function IdeaAngleDialog({
  angle,
  error,
  isFinalizing,
  onAngleChange,
  onClose,
  onFinalize,
  onTopicChange,
  topic,
}: IdeaAngleDialogProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  const finalizingRef = useRef(isFinalizing);

  useEffect(() => setMounted(true), []);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => { finalizingRef.current = isFinalizing; }, [isFinalizing]);
  useEffect(() => {
    if (!mounted) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !finalizingRef.current) closeRef.current();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [mounted]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onFinalize();
  }

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isFinalizing) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="idea-dialog-title" aria-describedby="idea-dialog-description" className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:p-7">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 id="idea-dialog-title" className="text-sm font-semibold text-slate-900">Review content idea</h2>
            <p id="idea-dialog-description" className="mt-1 text-xs leading-relaxed text-slate-500">Tweak the title and hook, then finalize it for the Script Writer.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isFinalizing} aria-label="Close idea editor" className="apple-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X className="h-4 w-4" /></button>
        </header>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-mono font-semibold tracking-wider text-slate-600">CONTENT TITLE / TOPIC</span>
            <input ref={titleInputRef} value={topic} onChange={(event) => onTopicChange(event.target.value)} maxLength={500} disabled={isFinalizing} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 focus:border-[#1f54fc] focus:outline-none focus:ring-2 focus:ring-[#1f54fc]/20 disabled:opacity-50" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] font-mono font-semibold tracking-wider text-slate-600">CONTENT ANGLE / HOOK</span>
            <textarea value={angle} onChange={(event) => onAngleChange(event.target.value)} maxLength={500} rows={6} disabled={isFinalizing} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-mono leading-relaxed text-slate-900 focus:border-[#1f54fc] focus:outline-none focus:ring-2 focus:ring-[#1f54fc]/20 disabled:opacity-50" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2 text-xs text-brand-rose">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} disabled={isFinalizing} className="apple-press min-h-[44px] rounded-xl px-4 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isFinalizing || topic.trim().length < 3 || angle.trim().length < 3} className="apple-btn-primary flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 text-xs disabled:opacity-50">
              {isFinalizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {isFinalizing ? "Finalizing..." : "Finalize Idea"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
