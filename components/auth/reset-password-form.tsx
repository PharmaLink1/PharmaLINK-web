"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import { validateOtp, validatePassword, OTP_LENGTH } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

export function ResetPasswordForm({ email }: { email: string }) {
  const { resetPassword } = useSession();
  const router = useRouter();

  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ otp?: string; password?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = {
      otp: validateOtp(otp),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.otp || nextErrors.password) return;

    setSubmitting(true);
    try {
      await resetPassword({ email, otp, new_password: password });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_OTP") {
        setFormError("That code is incorrect or has expired. Please request a new one.");
      } else if (err instanceof ApiError && err.code === "NO_PASSWORD_RESET") {
        setFormError("Your reset session expired. Please request a new code.");
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  // No email in the URL — the user reached this page without requesting a reset.
  if (!email) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="warning">
          We couldn&apos;t tell which account to reset. Please start again.
        </Alert>
        <Button size="lg" block onClick={() => router.push("/forgot-password")}>
          Request a reset code
        </Button>
      </div>
    );
  }

  // Reset succeeded — the backend revoked all sessions, so the user must sign in.
  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="success">
          Your password has been reset. Sign in with your new password.
        </Alert>
        <Button size="lg" block onClick={() => router.replace("/signin")}>
          Continue to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && <Alert variant="danger">{formError}</Alert>}

      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          Enter the {OTP_LENGTH}-digit code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span>. It expires in 10 minutes.
        </p>
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
          }}
          invalid={!!errors.otp}
          autoFocus
        />
        {errors.otp && <p className="mt-2 text-sm text-danger">{errors.otp}</p>}
      </div>

      <Field label="New password" htmlFor="new-password" error={errors.password}>
        <div className="relative">
          <Input
            id="new-password"
            name="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pr-11"
            value={password}
            invalid={!!errors.password}
            disabled={submitting}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" block loading={submitting} disabled={otp.length !== OTP_LENGTH}>
        {submitting ? "Resetting" : "Reset password"}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        <Link href="/signin" className="font-medium text-primary hover:text-primary-hover">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
