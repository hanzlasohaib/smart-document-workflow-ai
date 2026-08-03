import { PageEnter } from "@/components/page-enter";

export default function AboutPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <h1 className="font-display text-4xl tracking-tight">About</h1>
        <p className="mt-4 text-ink/70">
          Smart Document Workflow AI helps teams move documents through extraction and human
          checkpoints with clear ownership and server-enforced roles.
        </p>
      </section>
    </PageEnter>
  );
}
