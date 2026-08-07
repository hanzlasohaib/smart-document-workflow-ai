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
      className={cn(
        "rounded-xl border border-amber-700/25 bg-amber-50 px-4 py-3 text-sm text-amber-950",
        className,
      )}
    >
      <p className="font-medium">Classification uncertain</p>
      <p className="mt-1 text-amber-950/80">
        Confidence is below the review threshold. Verify the extracted fields
        {onDeleteHint ? ", or delete this document if it was uploaded by mistake" : ""}.
      </p>
    </div>
  );
}
