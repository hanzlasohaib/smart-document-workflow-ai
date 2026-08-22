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
  const label = labelFor(status);

  return (
    <Badge variant={variant} aria-label={`Status: ${label}`}>
      {label}
    </Badge>
  );
}
