"use client";

import { useOnline } from "@/lib/use-online";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      className="mb-6 rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-sm text-warn"
    >
      You are offline. Loaded pages stay available; uploads and decisions will fail until you
      reconnect.
    </div>
  );
}
