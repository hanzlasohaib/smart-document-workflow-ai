"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageEnter } from "@/components/page-enter";
import { PageHeader } from "@/components/page-header";
import { PaginationControls } from "@/components/pagination-controls";
import { QueryState } from "@/components/query-state";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Notification, Paginated } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: queryKeys.notifications.list(page, PAGE_SIZE),
    queryFn: async () =>
      (
        await api.get<Paginated<Notification>>("/notifications/", {
          params: { page, page_size: PAGE_SIZE },
        })
      ).data,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not mark read")),
  });

  const openNotification = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await markRead.mutateAsync(n.id);
      } catch {
        // Navigation still proceeds; toast handled by mutation.
      }
    }
    if (n.document_id != null) {
      router.push(`/documents/${n.document_id}`);
    }
  };

  const items = list.data?.items ?? [];

  return (
    <PageEnter>
      <PageHeader
        title="Notifications"
        description="Status updates for your documents. Opening an item marks it as read."
      />
      <div className="mt-8 space-y-3">
        <QueryState
          isLoading={list.isLoading}
          isError={list.isError}
          error={list.error}
          isEmpty={items.length === 0}
          onRetry={() => void list.refetch()}
          empty={
            <Surface className="border-dashed px-4 py-10 text-center shadow-none">
              <p className="text-sm text-ink-muted">No notifications yet.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/upload">Upload a document</Link>
              </Button>
            </Surface>
          }
        >
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => openNotification(n)}
              className="w-full rounded-xl border border-border bg-surface p-4 text-start shadow-surface transition-colors hover:bg-ink/[0.03]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words [overflow-wrap:anywhere] font-medium">
                    {n.title}
                    {!n.is_read && (
                      <span className="ms-2 text-xs font-semibold text-accent-ink">Unread</span>
                    )}
                  </p>
                  <p className="mt-1 break-words [overflow-wrap:anywhere] text-sm text-ink-muted">
                    {n.message}
                  </p>
                  {n.document_id != null && (
                    <p className="mt-2 text-sm text-ink-subtle">Open document</p>
                  )}
                </div>
                {!n.is_read && n.document_id == null && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead.mutate(n.id);
                    }}
                    disabled={markRead.isPending}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </button>
          ))}
        </QueryState>
      </div>
      <PaginationControls page={page} pages={list.data?.pages ?? 0} onPageChange={setPage} />
    </PageEnter>
  );
}
