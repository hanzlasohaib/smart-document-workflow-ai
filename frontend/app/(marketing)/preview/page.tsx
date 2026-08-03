import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-4xl px-6 py-16 md:px-10">
        <h1 className="font-display text-4xl tracking-tight">Dashboard preview</h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          Illustrative only — live data appears after you log in.
        </p>
        <div className="mt-10 space-y-3 rounded-xl border border-ink/10 bg-white/70 p-6">
          {[
            { name: "invoice-april.pdf", status: "processed" },
            { name: "resume-candidate.pdf", status: "needs_review" },
            { name: "contract-draft.pdf", status: "processing" },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between gap-4 border-b border-ink/5 py-3 last:border-0"
            >
              <span>{row.name}</span>
              <StatusChip status={row.status} />
            </div>
          ))}
        </div>
        <Button asChild className="mt-8">
          <Link href="/login">Open your dashboard</Link>
        </Button>
      </section>
    </PageEnter>
  );
}
