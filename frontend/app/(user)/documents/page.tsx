"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { PageEnter } from "@/components/page-enter";
import { PaginationControls } from "@/components/pagination-controls";
import { StatusChip } from "@/components/status-chip";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, Paginated } from "@/lib/api/types";

const PAGE_SIZE = 20;

export default function MyDocumentsPage() {
  const [page, setPage] = useState(1);
  const docs = useQuery({
    queryKey: queryKeys.documents.mine(page, PAGE_SIZE),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/my", {
          params: { page, page_size: PAGE_SIZE },
        })
      ).data,
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (d) => d.status === "processing" || d.status === "uploaded",
      )
        ? 3000
        : false,
  });

  const items = docs.data?.items ?? [];

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">My documents</h1>
      <p className="mt-2 text-ink/60">Track status and open items that need review.</p>
      <div className="mt-8 space-y-2 rounded-xl border border-ink/10 bg-white/70 p-4">
        {docs.isLoading && <p className="text-sm text-ink/50">Loading…</p>}
        {items.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-ink/5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{doc.original_filename}</p>
              <p className="text-xs text-ink/50">
                {doc.document_type ?? "Unknown type"}
                {doc.confidence_score != null
                  ? ` · ${(doc.confidence_score * 100).toFixed(0)}%`
                  : ""}
              </p>
            </div>
            <StatusChip status={doc.status} />
          </Link>
        ))}
        {!docs.isLoading && items.length === 0 && (
          <p className="text-sm text-ink/50">No documents yet.</p>
        )}
      </div>
      <PaginationControls
        page={page}
        pages={docs.data?.pages ?? 0}
        onPageChange={setPage}
      />
    </PageEnter>
  );
}
