interface ScriptEditorPaneProps {
  content: string;
  disabled: boolean;
  onChange: (content: string) => void;
}

export function ScriptEditorPane({ content, disabled, onChange }: ScriptEditorPaneProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-apple-card backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-xs font-mono">
        <span className="font-semibold tracking-wider text-slate-700">SCRIPT</span>
        <span className="text-slate-500">{wordCount} words</span>
      </div>
      <textarea
        value={content}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label="Editable script draft"
        spellCheck={false}
        className="min-h-[520px] w-full resize-y bg-white p-5 text-xs leading-relaxed text-slate-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#1f54fc]/50 disabled:opacity-60 sm:min-h-[640px] sm:p-6 sm:text-sm font-mono"
      />
    </section>
  );
}
