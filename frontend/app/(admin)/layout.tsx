"use client";

import { LoadingScreen } from "@/components/loading-screen";
import { PortalShell } from "@/components/portal-shell";
import { useRequireAuth } from "@/lib/auth/session";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/documents", label: "All documents" },
  { href: "/admin/pending", label: "Pending approvals" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth({ role: "admin" });

  if (loading || !user || user.role !== "admin") {
    return <LoadingScreen />;
  }

  return (
    <PortalShell title="Admin portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
