import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function ScriptNotFound() {
  return (
    <div className="p-12 text-center rounded-xl border border-border-subtle bg-surface-raised space-y-4 max-w-md mx-auto mt-12">
      <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border-subtle text-slate-400 flex items-center justify-center mx-auto">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h2 className="text-base font-semibold text-slate-100">Script Not Found</h2>
      <p className="text-xs text-slate-400">
        The script you are looking for does not exist or has been deleted.
      </p>
      <div className="pt-2">
        <Link
          href="/scripts"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-subtle border border-border-subtle text-xs font-mono text-slate-200 hover:text-brand-amber transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scripts</span>
        </Link>
      </div>
    </div>
  );
}
