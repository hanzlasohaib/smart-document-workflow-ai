import { cn } from "@/lib/utils";

export function LowConfidenceCallout({
  className,
  onDeleteHint = true,
}: {
  className?: string;
  onDeleteHint?: boolean;
}) {
  return (
    <div
      role="status"
      className={cn("rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-sm text-warn", className)}
    >
      <p className="font-medium">Classification uncertain</p>
      <p className="mt-1 text-warn/90">
        Confidence is below the review threshold. Verify the extracted fields
        {onDeleteHint ? ", or delete this document if it was uploaded by mistake" : ""}.
      </p>
    </div>
  );
}
