"use client";

import { PortalShell } from "@/components/portal-shell";
import { useRequireAuth } from "@/lib/auth/session";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/documents", label: "Documents" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink/60">
        Loading…
      </div>
    );
  }

  return (
    <PortalShell title="User portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
