import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <PageEnter>
      <section className="relative flex min-h-[calc(100vh-5.5rem)] flex-col justify-end overflow-hidden px-6 pb-16 pt-10 md:px-10 md:pb-24">
        <div
          className="absolute inset-0 -z-0 bg-[url('/hero-docs.svg')] bg-cover bg-center opacity-90"
          aria-hidden
        />
        <div className="absolute inset-0 -z-0 bg-gradient-to-t from-paper via-paper/80 to-transparent" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-7xl">
            Smart Document Workflow
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/70 md:text-xl">
            Capture documents, extract fields, and close the human review loop without losing
            control of approvals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Get started</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageEnter>
  );
}
