import { PageEnter } from "@/components/page-enter";

export default function FeaturesPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <h1 className="font-display text-4xl tracking-tight">Features</h1>
        <p className="mt-4 text-ink/70">
          One path from upload through OCR, classification, field extraction, human review, and
          admin approval.
        </p>
        <ul className="mt-10 space-y-6 text-ink/80">
          <li>
            <strong className="text-ink">Guided intake</strong> — submit files and track processing
            status without leaving the portal.
          </li>
          <li>
            <strong className="text-ink">Field review</strong> — verify extracted values before
            workflows proceed.
          </li>
          <li>
            <strong className="text-ink">Admin approvals</strong> — pending queue with approve and
            reject decisions.
          </li>
        </ul>
      </section>
    </PageEnter>
  );
}
