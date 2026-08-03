import Link from "next/link";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/preview", label: "Preview" },
];

export function MarketingNav() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-6 px-6 py-5 md:px-10">
      <Link href="/" className="font-display text-xl tracking-tight text-ink md:text-2xl">
        Smart Document Workflow
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    </header>
  );
}
