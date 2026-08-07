"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { LowConfidenceCallout } from "@/components/low-confidence-callout";
import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, ExtractedField } from "@/lib/api/types";
import { formatConfidence, isLowConfidence } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

export default function AdminReviewPage() {
  const params = useParams<{ id: string }>();
  const docId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const docQuery = useQuery({
    queryKey: queryKeys.documents.detail(docId),
    queryFn: async () => (await api.get<Document>(`/documents/${docId}`)).data,
    enabled: Number.isFinite(docId),
  });
  const doc = docQuery.data;

  const fields = useQuery({
    queryKey: queryKeys.review.fields(docId),
    queryFn: async () =>
      (await api.get<ExtractedField[]>(`/review/document/${docId}`)).data,
    enabled: Number.isFinite(docId),
  });

  const fieldRows = fields.data ?? [];

  const verifyAll = useMutation({
    mutationFn: async () => {
      await api.put(`/review/document/${docId}/fields`, {
        fields: fieldRows.map((field) => ({
          id: field.id,
          value: drafts[field.id] ?? field.field_value ?? "",
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.review.fields(docId) });
      toast.success("Fields verified");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not verify fields")),
  });

  const decide = useMutation({
    mutationFn: async (action: "approve" | "reject") => {
      await api.post(`/documents/${docId}/${action}`);
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["documents", "all"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(docId) });
      toast.success(action === "approve" ? "Approved" : "Rejected");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Decision failed")),
  });

  const remove = useMutation({
    mutationFn: async () => {
      await api.delete(`/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
      router.push("/admin/documents");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not delete")),
  });

  return (
    <PageEnter>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl tracking-tight">
            {doc?.original_filename ?? `Document #${docId}`}
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {doc?.document_type ?? "Unknown type"}
            {doc?.confidence_score != null
              ? ` · ${formatConfidence(doc.confidence_score)} confidence`
              : ""}
            {" · "}
            cross-user review and approval
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {doc && <StatusChip status={doc.status} />}
          <Button size="sm" onClick={() => decide.mutate("approve")} disabled={decide.isPending}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => decide.mutate("reject")}
            disabled={decide.isPending}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm("Delete this document permanently?")) {
                remove.mutate();
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {isLowConfidence(doc) && (
        <LowConfidenceCallout className="mb-6" onDeleteHint={false} />
      )}

      <div className="space-y-3 rounded-xl border border-ink/10 bg-white/70 p-4">
        {fieldRows.map((field) => (
          <div
            key={field.id}
            className="grid gap-2 border-b border-ink/5 py-3 last:border-0 md:grid-cols-[160px_1fr] md:items-center"
          >
            <p className="text-sm font-medium">
              {field.field_name}
              {field.is_verified && (
                <span className="ml-2 text-xs font-normal text-ink/40">Verified</span>
              )}
            </p>
            <Input
              value={drafts[field.id] ?? field.field_value ?? ""}
              onChange={(e) =>
                setDrafts((prev) => ({ ...prev, [field.id]: e.target.value }))
              }
            />
          </div>
        ))}
        {!fields.isLoading && fieldRows.length === 0 && (
          <p className="text-sm text-ink/50">No extracted fields.</p>
        )}
        {fieldRows.length > 0 && (
          <div className="flex justify-end pt-2">
            <Button
              disabled={verifyAll.isPending}
              onClick={() => verifyAll.mutate()}
            >
              Save & verify all
            </Button>
          </div>
        )}
      </div>
    </PageEnter>
  );
}
