"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";

import { PageEnter } from "@/components/page-enter";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Document } from "@/lib/api/types";

export default function AdminDashboardPage() {
  const pending = useQuery({
    queryKey: queryKeys.documents.pending,
    queryFn: async () => (await api.get<Document[]>("/documents/pending")).data,
  });
  const all = useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: async () => (await api.get<Document[]>("/documents/")).data,
  });

  return (
    <PageEnter>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div>
          <h1 className="font-display text-3xl tracking-tight">Operations</h1>
          <p className="mt-2 text-ink/60">
            {(pending.data ?? []).length} pending · {(all.data ?? []).length} total documents
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pending">Open pending queue</Link>
        </Button>
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink/50">
            Latest pending
          </h2>
          <div className="space-y-2 rounded-xl border border-ink/10 bg-white/70 p-4">
            {(pending.data ?? []).slice(0, 5).map((doc) => (
              <Link
                key={doc.id}
                href={`/admin/review/${doc.id}`}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-ink/5"
              >
                <span className="truncate">{doc.original_filename}</span>
                <StatusChip status={doc.status} />
              </Link>
            ))}
            {!pending.isLoading && (pending.data?.length ?? 0) === 0 && (
              <p className="text-sm text-ink/50">Queue is clear.</p>
            )}
          </div>
        </section>
      </motion.div>
    </PageEnter>
  );
}
