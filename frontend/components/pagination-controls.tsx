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
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-ink/60">
      <span>
        Page {page} of {pages}
      </span>
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
    </div>
  );
}
