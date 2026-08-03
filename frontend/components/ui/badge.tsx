import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-ink/10 text-ink",
        accent: "bg-accent/25 text-ink",
        success: "bg-emerald-100 text-emerald-900",
        warn: "bg-amber-100 text-amber-950",
        danger: "bg-rose-100 text-rose-900",
        muted: "bg-slate-100 text-slate-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
