"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { PageEnter } from "@/components/page-enter";
import { PaginationControls } from "@/components/pagination-controls";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, Paginated } from "@/lib/api/types";
import { formatConfidence, isLowConfidence } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function MyDocumentsPage() {
  const queryClient = useQueryClient();
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

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not delete")),
  });

  const items = docs.data?.items ?? [];

  return (
    <PageEnter>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">My documents</h1>
          <p className="mt-2 text-ink/60">Track status and open items that need review.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/upload">Upload</Link>
        </Button>
      </div>
      <div className="mt-8 space-y-2 rounded-xl border border-ink/10 bg-white/70 p-4">
        {docs.isLoading && <p className="text-sm text-ink/50">Loading…</p>}
        {items.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-ink/5"
          >
            <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{doc.original_filename}</p>
              <p className="text-xs text-ink/50">
                {doc.document_type ?? "Unknown type"}
                {doc.confidence_score != null
                  ? ` · ${formatConfidence(doc.confidence_score)}`
                  : ""}
                {isLowConfidence(doc) ? " · uncertain" : ""}
              </p>
            </Link>
            <div className="flex items-center gap-2">
              <StatusChip status={doc.status} />
              <Button
                size="sm"
                variant="outline"
                disabled={remove.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete “${doc.original_filename}”? This cannot be undone.`,
                    )
                  ) {
                    remove.mutate(doc.id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {!docs.isLoading && items.length === 0 && (
          <div className="px-2 py-8 text-center">
            <p className="text-sm text-ink/50">No documents yet.</p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/upload">Upload your first document</Link>
            </Button>
          </div>
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
