"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ApiError } from "@/lib/api/client";
import { requestPasswordReset, verifyResetCode } from "@/lib/api/auth";
import { EMAIL_REGEX } from "@/lib/validation";

// Same "store codes, not resolved strings" idiom as LoginForm, so errors
// re-translate immediately on a language switch.
type EmailErrorCode = "empty" | "invalid";
type CodeErrorCode = "empty" | "invalid";
type FormErrorCode = "generic" | "rateLimited";

const RESEND_COOLDOWN_SECONDS = 30;
const FORM_ERROR_AUTO_DISMISS_MS = 8000;
const CODE_INPUT_ID = "fp-code";

/**
 * Screen A — "Forgot Password" (Page 5 PRD §1/§5). Email + Send code, then
 * the reset-code field + Verify code reveal in place once a code is sent —
 * a single page, progressive reveal, not a route change. Screen B ("Set
 * New Password") is a genuinely separate route, handled by
 * ResetPasswordForm.tsx.
 */
export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailError, setEmailError] = useState<EmailErrorCode | null>(null);
  const [codeError, setCodeError] = useState<CodeErrorCode | null>(null);
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!formErrorCode) return;
    const timer = setTimeout(() => setFormErrorCode(null), FORM_ERROR_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [formErrorCode]);

  // 30s resend cooldown countdown — digits only, no translation needed
  // (same reasoning as the relative-time text elsewhere in the app: the
  // dictionary has no string-interpolation support yet).
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    // Move focus to the reset-code field the moment it reveals (PRD §8).
    if (codeSent) document.getElementById(CODE_INPUT_ID)?.focus();
  }, [codeSent]);

  function validateEmail(value: string): EmailErrorCode | null {
    if (!value.trim()) return "empty";
    if (!EMAIL_REGEX.test(value)) return "invalid";
    return null;
  }

  const emailErrorText: Record<EmailErrorCode, string> = {
    empty: t.forgotPassword.validationEmptyEmail,
    invalid: t.forgotPassword.validationInvalidEmail,
  };
  const codeErrorText: Record<CodeErrorCode, string> = {
    empty: t.forgotPassword.validationEmptyCode,
    invalid: t.forgotPassword.invalidCode,
  };
  const formErrorText: Record<FormErrorCode, string> = {
    generic: t.common.errorGeneric,
    rateLimited: t.forgotPassword.rateLimited,
  };

  async function sendCode() {
    setFormErrorCode(null);
    setIsSendingCode(true);
    try {
      await requestPasswordReset(email.trim());
      setCodeSent(true);
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setFormErrorCode(err instanceof ApiError && err.status === 429 ? "rateLimited" : "generic");
    } finally {
      setIsSendingCode(false);
    }
  }

  function handleChangeEmail() {
    setCodeSent(false);
    setCode("");
    setCodeError(null);
    setCooldownSeconds(0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!codeSent) {
      const error = validateEmail(email);
      setEmailError(error);
      if (error) return;
      await sendCode();
      return;
    }

    if (!code.trim()) {
      setCodeError("empty");
      return;
    }
    setCodeError(null);
    setFormErrorCode(null);
    setIsVerifying(true);
    try {
      const { resetToken } = await verifyResetCode(email.trim(), code.trim());
      router.push(`/forgot-password/reset?token=${encodeURIComponent(resetToken)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setCodeError("invalid");
      } else if (err instanceof ApiError && err.status === 429) {
        setFormErrorCode("rateLimited");
      } else {
        setFormErrorCode("generic");
      }
    } finally {
      setIsVerifying(false);
    }
  }

  const isDisabled = isSendingCode || isVerifying || !isOnline;

  return (
    <div className="flex flex-col gap-4">
      {!isOnline && <Callout variant="error">{t.forgotPassword.offlineBanner}</Callout>}
      {isOnline && formErrorCode && <Callout variant="error">{formErrorText[formErrorCode]}</Callout>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="fp-email" className="text-sm font-medium text-[var(--color-text-primary)]">
              {t.forgotPassword.emailLabel}
            </label>
            {codeSent && (
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-[15px] font-medium text-[var(--color-brand)] hover:underline"
              >
                {t.forgotPassword.changeEmailLink}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input
                id="fp-email"
                type="email"
                inputMode="email"
                placeholder={t.forgotPassword.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => !codeSent && setEmailError(validateEmail(email))}
                autoComplete="email"
                readOnly={codeSent}
                disabled={!codeSent && isDisabled}
                error={!codeSent && emailError ? emailErrorText[emailError] : undefined}
                showErrorText={false}
                required
              />
            </div>
            {!codeSent && (
              <button
                type="submit"
                disabled={isDisabled}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-brand)] px-5 text-base font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingCode ? t.forgotPassword.sending : t.forgotPassword.sendCodeButton}
              </button>
            )}
          </div>
          {!codeSent && emailError && (
            <p className="text-sm text-[var(--color-error)]" aria-live="polite">
              {emailErrorText[emailError]}
            </p>
          )}
        </div>

        {codeSent && (
          <>
            <p className="text-[13px] text-[var(--color-text-secondary)]">{t.forgotPassword.sentConfirmation}</p>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={CODE_INPUT_ID} className="text-sm font-medium text-[var(--color-text-primary)]">
                  {t.forgotPassword.resetCodeLabel}
                </label>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={cooldownSeconds > 0 || isSendingCode}
                  className="text-[15px] font-medium text-[var(--color-brand)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--color-text-placeholder)] disabled:no-underline"
                >
                  {cooldownSeconds > 0
                    ? `${t.forgotPassword.resendLink} (0:${cooldownSeconds.toString().padStart(2, "0")})`
                    : t.forgotPassword.resendLink}
                </button>
              </div>
              <Input
                id={CODE_INPUT_ID}
                inputMode="numeric"
                placeholder={t.forgotPassword.resetCodePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onBlur={() => setCodeError(code.trim() ? null : "empty")}
                disabled={isDisabled}
                error={codeError ? codeErrorText[codeError] : undefined}
                className="tracking-[0.1em]"
                required
              />
            </div>

            <Button type="submit" disabled={isDisabled || !code.trim()} className="mt-2 w-full">
              {isVerifying ? t.forgotPassword.verifying : t.forgotPassword.verifyCodeButton}
            </Button>
          </>
        )}
      </form>

      <p className="text-center text-base text-[var(--color-text-secondary)]">
        {t.forgotPassword.loginRowText}
        <Link href="/login" className="text-[15px] font-medium text-[var(--color-brand)] hover:underline">
          {t.forgotPassword.loginRowLink}
        </Link>
      </p>
    </div>
  );
}
