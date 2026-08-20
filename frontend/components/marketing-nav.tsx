"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/preview", label: "Preview" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-10 border-b border-transparent px-4 py-4 md:px-10 md:py-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="min-w-0 max-w-[11rem] font-display text-lg leading-tight tracking-[-0.03em] text-ink sm:max-w-none md:text-2xl"
        >
          Smart Document Workflow
        </Link>
        <nav aria-label="Marketing" className="hidden items-center gap-1 text-sm md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-ink-muted transition-colors hover:bg-ink/[0.04] hover:text-ink",
                  active && "bg-ink/[0.06] font-medium text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </Button>
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Marketing mobile"
          className="mt-3 grid gap-1 rounded-xl border border-border bg-surface p-2 shadow-surface md:hidden"
        >
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "min-h-11 rounded-md px-3 py-2 text-sm text-ink-muted",
                  active && "bg-ink text-paper",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="min-h-11 rounded-md px-3 py-2 text-sm text-ink-muted sm:hidden"
          >
            Log in
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
