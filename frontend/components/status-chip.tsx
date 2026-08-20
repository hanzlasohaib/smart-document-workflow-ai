"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  string,
  "default" | "accent" | "success" | "warn" | "danger" | "muted"
> = {
  uploaded: "muted",
  processing: "accent",
  processed: "success",
  needs_review: "warn",
  failed: "danger",
  pending: "warn",
  approved: "success",
  rejected: "danger",
};

function labelFor(status: string) {
  return status.replaceAll("_", " ");
}

export function StatusChip({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status] ?? "default";
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      key={status}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0.45 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="inline-flex"
    >
      <Badge variant={variant} aria-label={`Status: ${labelFor(status)}`}>
        {labelFor(status)}
      </Badge>
    </motion.span>
  );
}
