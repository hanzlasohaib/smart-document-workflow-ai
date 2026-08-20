"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
import { apiErrorMessage } from "@/lib/utils";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (selected: File) => {
      const form = new FormData();
      form.append("file", selected);
      const { data } = await api.post<Document>("/documents/upload", form, {
        timeout: 120_000,
      });
      return data;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "mine"] });
      toast.success("Document uploaded");
      router.push(`/documents/${doc.id}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Upload failed")),
  });
  const slowUpload = useDelayedFlag(upload.isPending, 4000);

  return (
    <PageEnter>
      <PageHeader title="Upload" description="Submit a document for processing." />
      <Surface className="mt-8 max-w-lg p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (file) upload.mutate(file);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              className="cursor-pointer file:me-3 file:rounded-md file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-paper"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-sm text-ink-muted">
                Selected: <Filename name={file.name} lines={2} />
              </p>
            ) : (
              <p className="text-sm text-ink-muted">Choose a file to enable upload.</p>
            )}
          </div>
          {slowUpload ? (
            <p className="text-sm text-ink-subtle" role="status">
              Still uploading. Large files can take a minute on a slow connection.
            </p>
          ) : null}
          <Button type="submit" disabled={!file || upload.isPending}>
            {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </Surface>
    </PageEnter>
  );
}
