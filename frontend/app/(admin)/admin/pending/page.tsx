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

export default function PendingApprovalsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pending = useQuery({
    queryKey: queryKeys.documents.pending(page, PAGE_SIZE),
    queryFn: async () =>
      (
        await api.get<Paginated<Document>>("/documents/pending", {
          params: { page, page_size: PAGE_SIZE },
        })
      ).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      await api.post(`/documents/${id}/${action}`);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["documents", "all"] });
      toast.success(vars.action === "approve" ? "Approved" : "Rejected");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Decision failed")),
  });

  const items = pending.data?.items ?? [];

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">Pending approvals</h1>
      <p className="mt-2 text-ink/60">Approve or reject documents awaiting a business decision.</p>
      <div className="mt-8 space-y-3">
        {items.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/70 p-4"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/review/${doc.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {doc.original_filename}
              </Link>
              <p className="mt-1 text-xs text-ink/50">
                {doc.document_type ?? "Unknown"}
                {doc.confidence_score != null
                  ? ` · ${formatConfidence(doc.confidence_score)}`
                  : ""}
                {isLowConfidence(doc) ? " · uncertain" : ""}
              </p>
              <div className="mt-1">
                <StatusChip status={doc.status} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => decide.mutate({ id: doc.id, action: "approve" })}
                disabled={decide.isPending}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => decide.mutate({ id: doc.id, action: "reject" })}
                disabled={decide.isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
        {!pending.isLoading && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink/15 bg-white/40 px-4 py-10 text-center">
            <p className="text-sm text-ink/50">Queue is clear.</p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href="/admin/documents">Browse all documents</Link>
            </Button>
          </div>
        )}
      </div>
      <PaginationControls
        page={page}
        pages={pending.data?.pages ?? 0}
        onPageChange={setPage}
      />
    </PageEnter>
  );
}
