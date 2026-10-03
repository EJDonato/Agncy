export default function WorkspaceLoading() {
  return (
    <div
      className="space-y-6 animate-pulse"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-slate-200/70" />
          <div className="h-3 w-72 max-w-[70vw] rounded-lg bg-slate-200/70" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-slate-200/70" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm"
          />
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
        <div className="h-5 w-40 rounded-lg bg-slate-200/70" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-16 rounded-xl bg-slate-100" />
        ))}
      </div>
      <span className="sr-only">Loading destination page…</span>
    </div>
  );
}
