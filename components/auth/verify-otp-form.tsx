"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import { validateOtp, OTP_LENGTH } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";

export function VerifyOtpForm({ email }: { email: string }) {
  const { verifyOtp } = useSession();
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
        if (err instanceof ApiError && err.code === "INVALID_OTP") {
          setError("That code is incorrect or has expired. Please try again.");
        } else if (err instanceof ApiError && err.code === "NO_PENDING_SIGNUP") {
          setError("Your sign-up session expired. Please sign up again to get a new code.");
        } else {
          setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
        }
        setSubmitting(false);
      }
    },
    [email, submitting, verifyOtp, router],
  );

  // No email in the URL — the user reached this page without signing up.
  if (!email) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="warning">
          We couldn&apos;t tell which account to verify. Please start sign-up again.
        </Alert>
        <Button size="lg" block onClick={() => router.push("/signup")}>
          Go to sign up
        </Button>
      </div>
    );
  }

  return (
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
          Enter the {OTP_LENGTH}-digit code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span>. It expires in 10 minutes.
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
        {submitting ? "Verifying" : "Verify & continue"}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Didn&apos;t get a code?{" "}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
          Back to sign up
        </Link>
      </p>
    </form>
  );
}
