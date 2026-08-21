import type { ReactNode } from "react";

export function EmptyState({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-pretty text-sm leading-[1.6] text-ink-muted">{children}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
