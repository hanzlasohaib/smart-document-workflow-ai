import { PageEnter } from "@/components/page-enter";

export default function PricingPage() {
  return (
    <PageEnter>
      <section className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <h1 className="font-display text-4xl tracking-tight">Pricing</h1>
        <p className="mt-4 text-ink/70">
          MVP pricing is intentionally thin. Contact your operator for staging access; public
          signup creates a standard user account.
        </p>
        <div className="mt-10 border-t border-ink/10 pt-8">
          <p className="font-display text-2xl">Pilot</p>
          <p className="mt-2 text-ink/70">Includes upload, review, notifications, and admin approval.</p>
        </div>
      </section>
    </PageEnter>
  );
}
