export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-atmosphere text-ink">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
