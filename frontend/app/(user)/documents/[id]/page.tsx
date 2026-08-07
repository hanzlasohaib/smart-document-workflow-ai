"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const docId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const docQuery = useQuery({
    queryKey: queryKeys.documents.detail(docId),
    queryFn: async () => (await api.get<Document>(`/documents/${docId}`)).data,
    enabled: Number.isFinite(docId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "processing" || status === "uploaded" ? 3000 : false;
    },
  });
  const doc = docQuery.data;

  const fields = useQuery({
    queryKey: queryKeys.review.fields(docId),
    queryFn: async () =>
      (await api.get<ExtractedField[]>(`/review/document/${docId}`)).data,
    enabled: Number.isFinite(docId),
  });

  const fieldRows = useMemo(() => fields.data ?? [], [fields.data]);
  const hasDirty = useMemo(() => {
    return fieldRows.some((field) => {
      const draft = drafts[field.id];
      if (draft === undefined) return !field.is_verified;
      return draft !== (field.field_value ?? "") || !field.is_verified;
    });
  }, [drafts, fieldRows]);

  const verifyAll = useMutation({
    mutationFn: async () => {
      const payload = {
        fields: fieldRows.map((field) => ({
          id: field.id,
          value: drafts[field.id] ?? field.field_value ?? "",
        })),
      };
      await api.put(`/review/document/${docId}/fields`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.review.fields(docId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(docId) });
      toast.success("Fields verified");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not verify fields")),
  });

  const remove = useMutation({
    mutationFn: async () => {
      await api.delete(`/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Document deleted");
      router.push("/documents");
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
            {doc?.document_type ?? "Processing"}
            {doc?.confidence_score != null
              ? ` · ${formatConfidence(doc.confidence_score)} confidence`
              : ""}
            {" · "}
            review extracted fields
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {doc && <StatusChip status={doc.status} />}
          <Button
            size="sm"
            variant="danger"
            disabled={remove.isPending}
            onClick={() => {
              if (
                window.confirm(
                  "Delete this document permanently? This cannot be undone.",
                )
              ) {
                remove.mutate();
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {isLowConfidence(doc) && <LowConfidenceCallout className="mb-6" />}

      <div className="space-y-3 rounded-xl border border-ink/10 bg-white/70 p-4">
        {fields.isLoading && <p className="text-sm text-ink/50">Loading fields…</p>}
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
              aria-label={`Value for ${field.field_name}`}
            />
          </div>
        ))}
        {!fields.isLoading && fieldRows.length === 0 && (
          <p className="text-sm text-ink/50">
            No extracted fields yet. If status is processing, this will fill in shortly.
          </p>
        )}
        {fieldRows.length > 0 && (
          <div className="flex justify-end pt-2">
            <Button
              disabled={verifyAll.isPending || fieldRows.length === 0}
              onClick={() => verifyAll.mutate()}
            >
              {hasDirty ? "Save & verify all" : "Verify all"}
            </Button>
          </div>
        )}
      </div>
    </PageEnter>
  );
}
