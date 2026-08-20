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
import { apiErrorMessage } from "@/lib/utils";

const PAGE_SIZE = 20;

type Decision = { id: number; name: string; action: "approve" | "reject" };

export default function PendingApprovalsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState<Decision | null>(null);
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
      setDecision(null);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Decision failed")),
  });

  const items = pending.data?.items ?? [];

  return (
    <PageEnter>
      <PageHeader
        title="Pending approvals"
        description="Approve or reject documents awaiting a business decision."
      />
      <div className="mt-8 space-y-3">
        <QueryState
          isLoading={pending.isLoading}
          isError={pending.isError}
          error={pending.error}
          isEmpty={items.length === 0}
          onRetry={() => void pending.refetch()}
          empty={
            <Surface className="border-dashed px-4 py-10 text-center shadow-none">
              <p className="text-sm text-ink-muted">Queue is clear.</p>
              <Button asChild className="mt-4" size="sm" variant="outline">
                <Link href="/admin/documents">Browse all documents</Link>
              </Button>
            </Surface>
          }
        >
          {items.map((doc) => (
            <Surface key={doc.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link
                  href={`/admin/review/${doc.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  <Filename name={doc.original_filename} lines={2} />
                </Link>
                <p className="mt-1 text-sm text-ink-muted">
                  {doc.document_type ?? "Unknown"}
                  {doc.confidence_score != null ? ` · ${formatConfidence(doc.confidence_score)}` : ""}
                  {isLowConfidence(doc) ? " · uncertain" : ""}
                </p>
                <div className="mt-2">
                  <StatusChip status={doc.status} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    setDecision({ id: doc.id, name: doc.original_filename, action: "approve" })
                  }
                  disabled={decide.isPending}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setDecision({ id: doc.id, name: doc.original_filename, action: "reject" })
                  }
                  disabled={decide.isPending}
                >
                  Reject
                </Button>
              </div>
            </Surface>
          ))}
        </QueryState>
      </div>
      <PaginationControls page={page} pages={pending.data?.pages ?? 0} onPageChange={setPage} />
      <ConfirmDialog
        open={decision != null}
        title={decision?.action === "reject" ? "Reject document" : "Approve document"}
        description={
          decision
            ? `${decision.action === "reject" ? "Reject" : "Approve"} “${decision.name}”? This decision cannot be undone from here.`
            : ""
        }
        confirmLabel={decision?.action === "reject" ? "Reject" : "Approve"}
        danger={decision?.action === "reject"}
        busy={decide.isPending}
        onConfirm={() => {
          if (decision) decide.mutate({ id: decision.id, action: decision.action });
        }}
        onOpenChange={(open) => {
          if (!open && !decide.isPending) setDecision(null);
        }}
      />
    </PageEnter>
  );
}
