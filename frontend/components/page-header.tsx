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
        <h1 className="break-words font-display text-[1.75rem] leading-[1.15] tracking-[-0.03em] text-ink [overflow-wrap:anywhere] md:text-[1.875rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-pretty break-words text-base leading-[1.6] text-ink-muted [overflow-wrap:anywhere]">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
