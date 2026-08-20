"use client";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ page, pages, onPageChange }: Props) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3 text-sm text-ink-muted">
      <p aria-live="polite">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
