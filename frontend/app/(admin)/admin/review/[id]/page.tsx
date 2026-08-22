"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Filename } from "@/components/filename";
import { LowConfidenceCallout } from "@/components/low-confidence-callout";
import { PageEnter } from "@/components/page-enter";
import { QueryState } from "@/components/query-state";
import { SourceText } from "@/components/source-text";
import { StatusChip } from "@/components/status-chip";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, ExtractedField } from "@/lib/api/types";
import { formatConfidence, isLowConfidence } from "@/lib/api/types";
import { httpStatus } from "@/lib/network";
import { apiErrorMessage } from "@/lib/utils";

type ConfirmKind = "approve" | "reject" | "delete";

export default function AdminReviewPage() {
  const params = useParams<{ id: string }>();
  const docId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const validId = Number.isFinite(docId);

  const docQuery = useQuery({
    queryKey: queryKeys.documents.detail(docId),
    queryFn: async () => (await api.get<Document>(`/documents/${docId}`)).data,
    enabled: validId,
  });
  const doc = docQuery.data;
  const notFound = !validId || httpStatus(docQuery.error) === 404;

  const fields = useQuery({
    queryKey: queryKeys.review.fields(docId),
    queryFn: async () => (await api.get<ExtractedField[]>(`/review/document/${docId}`)).data,
    enabled: validId && !notFound,
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
      setConfirm(null);
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
      setConfirm(null);
      router.push("/admin/documents");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not delete")),
  });

  const busy = decide.isPending || remove.isPending;

  if (notFound && !docQuery.isLoading) {
    return (
      <PageEnter>
        <Surface className="px-4 py-10">
          <EmptyState
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/documents">Back to documents</Link>
              </Button>
            }
          >
            This document was not found.
          </EmptyState>
        </Surface>
      </PageEnter>
    );
  }

  return (
    <PageEnter>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.03em] md:text-[1.875rem]">
            <Filename
              name={doc?.original_filename ?? `Document #${validId ? docId : ""}`}
              lines={3}
              className="block"
            />
          </h1>
          <p className="mt-2 text-pretty text-base leading-[1.6] text-ink-muted">
            {doc?.document_type ?? "Unknown type"}
            {doc?.confidence_score != null
              ? ` · ${formatConfidence(doc.confidence_score)} confidence`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {doc && <StatusChip status={doc.status} />}
          <Button onClick={() => setConfirm("approve")} disabled={busy || !doc}>
            Approve
          </Button>
          <Button variant="danger" onClick={() => setConfirm("reject")} disabled={busy || !doc}>
            Reject
          </Button>
          <Button variant="outline" disabled={busy || !doc} onClick={() => setConfirm("delete")}>
            Delete
          </Button>
        </div>
      </div>

      {isLowConfidence(doc) && <LowConfidenceCallout className="mb-8" onDeleteHint={false} />}

      <section aria-labelledby="extracted-fields-heading">
        <h2
          id="extracted-fields-heading"
          className="font-display text-2xl tracking-[-0.03em] text-ink"
        >
          Extracted fields
        </h2>
        <p className="mt-2 text-sm leading-[1.6] text-ink-muted">
          Verify fields, then approve or reject as a separate business decision.
        </p>
        <Surface className="mt-4 divide-y divide-border px-4">
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
            empty={<p className="py-5 text-sm leading-[1.6] text-ink-muted">No extracted fields.</p>}
          >
            {fieldRows.map((field) => {
              const inputId = `admin-field-${field.id}`;
              return (
                <div
                  key={field.id}
                  className="grid gap-2 py-4 md:grid-cols-[minmax(0,12rem)_1fr] md:items-center"
                >
                  <Label htmlFor={inputId} className="break-words [overflow-wrap:anywhere]">
                    {field.field_name}
                    {field.is_verified && (
                      <span className="ms-2 text-xs font-normal text-ink-subtle">Verified</span>
                    )}
                  </Label>
                  <Input
                    id={inputId}
                    disabled={verifyAll.isPending}
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
                <Button disabled={verifyAll.isPending} onClick={() => verifyAll.mutate()}>
                  {verifyAll.isPending ? "Saving…" : "Save & verify all"}
                </Button>
              </div>
            )}
          </QueryState>
        </Surface>
      </section>
      {doc?.raw_text ? <SourceText text={doc.raw_text} /> : null}
      <ConfirmDialog
        open={confirm != null}
        title={
          confirm === "delete"
            ? "Delete document"
            : confirm === "reject"
              ? "Reject document"
              : "Approve document"
        }
        description={
          confirm === "delete"
            ? "Delete this document permanently? This cannot be undone."
            : confirm === "reject"
              ? "Reject this document? This decision cannot be undone from here."
              : "Approve this document? This decision cannot be undone from here."
        }
        confirmLabel={
          confirm === "delete" ? "Delete" : confirm === "reject" ? "Reject" : "Approve"
        }
        danger={confirm === "delete" || confirm === "reject"}
        busy={busy}
        onConfirm={() => {
          if (confirm === "delete") remove.mutate();
          if (confirm === "approve" || confirm === "reject") decide.mutate(confirm);
        }}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirm(null);
        }}
      />
    </PageEnter>
  );
}
