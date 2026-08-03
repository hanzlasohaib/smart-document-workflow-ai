"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document } from "@/lib/api/types";

export default function AdminDocumentsPage() {
  const docs = useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: async () => (await api.get<Document[]>("/documents/")).data,
  });

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">All documents</h1>
      <p className="mt-2 text-ink/60">Cross-user document list.</p>
      <div className="mt-8 overflow-x-auto rounded-xl border border-ink/10 bg-white/70">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 text-ink/50">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(docs.data ?? []).map((doc) => (
              <tr key={doc.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">{doc.id}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/review/${doc.id}`} className="underline-offset-4 hover:underline">
                    {doc.original_filename}
                  </Link>
                </td>
                <td className="px-4 py-3">{doc.document_type ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusChip status={doc.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!docs.isLoading && (docs.data?.length ?? 0) === 0 && (
          <p className="p-4 text-sm text-ink/50">No documents.</p>
        )}
      </div>
    </PageEnter>
  );
}
