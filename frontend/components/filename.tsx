import { cn } from "@/lib/utils";

export function Filename({
  name,
  className,
  lines = 1,
}: {
  name: string;
  className?: string;
  lines?: 1 | 2 | 3;
}) {
  return (
    <span
      title={name}
      className={cn(
        "min-w-0 max-w-full break-all [overflow-wrap:anywhere]",
        lines === 1 && "block truncate",
        lines === 2 && "line-clamp-2",
        lines === 3 && "line-clamp-3",
        className,
      )}
    >
      {name}
    </span>
  );
}
