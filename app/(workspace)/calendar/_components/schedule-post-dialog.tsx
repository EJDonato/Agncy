"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { createScheduleAction } from "@/lib/actions/schedules";
import type { ScriptListItem } from "@/lib/db/queries/scripts";

interface SchedulePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  scripts: ScriptListItem[];
}

export function SchedulePostDialog({
  isOpen,
  onClose,
  initialDate = "",
  initialTime = "19:00",
  scripts,
}: SchedulePostDialogProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [format, setFormat] = useState("Reel");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (initialDate) setDate(initialDate);
    if (initialTime) setTime(initialTime);
  }, [initialDate, initialTime]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isClosing) handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  function handleScriptSelect(scriptId: string) {
    setSelectedScriptId(scriptId);
    if (scriptId) {
      const found = scripts.find((s) => s.id === scriptId);
      if (found) {
        setCustomTitle(found.title);
        if (found.format) setFormat(found.format);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const titleToSave = customTitle.trim();
    if (!titleToSave) {
      setError("Please provide a title or choose a script.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createScheduleAction({
        scriptId: selectedScriptId || null,
        title: titleToSave,
        scheduledDate: date,
        scheduledTime: time,
        format,
        notes: notes.trim() || null,
      });
      handleClose();
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to schedule post";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 md:left-64 ${
        isClosing ? "apple-backdrop-out" : "apple-backdrop-in"
      }`}
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)] space-y-5 ${
          isClosing ? "apple-modal-out" : "apple-modal-in"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm tracking-tight">
            <Calendar className="w-4 h-4 text-[#1f54fc]" />
            <span>Plan Future Content Drop</span>
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Link Script Option */}
          {scripts.length > 0 && (
            <div>
              <label className="text-[11px] text-slate-600 block mb-1.5 font-medium tracking-wider">
                ASSIGN FROM EXISTING SCRIPT (OPTIONAL)
              </label>
              <select
                value={selectedScriptId}
                onChange={(e) => handleScriptSelect(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc] transition-all"
              >
                <option value="">-- Choose a script to schedule --</option>
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title or Custom Topic */}
          <div>
            <label className="text-[11px] text-slate-600 block mb-1.5 font-medium tracking-wider">
              POST TITLE OR ANGLE TOPIC
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. 3 Quick Fixes for Slow SQLite Queries"
              required
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc]"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 block mb-1.5 font-medium tracking-wider">
                SCHEDULED DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1.5 font-medium tracking-wider">
                DROP TIME (LOCAL)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc]"
              />
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-[11px] text-slate-600 block mb-1.5 font-medium tracking-wider">FORMAT</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc]"
            >
              <option value="Reel">Reel (9:16 Vertical Video)</option>
              <option value="Photo">Photo Post</option>
              <option value="Carousel">Carousel / Album</option>
              <option value="Video">Longer Form Video</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] text-slate-600 block mb-1.5 font-medium tracking-wider">
              PRODUCTION NOTES (OPTIONAL)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Needs b-roll of code editor on macbook"
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1f54fc]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-xs">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="apple-press min-h-[44px] px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="apple-btn-primary min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save to Content Calendar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
