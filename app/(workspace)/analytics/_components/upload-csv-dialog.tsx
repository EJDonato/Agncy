"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadCloud, X } from "lucide-react";
import { CsvDropzone } from "./csv-dropzone";

export function UploadCsvDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }, [isClosing]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="apple-btn-primary min-h-[44px] flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] shrink-0"
      >
        <UploadCloud className="w-4 h-4" />
        <span>Upload New CSV</span>
      </button>

      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 md:left-64 ${
            isClosing ? "apple-backdrop-out" : "apple-backdrop-in"
          }`}
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-csv-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)] space-y-5 ${
              isClosing ? "apple-modal-out" : "apple-modal-in"
            }`}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3.5">
              <div>
                <h2
                  id="upload-csv-dialog-title"
                  className="font-semibold text-slate-900 flex items-center gap-2.5 text-sm tracking-tight"
                >
                  <UploadCloud className="w-4 h-4 text-[#1f54fc] shrink-0" />
                  <span>Upload Meta Business Suite CSV</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Import lifetime snapshots to index post metrics for the Brand Brain.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="apple-press min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f54fc] -mr-2 -mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CsvDropzone />

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                className="apple-press min-h-[44px] px-5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
