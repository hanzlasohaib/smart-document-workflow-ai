import { MarketingNav } from "@/components/marketing-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-atmosphere text-ink">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="relative">
        <MarketingNav />
        {children}
      </div>
    </div>
  );
}
