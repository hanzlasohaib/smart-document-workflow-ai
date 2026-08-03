"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageEnter } from "@/components/page-enter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/session";
import { safeReturnUrl } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const user = await login(values.email, values.password);
      const returnUrl = safeReturnUrl(params.get("returnUrl"));
      if (returnUrl) {
        router.replace(returnUrl);
        return;
      }
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <PageEnter>
      <div className="w-full max-w-md rounded-xl border border-ink/10 bg-white/80 p-8 shadow-sm backdrop-blur">
        <p className="font-display text-2xl tracking-tight">Smart Document Workflow</p>
        <h1 className="mt-2 text-lg text-ink/70">Log in to continue</h1>
        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-rose-700">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-rose-700">{form.formState.errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-ink/60">
          New here?{" "}
          <Link href="/signup" className="text-ink underline underline-offset-4">
            Create a user account
          </Link>
        </p>
      </div>
    </PageEnter>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-ink/60">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
