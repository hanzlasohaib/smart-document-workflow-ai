"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { OfflineBanner } from "@/components/offline-banner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

function activeHref(pathname: string, nav: NavItem[]): string | null {
  const matches = nav.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b)).href;
}

export function PortalShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const current = activeHref(pathname, nav);

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-4 py-6 md:px-8 md:py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-subtle">{title}</p>
            <p className="truncate text-sm text-ink-muted" title={user?.email}>
              {user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
          >
            Log out
          </Button>
        </header>
        <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Portal"
            className="flex flex-row flex-wrap gap-1 rounded-xl border border-border bg-surface p-2 shadow-surface md:sticky md:top-6 md:flex-col md:self-start"
          >
            {nav.map((item) => {
              const active = current === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out",
                    active
                      ? "bg-ink text-paper"
                      : "text-ink-muted hover:bg-ink/[0.04] hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <main id="main-content" className="min-w-0 pb-10" tabIndex={-1}>
            <OfflineBanner />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
