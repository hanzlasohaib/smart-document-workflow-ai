"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Filename } from "@/components/filename";
import { PageEnter } from "@/components/page-enter";
import { PageHeader } from "@/components/page-header";
import { QueryState } from "@/components/query-state";
import { StatusChip } from "@/components/status-chip";
import { Surface } from "@/components/surface";
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
      <div className="space-y-8">
        <PageHeader
          title={`Welcome, ${user?.name ?? "there"}`}
          description="Upload a document, check recent files, and open anything that needs review."
        />
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
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-subtle">
            Recent documents
          </h2>
          <Surface className="divide-y divide-border">
            <QueryState
              isLoading={docs.isLoading}
              isError={docs.isError}
              error={docs.error}
              isEmpty={recent.length === 0}
              onRetry={() => void docs.refetch()}
              empty={
                <EmptyState
                  action={
                    <Button asChild size="sm">
                      <Link href="/upload">Upload your first document</Link>
                    </Button>
                  }
                >
                  No documents yet.
                </EmptyState>
              }
            >
              {recent.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 py-4 hover:bg-ink/[0.03]"
                >
                  <div className="min-w-0">
                    <Filename name={doc.original_filename} className="font-medium" />
                    <p className="text-sm text-ink-muted">
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
            </QueryState>
          </Surface>
        </section>
      </div>
    </PageEnter>
  );
}
