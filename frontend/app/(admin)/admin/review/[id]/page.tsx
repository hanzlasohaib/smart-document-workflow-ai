"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageEnter } from "@/components/page-enter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document, ExtractedField } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

export default function AdminReviewPage() {
  const params = useParams<{ id: string }>();
  const docId = Number(params.id);
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const docs = useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: async () => (await api.get<Document[]>("/documents/")).data,
  });
  const doc = docs.data?.find((d) => d.id === docId);

  const fields = useQuery({
    queryKey: queryKeys.review.fields(docId),
    queryFn: async () =>
      (await api.get<ExtractedField[]>(`/review/document/${docId}`)).data,
    enabled: Number.isFinite(docId),
  });

  const saveField = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: string }) => {
      await api.put(`/review/field/${id}`, null, { params: { value } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.review.fields(docId) });
      toast.success("Field verified");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not update field")),
  });

  const decide = useMutation({
    mutationFn: async (action: "approve" | "reject") => {
      await api.post(`/documents/${docId}/${action}`);
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      toast.success(action === "approve" ? "Approved" : "Rejected");
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Decision failed")),
  });

  return (
    <PageEnter>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            {doc?.original_filename ?? `Document #${docId}`}
          </h1>
          <p className="mt-2 text-ink/60">Cross-user field review and approval.</p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-ink/10 bg-white/70 p-4">
        {(fields.data ?? []).map((field) => (
          <div
            key={field.id}
            className="grid gap-2 border-b border-ink/5 py-3 last:border-0 md:grid-cols-[160px_1fr_auto] md:items-center"
          >
            <p className="text-sm font-medium">{field.field_name}</p>
            <Input
              value={drafts[field.id] ?? field.field_value ?? ""}
              onChange={(e) =>
                setDrafts((prev) => ({ ...prev, [field.id]: e.target.value }))
              }
            />
            <Button
              size="sm"
              onClick={() =>
                saveField.mutate({
                  id: field.id,
                  value: drafts[field.id] ?? field.field_value ?? "",
                })
              }
            >
              Verify
            </Button>
          </div>
        ))}
        {!fields.isLoading && (fields.data?.length ?? 0) === 0 && (
          <p className="text-sm text-ink/50">No extracted fields.</p>
        )}
      </div>
    </PageEnter>
  );
}
