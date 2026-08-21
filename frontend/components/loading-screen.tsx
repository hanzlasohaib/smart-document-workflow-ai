export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-paper px-4">
      <p className="text-ink-muted" role="status" aria-live="polite">
        {label}
      </p>
    </div>
  );
}
