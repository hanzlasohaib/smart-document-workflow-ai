"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/field-error";
import { PageEnter } from "@/components/page-enter";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/session";
import { apiErrorMessage } from "@/lib/utils";

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
      setError(apiErrorMessage(err, "Signup failed"));
    }
  }

  return (
    <PageEnter>
      <Surface className="w-full max-w-md p-6 sm:p-8">
        <p className="text-sm font-medium text-ink-muted">Smart Document Workflow</p>
        <h1 className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink">
          Create a user account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Administrators are seeded separately — no admin signup.
        </p>
        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.name)}
              aria-describedby={form.formState.errors.name ? "name-error" : undefined}
              {...form.register("name")}
            />
            <FieldError id="name-error">{form.formState.errors.name?.message}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
              {...form.register("email")}
            />
            <FieldError id="email-error">{form.formState.errors.email?.message}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(form.formState.errors.password)}
              aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              {...form.register("password")}
            />
            <FieldError id="password-error">{form.formState.errors.password?.message}</FieldError>
          </div>
          <FieldError id="signup-error">{error}</FieldError>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </Surface>
    </PageEnter>
  );
}
