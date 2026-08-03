"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document } from "@/lib/api/types";

export default function MyDocumentsPage() {
  const docs = useQuery({
    queryKey: queryKeys.documents.mine,
    queryFn: async () => (await api.get<Document[]>("/documents/my")).data,
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === "processing" || d.status === "uploaded")
        ? 3000
        : false,
  });

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">My documents</h1>
      <p className="mt-2 text-ink/60">Track status and open items that need review.</p>
      <div className="mt-8 space-y-2 rounded-xl border border-ink/10 bg-white/70 p-4">
        {docs.isLoading && <p className="text-sm text-ink/50">Loading…</p>}
        {(docs.data ?? []).map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-3 hover:bg-ink/5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{doc.original_filename}</p>
              <p className="text-xs text-ink/50">
                {doc.document_type ?? "Unknown type"}
                {doc.confidence_score != null
                  ? ` · ${(doc.confidence_score * 100).toFixed(0)}%`
                  : ""}
              </p>
            </div>
            <StatusChip status={doc.status} />
          </Link>
        ))}
        {!docs.isLoading && (docs.data?.length ?? 0) === 0 && (
          <p className="text-sm text-ink/50">No documents yet.</p>
        )}
      </div>
    </PageEnter>
  );
}
