"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import { useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { validatePassword } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const { changePassword, logout } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);
  const [errors, setErrors] = React.useState<{ current?: string; next?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = {
      current: current ? undefined : t.validation.currentRequired,
      next: validatePassword(next),
    };
    setErrors(nextErrors);
    if (nextErrors.current || nextErrors.next) return;

    setSubmitting(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INCORRECT_PASSWORD") {
        setErrors((prev) => ({ ...prev, current: getErrorMessage(err, t) }));
      } else {
        setFormError(getErrorMessage(err, t));
      }
      setSubmitting(false);
    }
  }

  async function finishAndSignIn() {
    await logout();
    router.replace("/signin");
  }

  // Change succeeded - the backend revoked all sessions, so the user must sign in again.
  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="success">{t.settings.passwordChanged}</Alert>
        <Button size="lg" block onClick={finishAndSignIn}>
          {t.forms.continueToLogin}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Field label={t.forms.currentPassword} htmlFor="current-password" error={errors.current}>
        <div className="relative">
          <Input
            id="current-password"
            name="current-password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t.forms.currentPasswordPlaceholder}
            className="pr-11"
            value={current}
            invalid={!!errors.current}
            disabled={submitting}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            aria-label={showCurrent ? t.forms.hidePassword : t.forms.showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Field label={t.forms.newPassword} htmlFor="new-password" error={errors.next}>
        <div className="relative">
          <Input
            id="new-password"
            name="new-password"
            type={showNext ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t.forms.passwordPlaceholderMin}
            className="pr-11"
            value={next}
            invalid={!!errors.next}
            disabled={submitting}
            onChange={(e) => setNext(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNext((s) => !s)}
            aria-label={showNext ? t.forms.hidePassword : t.forms.showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" block loading={submitting}>
        {submitting ? t.forms.updating : t.forms.updatePassword}
      </Button>
    </form>
  );
}
