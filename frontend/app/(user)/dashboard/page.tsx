"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, Notification, Paginated } from "@/lib/api/types";
import { formatConfidence, isLowConfidence } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/session";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const docs = useQuery({
    queryKey: queryKeys.documents.mine(1, 5),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/my", {
          params: { page: 1, page_size: 5 },
        })
      ).data,
  });
  const notifs = useQuery({
    queryKey: queryKeys.notifications.list(1, 20),
    queryFn: async () =>
      (
        await api.get<Paginated<Notification>>("/notifications/", {
          params: { page: 1, page_size: 20 },
        })
      ).data,
  });

  const recent = docs.data?.items ?? [];
  const unread = (notifs.data?.items ?? []).filter((n) => !n.is_read).length;

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
          <Button asChild variant="ghost">
            <Link href="/documents">All documents</Link>
          </Button>
        </div>
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink/50">
            Recent documents
          </h2>
          <div className="space-y-2 rounded-xl border border-ink/10 bg-white/70 p-4">
            {docs.isLoading && <p className="text-sm text-ink/50">Loading…</p>}
            {!docs.isLoading && recent.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm text-ink/50">No documents yet.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/upload">Upload your first document</Link>
                </Button>
              </div>
            )}
            {recent.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-ink/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{doc.original_filename}</p>
                  <p className="text-xs text-ink/50">
                    {doc.document_type ?? "Unknown"}
                    {doc.confidence_score != null
                      ? ` · ${formatConfidence(doc.confidence_score)}`
                      : ""}
                    {isLowConfidence(doc) ? " · uncertain" : ""}
                  </p>
                </div>
                <StatusChip status={doc.status} />
              </Link>
            ))}
          </div>
        </section>
      </motion.div>
    </PageEnter>
  );
}
