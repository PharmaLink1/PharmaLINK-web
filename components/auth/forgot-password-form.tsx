"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { validateEmail } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const { forgotPassword } = useSession();
  const { t } = useLanguage();
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
      router.push("/reset-password?email=" + encodeURIComponent(email.trim()));
    } catch (err) {
      setFormError(getErrorMessage(err, t));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.forgotTitle}</h1>
        <p className="mt-1.5 text-muted-foreground">{t.auth.forgotSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field label={t.forms.email} htmlFor="email" error={error}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.forms.emailPlaceholder}
            value={email}
            invalid={!!error}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Button type="submit" size="lg" block loading={submitting}>
          {submitting ? t.forms.sending : t.forms.sendResetCode}
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
