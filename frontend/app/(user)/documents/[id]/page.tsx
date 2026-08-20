"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Filename } from "@/components/filename";
import { LowConfidenceCallout } from "@/components/low-confidence-callout";
import { PageEnter } from "@/components/page-enter";
import { QueryState } from "@/components/query-state";
import { StatusChip } from "@/components/status-chip";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, ExtractedField } from "@/lib/api/types";
import { formatConfidence, isLowConfidence } from "@/lib/api/types";
import { httpStatus, isBrowserOffline } from "@/lib/network";
import { apiErrorMessage } from "@/lib/utils";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const docId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const validId = Number.isFinite(docId);

  const docQuery = useQuery({
    queryKey: queryKeys.documents.detail(docId),
    queryFn: async () => (await api.get<Document>(`/documents/${docId}`)).data,
    enabled: validId,
    refetchInterval: (query) => {
      if (isBrowserOffline()) return false;
      const status = query.state.data?.status;
      return status === "processing" || status === "uploaded" ? 3000 : false;
    },
  });
  const doc = docQuery.data;
  const notFound = !validId || httpStatus(docQuery.error) === 404;

  const fields = useQuery({
    queryKey: queryKeys.review.fields(docId),
    queryFn: async () => (await api.get<ExtractedField[]>(`/review/document/${docId}`)).data,
    enabled: validId && !notFound,
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
      setConfirmDelete(false);
      router.push("/documents");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not delete")),
  });

  if (notFound && !docQuery.isLoading) {
    return (
      <PageEnter>
        <Surface className="px-4 py-10 text-center">
          <p className="text-sm text-ink-muted">This document was not found.</p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/documents">Back to documents</Link>
          </Button>
        </Surface>
      </PageEnter>
    );
  }

  return (
    <PageEnter>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.03em] md:text-3xl">
            <Filename
              name={doc?.original_filename ?? `Document #${validId ? docId : ""}`}
              lines={3}
              className="block"
            />
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
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
            disabled={remove.isPending || !doc}
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {isLowConfidence(doc) && <LowConfidenceCallout className="mb-6" />}

      <Surface className="divide-y divide-border px-4">
        <QueryState
          isLoading={docQuery.isLoading || fields.isLoading}
          isError={docQuery.isError || fields.isError}
          error={docQuery.error ?? fields.error}
          isEmpty={!fields.isLoading && fieldRows.length === 0}
          onRetry={() => {
            void docQuery.refetch();
            void fields.refetch();
          }}
          loadingLabel="Loading fields…"
          empty={
            <p className="py-5 text-sm text-ink-muted">
              No extracted fields yet. If status is processing, this will fill in shortly.
            </p>
          }
        >
          {fieldRows.map((field) => {
            const inputId = `field-${field.id}`;
            return (
              <div
                key={field.id}
                className="grid gap-2 py-4 md:grid-cols-[minmax(0,160px)_1fr] md:items-center"
              >
                <Label htmlFor={inputId} className="break-words [overflow-wrap:anywhere] text-sm">
                  {field.field_name}
                  {field.is_verified && (
                    <span className="ms-2 text-xs font-normal text-ink-subtle">Verified</span>
                  )}
                </Label>
                <Input
                  id={inputId}
                  value={drafts[field.id] ?? field.field_value ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                />
              </div>
            );
          })}
          {fieldRows.length > 0 && (
            <div className="flex justify-end py-4">
              <Button
                disabled={verifyAll.isPending || fieldRows.length === 0}
                onClick={() => verifyAll.mutate()}
              >
                {verifyAll.isPending
                  ? "Saving…"
                  : hasDirty
                    ? "Save & verify all"
                    : "Verify all"}
              </Button>
            </div>
          )}
        </QueryState>
      </Surface>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete document"
        description="Delete this document permanently? This cannot be undone."
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutate()}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setConfirmDelete(false);
        }}
      />
    </PageEnter>
  );
}
