"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

export default function PendingApprovalsPage() {
  const queryClient = useQueryClient();
  const pending = useQuery({
    queryKey: queryKeys.documents.pending,
    queryFn: async () => (await api.get<Document[]>("/documents/pending")).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      await api.post(`/documents/${id}/${action}`);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      toast.success(vars.action === "approve" ? "Approved" : "Rejected");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Decision failed")),
  });

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">Pending approvals</h1>
      <p className="mt-2 text-ink/60">Approve or reject documents awaiting a business decision.</p>
      <div className="mt-8 space-y-3">
        {(pending.data ?? []).map((doc) => (
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
        {!pending.isLoading && (pending.data?.length ?? 0) === 0 && (
          <p className="text-sm text-ink/50">No pending approvals.</p>
        )}
      </div>
    </PageEnter>
  );
}
