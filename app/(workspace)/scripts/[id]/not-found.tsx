import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function ScriptNotFound() {
  return (
    <div className="apple-glass-card p-12 text-center rounded-2xl space-y-4 max-w-md mx-auto mt-12 shadow-apple-card">
      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h2 className="text-base font-semibold text-slate-900 tracking-tight">Script Not Found</h2>
      <p className="text-xs text-slate-500">
        The script you are looking for does not exist or has been deleted.
      </p>
      <div className="pt-2">
        <Link
          href="/scripts"
          className="apple-press inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scripts</span>
        </Link>
      </div>
    </div>
  );
}
