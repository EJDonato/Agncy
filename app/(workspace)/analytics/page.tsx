import { BarChart3, Upload, FileSpreadsheet } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Analytics & Meta CSV</h1>
          <p className="text-sm text-slate-400 mt-1">
            Import lifetime Meta Business Suite exports, snapshot retention metrics, and link posts to scripts.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-amber text-slate-950 font-semibold text-sm hover:bg-brand-amber/90 transition-colors shadow-sm">
          <Upload className="w-4 h-4" />
          <span>Import CSV</span>
        </button>
      </div>

      <div className="p-8 rounded-xl border border-border-subtle bg-surface-raised text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">No Analytics Data Imported</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Drop your Meta Business Suite export file (e.g. Jul-31-2026_Sep-29-2026_Content_Publish_time_Summary.csv). Agncy handles BOM headers, strips Unicode bold fonts, and preserves snapshots.
        </p>
      </div>
    </div>
  );
}
