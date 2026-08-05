"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageEnter } from "@/components/page-enter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import type { Document } from "@/lib/api/types";
import { apiErrorMessage } from "@/lib/utils";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (selected: File) => {
      const form = new FormData();
      form.append("file", selected);
      const { data } = await api.post<Document>("/documents/upload", form);
      return data;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "mine"] });
      toast.success("Document uploaded");
      router.push(`/documents/${doc.id}`);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Upload failed")),
  });

  return (
    <PageEnter>
      <h1 className="font-display text-3xl tracking-tight">Upload</h1>
      <p className="mt-2 text-ink/60">Submit a document for processing.</p>
      <form
        className="mt-8 max-w-lg space-y-4 rounded-xl border border-ink/10 bg-white/70 p-6"
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
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="submit" disabled={!file || upload.isPending}>
          {upload.isPending ? "Uploading…" : "Upload"}
        </Button>
      </form>
    </PageEnter>
  );
}
