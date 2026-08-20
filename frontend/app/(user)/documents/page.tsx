"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
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
import { isBrowserOffline } from "@/lib/network";
import { apiErrorMessage } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function MyDocumentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Document | null>(null);

  const docs = useQuery({
    queryKey: queryKeys.documents.mine(page, PAGE_SIZE),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/my", {
          params: { page, page_size: PAGE_SIZE },
        })
      ).data,
    refetchInterval: (query) => {
      if (isBrowserOffline()) return false;
      return query.state.data?.items.some((d) => d.status === "processing" || d.status === "uploaded")
        ? 3000
        : false;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
      setPendingDelete(null);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not delete")),
  });

  const items = docs.data?.items ?? [];

  return (
    <PageEnter>
      <PageHeader title="My documents" description="Track status and open items that need review.">
        <Button asChild size="sm">
          <Link href="/upload">Upload</Link>
        </Button>
      </PageHeader>
      <Surface className="mt-8 divide-y divide-border">
        <QueryState
          isLoading={docs.isLoading}
          isError={docs.isError}
          error={docs.error}
          isEmpty={items.length === 0}
          onRetry={() => void docs.refetch()}
          empty={
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-ink-muted">No documents yet.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/upload">Upload your first document</Link>
              </Button>
            </div>
          }
        >
          {items.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-ink/[0.03]"
            >
              <Link href={`/documents/${doc.id}`} className="min-w-0 flex-1">
                <Filename name={doc.original_filename} className="font-medium" />
                <p className="text-sm text-ink-muted">
                  {doc.document_type ?? "Unknown type"}
                  {doc.confidence_score != null ? ` · ${formatConfidence(doc.confidence_score)}` : ""}
                  {isLowConfidence(doc) ? " · uncertain" : ""}
                </p>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={doc.status} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={remove.isPending}
                  onClick={() => setPendingDelete(doc)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </QueryState>
      </Surface>
      <PaginationControls page={page} pages={docs.data?.pages ?? 0} onPageChange={setPage} />
      <ConfirmDialog
        open={pendingDelete != null}
        title="Delete document"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.original_filename}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => {
          if (pendingDelete) remove.mutate(pendingDelete.id);
        }}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setPendingDelete(null);
        }}
      />
    </PageEnter>
  );
}
