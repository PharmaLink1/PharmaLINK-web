"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ApiError } from "@/lib/api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Error state is stored as codes, not pre-resolved strings, so switching
// language while an error is showing re-translates it immediately instead
// of leaving it stuck in whichever language was active when it appeared.
type EmailErrorCode = "empty" | "invalid";
type PasswordErrorCode = "empty";
type FormErrorCode = "invalidCredentials" | "tooManyAttempts" | "generic";

interface FieldErrorCodes {
  email?: EmailErrorCode;
  password?: PasswordErrorCode;
}

const FORM_ERROR_AUTO_DISMISS_MS = 8000;

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrorCodes, setFieldErrorCodes] = useState<FieldErrorCodes>({});
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transient banner errors (login failures) clear themselves after a few
  // seconds; persistent per-field errors (below) stay until the field is
  // actually fixed, since dismissing "email is required" while it's still
  // empty would be confusing.
  useEffect(() => {
    if (!formErrorCode) return;
    const timer = setTimeout(() => setFormErrorCode(null), FORM_ERROR_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [formErrorCode]);

  function validateEmail(value: string): EmailErrorCode | undefined {
    if (!value.trim()) return "empty";
    if (!EMAIL_REGEX.test(value)) return "invalid";
    return undefined;
  }

  function validatePassword(value: string): PasswordErrorCode | undefined {
    // Presence check only — Login checks an existing password, it does not
    // enforce strength (that belongs on Registration).
    if (!value) return "empty";
    return undefined;
  }

  const emailErrorText: Record<EmailErrorCode, string> = {
    empty: t.auth.emptyEmail,
    invalid: t.auth.invalidEmail,
  };
  const passwordErrorText: Record<PasswordErrorCode, string> = {
    empty: t.auth.emptyPassword,
  };
  const formErrorText: Record<FormErrorCode, string> = {
    invalidCredentials: t.auth.invalidCredentials,
    tooManyAttempts: t.auth.tooManyAttempts,
    generic: t.common.errorGeneric,
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setFieldErrorCodes({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setFormErrorCode(null);
    setIsSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      if (loggedInUser.role === "patient") {
        router.push("/home");
      } else {
        // TODO: pharmacy_staff/admin dashboards don't exist yet — send to
        // /home as a placeholder until those role-specific pages are built.
        router.push("/home");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormErrorCode("invalidCredentials");
      } else if (err instanceof ApiError && err.status === 429) {
        setFormErrorCode("tooManyAttempts");
      } else {
        setFormErrorCode("generic");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !isOnline;

  return (
    <div className="flex flex-col gap-4">
      {!isOnline && <Callout variant="error">{t.auth.offlineBanner}</Callout>}
      {isOnline && formErrorCode && <Callout variant="error">{formErrorText[formErrorCode]}</Callout>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="email"
          label={t.auth.identifierLabel}
          type="email"
          inputMode="email"
          placeholder={t.auth.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() =>
            setFieldErrorCodes((prev) => ({ ...prev, email: validateEmail(email) }))
          }
          autoComplete="email"
          disabled={isDisabled}
          error={fieldErrorCodes.email ? emailErrorText[fieldErrorCodes.email] : undefined}
          required
        />

        <div className="flex flex-col">
          <PasswordInput
            id="password"
            label={t.auth.passwordLabel}
            placeholder={t.auth.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() =>
              setFieldErrorCodes((prev) => ({ ...prev, password: validatePassword(password) }))
            }
            autoComplete="current-password"
            disabled={isDisabled}
            error={fieldErrorCodes.password ? passwordErrorText[fieldErrorCodes.password] : undefined}
            showLabel={t.auth.showPassword}
            hideLabel={t.auth.hidePassword}
            showErrorText={false}
            required
          />
          {/* The password error shares this row with the Forgot password link,
              so the link stays tight under the field (as designed) and an
              error appearing never shifts anything. */}
          <div className="mt-1 flex items-start justify-between gap-3">
            <p className="text-sm text-[var(--color-error)]" aria-live="polite">
              {fieldErrorCodes.password ? passwordErrorText[fieldErrorCodes.password] : ""}
            </p>
            <Link
              href="/forgot-password"
              className="shrink-0 text-[15px] font-medium text-[var(--color-brand)] hover:underline"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>
        </div>

        <div className="h-2" aria-hidden="true" />

        <Button type="submit" disabled={isDisabled} className="w-full">
          {isSubmitting ? t.auth.loggingIn : t.auth.loginButton}
        </Button>
      </form>
    </div>
  );
}
