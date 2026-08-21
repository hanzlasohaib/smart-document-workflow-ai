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
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
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
  const busy = form.formState.isSubmitting;

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
      <Surface className="w-full max-w-md p-6">
        <p className="text-sm font-medium text-ink-subtle">Smart Document Workflow</p>
        <h1 className="mt-2 font-display text-2xl leading-[1.2] tracking-[-0.03em] text-ink">
          Create a user account
        </h1>
        <p className="mt-2 text-pretty leading-[1.6] text-ink-muted">
          Administrators are seeded separately. There is no public admin signup.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            if (errors.name) form.setFocus("name");
            else if (errors.email) form.setFocus("email");
            else if (errors.password) form.setFocus("password");
          })}
          noValidate
          aria-busy={busy}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              autoFocus
              disabled={busy}
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
              autoCapitalize="none"
              spellCheck={false}
              disabled={busy}
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
              disabled={busy}
              aria-invalid={Boolean(form.formState.errors.password)}
              aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              {...form.register("password")}
            />
            <FieldError id="password-error">{form.formState.errors.password?.message}</FieldError>
          </div>
          <FieldError id="signup-error">{error}</FieldError>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-8 text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </Surface>
    </PageEnter>
  );
}
