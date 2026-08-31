"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import { validateEmail } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const { forgotPassword } = useSession();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const invalid = validateEmail(email);
    setError(invalid);
    if (invalid) return;

    setSubmitting(true);
    try {
      // The backend always returns 202 (no account enumeration), so on success we
      // go straight to the reset step carrying the email.
      await forgotPassword({ email: email.trim() });
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Field label="Email" htmlFor="email" error={error}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          invalid={!!error}
          disabled={submitting}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Button type="submit" size="lg" block loading={submitting}>
        {submitting ? "Sending" : "Send reset code"}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        <Link href="/signin" className="font-medium text-primary hover:text-primary-hover">
          Back to login
        </Link>
      </p>
    </form>
  );
}
