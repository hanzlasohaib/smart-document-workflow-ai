"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
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
  const [status, setStatus] = useState<string | null>(null);
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

  const credentialsBusy = credentialsForm.formState.isSubmitting;
  const otpBusy = otpForm.formState.isSubmitting;
  const otpLocked = otpBusy || resendBusy;
  const otpDestination = otpChallenge?.otpDestination.trim() ?? "";

  useEffect(() => {
    if (otpChallenge) {
      otpForm.setFocus("code");
    }
  }, [otpChallenge, otpForm]);

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
    setStatus(null);
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
    setStatus(null);
    try {
      const user = await verifyAdminOtp(otpChallenge.challengeId, values.code.trim());
      redirectAfterAuth(user.role);
    } catch (err) {
      setError(apiErrorMessage(err, "Verification failed"));
    }
  }

  async function onResend() {
    if (!otpChallenge || otpLocked) return;
    setError(null);
    setStatus(null);
    setResendBusy(true);
    try {
      const next = await resendAdminOtp(otpChallenge.challengeId);
      setOtpChallenge(next);
      otpForm.reset({ code: "" });
      setStatus("A new code was sent.");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not resend code"));
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <PageEnter>
      <Surface className="w-full max-w-md p-6">
        <p className="text-sm font-medium text-ink-subtle">Smart Document Workflow</p>
        <h1 className="mt-2 font-display text-2xl leading-[1.2] tracking-[-0.03em] text-ink">
          {otpChallenge ? "Administrator verification" : "Log in"}
        </h1>
        <p className="mt-2 text-pretty leading-[1.6] text-ink-muted">
          {otpChallenge
            ? "Enter the code sent to your email."
            : "Use your account to open the user or admin portal."}
        </p>

        {!otpChallenge ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit, (errors) => {
              if (errors.email) credentialsForm.setFocus("email");
              else if (errors.password) credentialsForm.setFocus("password");
            })}
            noValidate
            aria-busy={credentialsBusy}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                disabled={credentialsBusy}
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
                disabled={credentialsBusy}
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
            <Button type="submit" className="w-full" disabled={credentialsBusy}>
              {credentialsBusy ? "Signing in…" : "Log in"}
            </Button>
          </form>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={otpForm.handleSubmit(onOtpSubmit, (errors) => {
              if (errors.code) otpForm.setFocus("code");
            })}
            noValidate
            aria-busy={otpLocked}
          >
            <p id="otp-hint" className="text-pretty text-sm leading-[1.6] text-ink-muted">
              {otpDestination ? (
                <>
                  Enter the verification code sent to{" "}
                  <span className="font-medium text-ink">{otpDestination}</span>.
                </>
              ) : (
                <>Enter the verification code sent to your email.</>
              )}
            </p>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoCapitalize="none"
                spellCheck={false}
                disabled={otpLocked}
                aria-invalid={Boolean(otpForm.formState.errors.code)}
                aria-describedby={
                  [
                    "otp-hint",
                    otpForm.formState.errors.code ? "code-error" : null,
                    error ? "otp-error" : null,
                    status ? "otp-status" : null,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                {...otpForm.register("code")}
              />
              <FieldError id="code-error">{otpForm.formState.errors.code?.message}</FieldError>
            </div>
            {status ? (
              <p id="otp-status" role="status" className="text-sm text-ink-muted">
                {status}
              </p>
            ) : null}
            <FieldError id="otp-error">{error}</FieldError>
            <Button type="submit" className="w-full" disabled={otpLocked}>
              {otpBusy ? "Verifying…" : "Verify and continue"}
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={otpLocked}
                onClick={() => void onResend()}
              >
                {resendBusy ? "Sending…" : "Resend code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={otpLocked}
                onClick={() => {
                  setOtpChallenge(null);
                  setError(null);
                  setStatus(null);
                  otpForm.reset({ code: "" });
                }}
              >
                Back to login
              </Button>
            </div>
          </form>
        )}

        {!otpChallenge && (
          <p className="mt-8 text-sm text-ink-muted">
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

function LoginFallback() {
  return (
    <Surface className="w-full max-w-md p-6" aria-busy="true">
      <p className="text-ink-muted" role="status">
        Loading…
      </p>
    </Surface>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
