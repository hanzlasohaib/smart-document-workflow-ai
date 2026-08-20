import { PageEnter } from "@/components/page-enter";

export default function AboutPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:px-10 md:py-16">
        <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] tracking-[-0.03em]">About</h1>
        <p className="prose-measure mt-4 text-pretty text-lg text-ink-muted">
          Smart Document Workflow AI helps teams move documents through extraction and human
          checkpoints with clear ownership and server-enforced roles.
        </p>
      </section>
    </PageEnter>
  );
}
