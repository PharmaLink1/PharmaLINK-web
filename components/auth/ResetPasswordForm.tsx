"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ApiError } from "@/lib/api/client";
import { resetPassword } from "@/lib/api/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

type PasswordErrorCode = "empty" | "tooShort";
type ConfirmErrorCode = "empty" | "mismatch";
type FormErrorCode = "expiredToken" | "generic";

const NEW_PASSWORD_INPUT_ID = "new-password";

/**
 * Screen B — "Set New Password" (Page 5 PRD §1/§5.4). Only reachable with
 * a verified reset token (the page component redirects otherwise). Two
 * fields — New password + Confirm password — per Figma node 42:1207,
 * which resolved the PRD's earlier open question ("add Confirm password?
 * say if you want it") in favor of adding it.
 */
export function ResetPasswordForm({ resetToken }: { resetToken: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<PasswordErrorCode | null>(null);
  const [confirmError, setConfirmError] = useState<ConfirmErrorCode | null>(null);
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Focused imperatively (not the native `autoFocus` attribute) so it
    // can't combine with blur-validation to flash an "empty" error before
    // the user has touched anything — see the bug note on validateOnBlur.
    document.getElementById(NEW_PASSWORD_INPUT_ID)?.focus();
  }, []);

  useEffect(() => {
    if (!formErrorCode) return;
    const timer = setTimeout(() => setFormErrorCode(null), 8000);
    return () => clearTimeout(timer);
  }, [formErrorCode]);

  function validatePassword(value: string): PasswordErrorCode | null {
    if (!value) return "empty";
    if (value.length < MIN_PASSWORD_LENGTH) return "tooShort";
    return null;
  }

  function validateConfirm(value: string, against: string): ConfirmErrorCode | null {
    if (!value) return "empty";
    if (value !== against) return "mismatch";
    return null;
  }

  /**
   * Only flags a REAL mistake on blur (a format problem or a mismatch),
   * never "this is empty" just because the user tabbed through without
   * typing yet — that eager check stays for the final submit only, so
   * clicking in and back out of an untouched field never shows an error.
   */
  function handlePasswordBlur() {
    if (!newPassword) return;
    setPasswordError(validatePassword(newPassword));
  }
  function handleConfirmBlur() {
    if (!confirmPassword) return;
    setConfirmError(validateConfirm(confirmPassword, newPassword));
  }

  const passwordErrorText: Record<PasswordErrorCode, string> = {
    empty: t.forgotPassword.validationPassword,
    tooShort: t.forgotPassword.validationPassword,
  };
  const confirmErrorText: Record<ConfirmErrorCode, string> = {
    empty: t.forgotPassword.validationConfirmEmpty,
    mismatch: t.forgotPassword.validationConfirmMismatch,
  };
  const formErrorText: Record<FormErrorCode, string> = {
    expiredToken: t.common.errorGeneric,
    generic: t.common.errorGeneric,
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const passwordErr = validatePassword(newPassword);
    const confirmErr = validateConfirm(confirmPassword, newPassword);
    setPasswordError(passwordErr);
    setConfirmError(confirmErr);
    if (passwordErr || confirmErr) return;

    setFormErrorCode(null);
    setIsSubmitting(true);
    try {
      await resetPassword(resetToken, newPassword);
      router.push("/login?resetSuccess=1");
    } catch (err) {
      setFormErrorCode(err instanceof ApiError && err.status === 400 ? "expiredToken" : "generic");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !isOnline;

  return (
    <div className="flex flex-col gap-4">
      {!isOnline && <Callout variant="error">{t.forgotPassword.offlineBanner}</Callout>}
      {isOnline && formErrorCode && <Callout variant="error">{formErrorText[formErrorCode]}</Callout>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PasswordInput
            id={NEW_PASSWORD_INPUT_ID}
            label={t.forgotPassword.newPasswordLabel}
            placeholder={t.forgotPassword.newPasswordPlaceholder}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            autoComplete="new-password"
            disabled={isDisabled}
            error={passwordError ? passwordErrorText[passwordError] : undefined}
            required
          />
          {!passwordError && (
            <p className="text-[13px] text-[var(--color-text-secondary)]">{t.forgotPassword.passwordHint}</p>
          )}
        </div>

        <PasswordInput
          id="confirm-password"
          label={t.forgotPassword.confirmPasswordLabel}
          placeholder={t.forgotPassword.confirmPasswordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={handleConfirmBlur}
          autoComplete="new-password"
          disabled={isDisabled}
          error={confirmError ? confirmErrorText[confirmError] : undefined}
          required
        />

        <Button type="submit" disabled={isDisabled} className="mt-2 w-full">
          {isSubmitting ? t.forgotPassword.resetting : t.forgotPassword.resetPasswordButton}
        </Button>
      </form>
    </div>
  );
}
