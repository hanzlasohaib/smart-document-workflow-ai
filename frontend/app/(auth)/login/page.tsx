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
import { useAuth, type AdminOtpChallenge } from "@/lib/auth/session";
import { safeReturnUrl } from "@/lib/utils";

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
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function onOtpSubmit(values: OtpValues) {
    if (!otpChallenge) return;
    setError(null);
    try {
      const user = await verifyAdminOtp(otpChallenge.challengeId, values.code.trim());
      redirectAfterAuth(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <PageEnter>
      <div className="w-full max-w-md rounded-xl border border-ink/10 bg-white/80 p-8 shadow-sm backdrop-blur">
        <p className="font-display text-2xl tracking-tight">Smart Document Workflow</p>
        <h1 className="mt-2 text-lg text-ink/70">
          {otpChallenge ? "Administrator verification" : "Log in to continue"}
        </h1>

        {!otpChallenge ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...credentialsForm.register("email")}
              />
              {credentialsForm.formState.errors.email && (
                <p className="text-sm text-rose-700">
                  {credentialsForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...credentialsForm.register("password")}
              />
              {credentialsForm.formState.errors.password && (
                <p className="text-sm text-rose-700">
                  {credentialsForm.formState.errors.password.message}
                </p>
              )}
            </div>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              disabled={credentialsForm.formState.isSubmitting}
            >
              {credentialsForm.formState.isSubmitting ? "Signing in…" : "Log in"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
            <p className="text-sm text-ink/70">
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
                {...otpForm.register("code")}
              />
              {otpForm.formState.errors.code && (
                <p className="text-sm text-rose-700">{otpForm.formState.errors.code.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? "Verifying…" : "Verify and continue"}
            </Button>
            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resendBusy}
                onClick={() => void onResend()}
              >
                {resendBusy ? "Sending…" : "Resend code"}
              </Button>
              <button
                type="button"
                className="text-sm text-ink/60 underline underline-offset-4"
                onClick={() => {
                  setOtpChallenge(null);
                  setError(null);
                  otpForm.reset({ code: "" });
                }}
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {!otpChallenge && (
          <p className="mt-6 text-sm text-ink/60">
            New here?{" "}
            <Link href="/signup" className="text-ink underline underline-offset-4">
              Create a user account
            </Link>
          </p>
        )}
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
