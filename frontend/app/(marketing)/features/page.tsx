import { PageEnter } from "@/components/page-enter";

const features = [
  {
    title: "Guided intake",
    body: "Submit files and track processing status without leaving the portal.",
  },
  {
    title: "Field review",
    body: "Verify extracted values before workflows proceed.",
  },
  {
    title: "Admin approvals",
    body: "Pending queue with approve and reject decisions.",
  },
];

export default function FeaturesPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:px-10 md:py-16">
        <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] tracking-[-0.03em]">Features</h1>
        <p className="prose-measure mt-4 text-pretty text-ink-muted">
          One path from upload through OCR, classification, field extraction, human review, and
          admin approval.
        </p>
        <ul className="mt-12 space-y-10">
          {features.map((feature) => (
            <li key={feature.title} className="border-t border-border pt-6">
              <h2 className="font-display text-2xl tracking-[-0.03em] text-ink">{feature.title}</h2>
              <p className="prose-measure mt-2 text-ink-muted">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </PageEnter>
  );
}
