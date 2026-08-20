"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Filename } from "@/components/filename";
import { PageEnter } from "@/components/page-enter";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/pagination-controls";
import { QueryState } from "@/components/query-state";
import { StatusChip } from "@/components/status-chip";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, Paginated } from "@/lib/api/types";
import { formatConfidence, isLowConfidence } from "@/lib/api/types";

const PAGE_SIZE = 20;

function DocumentMeta({ doc }: { doc: Document }) {
  return (
    <>
      {doc.document_type ?? "—"}
      {doc.confidence_score != null ? ` · ${formatConfidence(doc.confidence_score)}` : ""}
      {isLowConfidence(doc) ? " · uncertain" : ""}
    </>
  );
}

export default function AdminDocumentsPage() {
  const [page, setPage] = useState(1);
  const docs = useQuery({
    queryKey: queryKeys.documents.all(page, PAGE_SIZE),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/", {
          params: { page, page_size: PAGE_SIZE },
        })
      ).data,
  });

  const items = docs.data?.items ?? [];
  const empty = (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-ink-muted">No documents.</p>
      <Button asChild className="mt-4" size="sm" variant="outline">
        <Link href="/admin/pending">Check pending queue</Link>
      </Button>
    </div>
  );

  return (
    <PageEnter>
      <PageHeader title="All documents" description="Cross-user document list.">
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/pending">Pending queue</Link>
        </Button>
      </PageHeader>

      <div className="mt-8 space-y-3 md:hidden">
        <QueryState
          isLoading={docs.isLoading}
          isError={docs.isError}
          error={docs.error}
          isEmpty={items.length === 0}
          onRetry={() => void docs.refetch()}
          empty={<Surface className="border-dashed shadow-none">{empty}</Surface>}
        >
          {items.map((doc) => (
            <Surface key={doc.id} className="p-4">
              <Link
                href={`/admin/review/${doc.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                <Filename name={doc.original_filename} lines={2} />
              </Link>
              <p className="mt-1 text-sm text-ink-muted">
                #{doc.id} · <DocumentMeta doc={doc} />
              </p>
              <div className="mt-3">
                <StatusChip status={doc.status} />
              </div>
            </Surface>
          ))}
        </QueryState>
      </div>

      <Surface className="mt-8 hidden overflow-x-auto md:block">
        <QueryState
          isLoading={docs.isLoading}
          isError={docs.isError}
          error={docs.error}
          isEmpty={items.length === 0}
          onRetry={() => void docs.refetch()}
          empty={empty}
        >
          <table className="w-full min-w-0 text-start text-sm">
            <thead className="border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => (
                <tr key={doc.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3 tabular-nums">{doc.id}</td>
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      href={`/admin/review/${doc.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      <Filename name={doc.original_filename} />
                    </Link>
                  </td>
                  <td className="px-4 py-3">{doc.document_type ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatConfidence(doc.confidence_score)}
                    {isLowConfidence(doc) ? " · uncertain" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={doc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </QueryState>
      </Surface>
      <PaginationControls page={page} pages={docs.data?.pages ?? 0} onPageChange={setPage} />
    </PageEnter>
  );
}
