"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageEnter } from "@/components/page-enter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/session";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const { register: registerUser, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await registerUser(values.name, values.email, values.password);
      const result = await login(values.email, values.password);
      if (result.kind !== "authenticated") {
        throw new Error("Unexpected administrator verification after signup");
      }
      router.replace(result.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  }

  return (
    <PageEnter>
      <div className="w-full max-w-md rounded-xl border border-ink/10 bg-white/80 p-8 shadow-sm backdrop-blur">
        <p className="font-display text-2xl tracking-tight">Smart Document Workflow</p>
        <h1 className="mt-2 text-lg text-ink/70">Create a user account</h1>
        <p className="mt-1 text-sm text-ink/50">Administrators are seeded separately — no admin signup.</p>
        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-rose-700">{form.formState.errors.name.message}</p>
            )}
          </div>
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
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-rose-700">{form.formState.errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-rose-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </PageEnter>
  );
}
