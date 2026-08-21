import { OfflineBanner } from "@/components/offline-banner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-atmosphere text-ink">
      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex min-h-[100dvh] items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md">
          <OfflineBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
