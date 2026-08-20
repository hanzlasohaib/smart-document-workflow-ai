"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FieldError } from "@/components/field-error";
import { PageEnter } from "@/components/page-enter";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type AdminOtpChallenge } from "@/lib/auth/session";
import { apiErrorMessage, safeReturnUrl } from "@/lib/utils";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  code: z.string().min(4, "Enter the verification code").max(12),
});

type CredentialsValues = z.infer<typeof credentialsSchema>;
type OtpValues = z.infer<typeof otpSchema>;

function LoginForm() {
  const { login, verifyAdminOtp, resendAdminOtp } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [otpChallenge, setOtpChallenge] = useState<AdminOtpChallenge | null>(null);
  const [resendBusy, setResendBusy] = useState(false);

  const credentialsForm = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  function redirectAfterAuth(role: string) {
    const returnUrl = safeReturnUrl(params.get("returnUrl"));
    if (returnUrl) {
      router.replace(returnUrl);
      return;
    }
    router.replace(role === "admin" ? "/admin" : "/dashboard");
  }

  async function onCredentialsSubmit(values: CredentialsValues) {
    setError(null);
    try {
      const result = await login(values.email, values.password);
      if (result.kind === "otp_required") {
        setOtpChallenge(result);
        otpForm.reset({ code: "" });
        return;
      }
      redirectAfterAuth(result.user.role);
    } catch (err) {
      setError(apiErrorMessage(err, "Login failed"));
    }
  }

  async function onOtpSubmit(values: OtpValues) {
    if (!otpChallenge) return;
    setError(null);
    try {
      const user = await verifyAdminOtp(otpChallenge.challengeId, values.code.trim());
      redirectAfterAuth(user.role);
    } catch (err) {
      setError(apiErrorMessage(err, "Verification failed"));
    }
  }

  async function onResend() {
    if (!otpChallenge) return;
    setError(null);
    setResendBusy(true);
    try {
      const next = await resendAdminOtp(otpChallenge.challengeId);
      setOtpChallenge(next);
      otpForm.reset({ code: "" });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not resend code"));
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <PageEnter>
      <Surface className="w-full max-w-md p-6 sm:p-8">
        <p className="text-sm font-medium text-ink-muted">Smart Document Workflow</p>
        <h1 className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink">
          {otpChallenge ? "Administrator verification" : "Log in"}
        </h1>
        <p className="mt-2 text-ink-muted">
          {otpChallenge ? "Enter the code sent to your email." : "Continue to your portal."}
        </p>

        {!otpChallenge ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(credentialsForm.formState.errors.email)}
                aria-describedby={
                  credentialsForm.formState.errors.email ? "email-error" : undefined
                }
                {...credentialsForm.register("email")}
              />
              <FieldError id="email-error">
                {credentialsForm.formState.errors.email?.message}
              </FieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(credentialsForm.formState.errors.password)}
                aria-describedby={
                  credentialsForm.formState.errors.password ? "password-error" : undefined
                }
                {...credentialsForm.register("password")}
              />
              <FieldError id="password-error">
                {credentialsForm.formState.errors.password?.message}
              </FieldError>
            </div>
            <FieldError id="login-error">{error}</FieldError>
            <Button
              type="submit"
              className="w-full"
              disabled={credentialsForm.formState.isSubmitting}
            >
              {credentialsForm.formState.isSubmitting ? "Signing in…" : "Log in"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={otpForm.handleSubmit(onOtpSubmit)} noValidate>
            <p className="text-sm text-ink-muted">
              Enter the verification code sent to{" "}
              <span className="font-medium text-ink">
                {otpChallenge.otpDestination || "hanzlamaan125@gmail.com"}
              </span>
              .
            </p>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-invalid={Boolean(otpForm.formState.errors.code)}
                aria-describedby={otpForm.formState.errors.code ? "code-error" : undefined}
                {...otpForm.register("code")}
              />
              <FieldError id="code-error">{otpForm.formState.errors.code?.message}</FieldError>
            </div>
            <FieldError id="otp-error">{error}</FieldError>
            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? "Verifying…" : "Verify and continue"}
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resendBusy}
                onClick={() => void onResend()}
              >
                {resendBusy ? "Sending…" : "Resend code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOtpChallenge(null);
                  setError(null);
                  otpForm.reset({ code: "" });
                }}
              >
                Back to login
              </Button>
            </div>
          </form>
        )}

        {!otpChallenge && (
          <p className="mt-6 text-sm text-ink-muted">
            New here?{" "}
            <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
              Create a user account
            </Link>
          </p>
        )}
      </Surface>
    </PageEnter>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-ink-muted" role="status">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
