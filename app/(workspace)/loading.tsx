export default function WorkspaceLoading() {
  return (
    <div
      className="space-y-6 animate-pulse"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-surface-subtle" />
          <div className="h-3 w-72 max-w-[70vw] rounded bg-surface-subtle" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-surface-subtle" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl border border-border-subtle bg-surface-raised"
          />
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-border-subtle bg-surface-raised p-4">
        <div className="h-5 w-40 rounded bg-surface-subtle" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-16 rounded-lg bg-surface-subtle" />
        ))}
      </div>
      <span className="sr-only">Loading destination page…</span>
    </div>
  );
}
