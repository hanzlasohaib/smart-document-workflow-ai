import { PageEnter } from "@/components/page-enter";

export default function PricingPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:px-10 md:py-16">
        <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] tracking-[-0.03em]">Pricing</h1>
        <p className="prose-measure mt-4 text-pretty text-ink-muted">
          MVP pricing is intentionally thin. Contact your operator for staging access; public
          signup creates a standard user account.
        </p>
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-2xl tracking-[-0.03em]">Pilot</h2>
          <p className="prose-measure mt-2 text-ink-muted">
            Includes upload, review, notifications, and admin approval.
          </p>
        </div>
      </section>
    </PageEnter>
  );
}
