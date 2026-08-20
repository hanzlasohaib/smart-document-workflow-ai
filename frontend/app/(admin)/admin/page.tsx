"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Filename } from "@/components/filename";
import { PageEnter } from "@/components/page-enter";
import { PageHeader } from "@/components/page-header";
import { QueryState } from "@/components/query-state";
import { StatusChip } from "@/components/status-chip";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, Paginated } from "@/lib/api/types";

export default function AdminDashboardPage() {
  const pending = useQuery({
    queryKey: queryKeys.documents.pending(1, 5),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/pending", {
          params: { page: 1, page_size: 5 },
        })
      ).data,
  });
  const all = useQuery({
    queryKey: queryKeys.documents.all(1, 1),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/", {
          params: { page: 1, page_size: 1 },
        })
      ).data,
  });

  return (
    <PageEnter>
      <div className="space-y-8">
        <PageHeader
          title="Operations"
          description={`${pending.data?.total ?? 0} pending · ${all.data?.total ?? 0} total documents`}
        />
        <Button asChild>
          <Link href="/admin/pending">Open pending queue</Link>
        </Button>
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-subtle">
            Latest pending
          </h2>
          <Surface className="divide-y divide-border">
            <QueryState
              isLoading={pending.isLoading}
              isError={pending.isError}
              error={pending.error}
              isEmpty={(pending.data?.total ?? 0) === 0}
              onRetry={() => void pending.refetch()}
              empty={
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-ink-muted">Queue is clear.</p>
                  <Button asChild className="mt-4" size="sm" variant="outline">
                    <Link href="/admin/documents">Browse all documents</Link>
                  </Button>
                </div>
              }
            >
              {(pending.data?.items ?? []).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/admin/review/${doc.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-ink/[0.03]"
                >
                  <Filename name={doc.original_filename} className="font-medium" />
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
