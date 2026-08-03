"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, Notification } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const docs = useQuery({
    queryKey: queryKeys.documents.mine,
    queryFn: async () => (await api.get<Document[]>("/documents/my")).data,
  });
  const notifs = useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: async () => (await api.get<Notification[]>("/notifications/")).data,
  });

  const recent = (docs.data ?? []).slice(0, 5);
  const unread = (notifs.data ?? []).filter((n) => !n.is_read).length;

  return (
    <PageEnter>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display text-3xl tracking-tight">Welcome, {user?.name}</h1>
          <p className="mt-2 text-ink/60">Your documents and recent activity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/upload">Upload a document</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/notifications">
              Notifications{unread ? ` (${unread} unread)` : ""}
            </Link>
          </Button>
        </div>
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink/50">
            Recent documents
          </h2>
          <div className="space-y-2 rounded-xl border border-ink/10 bg-white/70 p-4">
            {docs.isLoading && <p className="text-sm text-ink/50">Loading…</p>}
            {!docs.isLoading && recent.length === 0 && (
              <p className="text-sm text-ink/50">No documents yet.</p>
            )}
            {recent.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-ink/5"
              >
                <span className="truncate">{doc.original_filename}</span>
                <StatusChip status={doc.status} />
              </Link>
            ))}
          </div>
        </section>
      </motion.div>
    </PageEnter>
  );
}
