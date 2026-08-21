export function ListSkeleton({ rows = 5, label = "Loading…" }: { rows?: number; label?: string }) {
  return (
    <div className="divide-y divide-border" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 max-w-xs rounded-md bg-ink/[0.08] motion-safe:animate-pulse" />
            <div className="h-3 w-1/3 max-w-[8rem] rounded-md bg-ink/[0.06] motion-safe:animate-pulse" />
          </div>
          <div className="h-5 w-16 shrink-0 rounded-md bg-ink/[0.08] motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}
