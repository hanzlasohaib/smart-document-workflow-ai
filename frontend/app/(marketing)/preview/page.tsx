import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:px-10 md:py-16">
        <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] tracking-[-0.03em]">
          Dashboard preview
        </h1>
        <p className="prose-measure mt-4 text-pretty text-ink-muted">
          Illustrative only — live data appears after you log in.
        </p>
        <Surface className="mt-10 divide-y divide-border px-5">
          {[
            { name: "invoice-april.pdf", status: "processed" },
            { name: "resume-candidate.pdf", status: "needs_review" },
            { name: "contract-draft.pdf", status: "processing" },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-4 py-4">
              <span className="min-w-0 truncate font-medium">{row.name}</span>
              <StatusChip status={row.status} />
            </div>
          ))}
        </Surface>
        <Button asChild className="mt-8">
          <Link href="/login">Open your dashboard</Link>
        </Button>
      </section>
    </PageEnter>
  );
}
