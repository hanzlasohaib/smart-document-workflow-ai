"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (busy && !next) return;
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content
          aria-busy={busy}
          className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-surface focus:outline-none"
        >
          <Dialog.Title className="font-display text-xl tracking-[-0.03em] text-ink">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 break-words [overflow-wrap:anywhere] text-pretty text-sm text-ink-muted">
            {description}
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={danger ? "danger" : "default"}
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? "Working…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
