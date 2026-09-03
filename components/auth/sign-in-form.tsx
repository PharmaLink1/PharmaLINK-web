"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { validateEmail, validatePassword } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const { login, status } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Already signed in? Don't show the form.
  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/dashboard");
    } catch (err) {
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.auth.welcomeBack}</h1>
        <p className="mt-1.5 text-muted-foreground">{t.auth.signInSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field label={t.forms.email} htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.forms.emailPlaceholder}
            value={email}
            invalid={!!errors.email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label={t.forms.password} htmlFor="password" error={errors.password}>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t.forms.passwordPlaceholder}
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

        <div className="-mt-1 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary-strong hover:underline"
          >
            {t.forms.forgotPassword}
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={submitting}>
          {submitting ? t.forms.loggingIn : t.forms.login}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t.forms.noAccount}{" "}
          <Link href="/signup" className="font-medium text-primary-strong hover:underline">
            {t.forms.signUp}
          </Link>
        </p>
      </form>
    </div>
  );
}
