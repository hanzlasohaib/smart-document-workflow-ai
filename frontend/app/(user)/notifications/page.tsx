"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { PageEnter } from "@/components/page-enter";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Notification, Paginated } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
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

  const items = list.data?.items ?? [];

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">Notifications</h1>
      <p className="mt-2 text-ink/60">Status updates for your documents.</p>
      <div className="mt-8 space-y-3">
        {list.isLoading && <p className="text-sm text-ink/50">Loading…</p>}
        {items.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-ink/10 bg-white/70 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {n.title}
                  {!n.is_read && (
                    <span className="ml-2 text-xs font-normal text-accent">Unread</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink/70">{n.message}</p>
              </div>
              {!n.is_read && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markRead.mutate(n.id)}
                  disabled={markRead.isPending}
                >
                  Mark read
                </Button>
              )}
            </div>
          </div>
        ))}
        {!list.isLoading && items.length === 0 && (
          <p className="text-sm text-ink/50">No notifications yet.</p>
        )}
      </div>
      <PaginationControls
        page={page}
        pages={list.data?.pages ?? 0}
        onPageChange={setPage}
      />
    </PageEnter>
  );
}
