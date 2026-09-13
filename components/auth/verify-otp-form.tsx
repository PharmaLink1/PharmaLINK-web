"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage, interpolate } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { validateOtp, OTP_LENGTH } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";

export function VerifyOtpForm({ email }: { email: string }) {
  const { verifyOtp } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = React.useCallback(
    async (code: string) => {
      if (submitting) return;
      const invalid = validateOtp(code);
      if (invalid) {
        setError(invalid);
        return;
      }

      setError(null);
      setSubmitting(true);
      try {
        await verifyOtp({ email, otp: code });
        router.replace("/dashboard");
      } catch (err) {
        setError(getErrorMessage(err, t));
        setSubmitting(false);
      }
    },
    [email, submitting, verifyOtp, router, t],
  );

  // No email in the URL - the user reached this page without signing up.
  if (!email) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="warning">{t.forms.verifyMissingEmail}</Alert>
        <Button size="lg" block onClick={() => router.push("/signup")}>
          {t.forms.goToSignUp}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.checkEmail}</h1>
        <p className="mt-1.5 text-muted-foreground">{t.auth.checkEmailSubtitle}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(otp);
        }}
        className="flex flex-col gap-6"
      >
        {error && <Alert variant="danger">{error}</Alert>}

        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            {interpolate(t.forms.otpSentTo, { length: OTP_LENGTH })}{" "}
            <span className="font-medium text-foreground">{email}</span>. {t.forms.otpExpires}
          </p>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              if (error) setError(null);
            }}
            invalid={!!error}
            disabled={submitting}
            autoFocus
            onComplete={submit}
          />
        </div>

        <Button type="submit" size="lg" block loading={submitting} disabled={otp.length !== OTP_LENGTH}>
          {submitting ? t.forms.verifying : t.forms.verifyContinue}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {t.forms.noCode}{" "}
          <Link href="/signup" className="font-medium text-primary-strong hover:underline">
            {t.forms.backToSignUp}
          </Link>
        </p>
      </form>
    </div>
  );
}
