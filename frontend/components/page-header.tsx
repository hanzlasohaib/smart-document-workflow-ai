import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-2xl">
        <h1 className="break-words [overflow-wrap:anywhere] font-display text-[1.75rem] leading-[1.15] tracking-[-0.03em] text-ink md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-pretty break-words [overflow-wrap:anywhere] text-base text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
