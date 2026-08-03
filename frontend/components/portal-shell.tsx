"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

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

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <p className="font-display text-lg tracking-tight">{title}</p>
            <p className="text-sm text-ink/60">{user?.email}</p>
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
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-ink text-paper"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
