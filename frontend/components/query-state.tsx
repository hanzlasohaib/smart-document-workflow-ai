"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useDelayedFlag } from "@/lib/use-delayed-flag";
import { apiErrorMessage } from "@/lib/utils";

export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  loadingLabel = "Loading…",
  empty,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingLabel?: string;
  empty?: ReactNode;
  children: ReactNode;
}) {
  const slow = useDelayedFlag(isLoading);

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center" role="status" aria-live="polite">
        <p className="text-sm text-ink-muted">{loadingLabel}</p>
        {slow ? (
          <p className="mt-2 text-sm text-ink-subtle">
            This is taking longer than usual. Check your connection if it continues.
          </p>
        ) : null}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-8 text-center" role="alert">
        <p className="text-sm text-ink-muted">{apiErrorMessage(error, "Could not load this page.")}</p>
        {onRetry ? (
          <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return <>{empty}</>;
  }

  return <>{children}</>;
}
