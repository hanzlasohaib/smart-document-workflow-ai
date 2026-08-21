"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Filename } from "@/components/filename";
import { PageEnter } from "@/components/page-enter";
import { PageHeader } from "@/components/page-header";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import type { Document } from "@/lib/api/types";
import { useDelayedFlag } from "@/lib/use-delayed-flag";
import { apiErrorMessage, cn } from "@/lib/utils";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.tif,.tiff,.bmp,.txt,.csv,.doc,.docx";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (selected: File) => {
      const form = new FormData();
      form.append("file", selected);
      const { data } = await api.post<Document>("/documents/upload", form, {
        timeout: 120_000,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      return data;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "mine"] });
      toast.success("Document uploaded");
      router.push(`/documents/${doc.id}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Upload failed")),
    onSettled: () => setProgress(null),
  });
  const slowUpload = useDelayedFlag(upload.isPending, 4000);
  const busy = upload.isPending;

  function takeFile(next: File | undefined | null) {
    if (!next || busy) return;
    setFile(next);
    upload.reset();
  }

  return (
    <PageEnter>
      <PageHeader
        title="Upload"
        description="Submit a PDF or image for OCR, classification, and field extraction."
      />
      <Surface className="mt-8 max-w-lg p-6">
        <form
          className="space-y-5"
          aria-busy={busy}
          onSubmit={(e) => {
            e.preventDefault();
            if (file && !busy) upload.mutate(file);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                if (!busy) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                takeFile(event.dataTransfer.files[0]);
              }}
              className={cn(
                "rounded-md border border-dashed border-border bg-paper p-4",
                dragging && "border-ink bg-info-soft",
                busy && "opacity-50",
              )}
            >
              <Input
                id="file"
                type="file"
                accept={ACCEPT}
                disabled={busy}
                className="cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-paper"
                onChange={(e) => takeFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-3 text-sm leading-[1.6] text-ink-muted">
                Drop a file here or use the picker. PDF, image, Word, CSV, or text.
              </p>
            </div>
            {file ? (
              <p className="text-sm text-ink-muted">
                Selected: <Filename name={file.name} lines={2} />
              </p>
            ) : (
              <p className="text-sm text-ink-subtle">Choose a file to enable upload.</p>
            )}
          </div>
          {busy ? (
            <div className="space-y-2">
              <p className="text-sm text-ink-muted" role="status">
                {progress != null ? `${progress}% uploaded` : "Uploading…"}
              </p>
              <div
                className="h-1.5 overflow-hidden rounded-md bg-border"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress ?? undefined}
                aria-label="Upload progress"
              >
                <div
                  className="h-full bg-ink transition-[width] duration-150 ease-out"
                  style={{ width: `${progress ?? 15}%` }}
                />
              </div>
            </div>
          ) : null}
          {slowUpload ? (
            <p className="text-sm text-ink-subtle" role="status">
              Still uploading. Large files can take a minute on a slow connection.
            </p>
          ) : null}
          <FieldError id="upload-error">
            {upload.isError ? apiErrorMessage(upload.error, "Upload failed") : null}
          </FieldError>
          <Button type="submit" disabled={!file || busy}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </Surface>
    </PageEnter>
  );
}
