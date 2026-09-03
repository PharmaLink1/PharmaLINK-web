"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage, interpolate } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { validateOtp, validatePassword, OTP_LENGTH } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";

export function ResetPasswordForm({ email }: { email: string }) {
  const { resetPassword } = useSession();
  const { t } = useLanguage();
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
      await resetPassword({ email, otp, newPassword: password });
      setDone(true);
    } catch (err) {
      setFormError(getErrorMessage(err, t));
      setSubmitting(false);
    }
  }

  // No email in the URL - the user reached this page without requesting a reset.
  if (!email) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="warning">{t.forms.resetMissingEmail}</Alert>
        <Button size="lg" block onClick={() => router.push("/forgot-password")}>
          {t.forms.requestResetCode}
        </Button>
      </div>
    );
  }

  // Reset succeeded - the backend revoked all sessions, so the user must sign in.
  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="success">{t.forms.resetSuccess}</Alert>
        <Button size="lg" block onClick={() => router.replace("/signin")}>
          {t.forms.continueToLogin}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.resetTitle}</h1>
        <p className="mt-1.5 text-muted-foreground">{t.auth.resetSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            {interpolate(t.forms.otpSentTo, { length: OTP_LENGTH })}{" "}
            <span className="font-medium text-foreground">{email}</span>. {t.forms.otpExpires}
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

        <Field label={t.forms.newPassword} htmlFor="new-password" error={errors.password}>
          <div className="relative">
            <Input
              id="new-password"
              name="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t.forms.passwordPlaceholderMin}
              className="pr-11"
              value={password}
              invalid={!!errors.password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t.forms.hidePassword : t.forms.showPassword}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" block loading={submitting} disabled={otp.length !== OTP_LENGTH}>
          {submitting ? t.forms.resetting : t.forms.resetPassword}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          <Link href="/signin" className="font-medium text-primary-strong hover:underline">
            {t.forms.backToLogin}
          </Link>
        </p>
      </form>
    </div>
  );
}
