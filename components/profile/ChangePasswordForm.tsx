"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { ChevronDownIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ApiError } from "@/lib/api/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

type CurrentPasswordErrorCode = "empty" | "incorrect";
type NewPasswordErrorCode = "empty" | "tooShort";
type FormErrorCode = "generic";

const CONFIRMATION_AUTO_DISMISS_MS = 4000;

/**
 * "Change password" row + its sub-form, extracted from the Figma frame
 * (node 45:1259, "Section - 4. Account Actions"). This is an AUTHENTICATED
 * flow (current password verified server-side) — explicitly not Page 5's
 * OTP-based reset, since the user is already logged in here (Page 11 PRD
 * §5.6, §11).
 */
export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState<CurrentPasswordErrorCode | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<NewPasswordErrorCode | null>(null);
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    if (!confirmationVisible) return;
    const timer = setTimeout(() => setConfirmationVisible(false), CONFIRMATION_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [confirmationVisible]);

  const currentPasswordErrorText: Record<CurrentPasswordErrorCode, string> = {
    empty: t.signup.validationRequired,
    incorrect: t.profile.wrongCurrentPassword,
  };
  const newPasswordErrorText: Record<NewPasswordErrorCode, string> = {
    empty: t.signup.validationPassword,
    tooShort: t.signup.validationPassword,
  };

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setFormErrorCode(null);
  }

  function toggleOpen() {
    if (isOpen) reset();
    setIsOpen((v) => !v);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const currentError: CurrentPasswordErrorCode | null = currentPassword ? null : "empty";
    const newError: NewPasswordErrorCode | null = !newPassword
      ? "empty"
      : newPassword.length < MIN_PASSWORD_LENGTH
        ? "tooShort"
        : null;
    setCurrentPasswordError(currentError);
    setNewPasswordError(newError);
    if (currentError || newError) return;

    setFormErrorCode(null);
    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      reset();
      setIsOpen(false);
      setConfirmationVisible(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setCurrentPasswordError("incorrect");
      } else {
        setFormErrorCode("generic");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !isOnline;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 border-b border-[var(--color-border)] py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
      >
        <span className="text-base text-[var(--color-text-primary)]">{t.profile.changePasswordRow}</span>
        <ChevronDownIcon
          className={`text-[var(--color-text-secondary)] transition-transform ${isOpen ? "rotate-180" : "-rotate-90"}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] py-5">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{t.profile.changePasswordHeading}</h3>

          {!isOnline && <Callout variant="error">{t.profile.offlineBanner}</Callout>}
          {isOnline && formErrorCode && <Callout variant="error">{t.common.errorGeneric}</Callout>}
          {confirmationVisible && (
            <p className="text-sm font-medium text-[var(--color-brand)]" role="status">
              {t.profile.passwordUpdated}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <PasswordInput
              id="current-password"
              label={t.profile.currentPasswordLabel}
              placeholder={t.profile.currentPasswordPlaceholder}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isDisabled}
              error={currentPasswordError ? currentPasswordErrorText[currentPasswordError] : undefined}
              required
            />
            <div className="flex flex-col gap-2">
              <PasswordInput
                id="new-password"
                label={t.profile.newPasswordLabel}
                placeholder={t.profile.newPasswordPlaceholder}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isDisabled}
                error={newPasswordError ? newPasswordErrorText[newPasswordError] : undefined}
                required
              />
              {!newPasswordError && (
                <p className="text-[13px] text-[var(--color-text-secondary)]">{t.profile.passwordHint}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={isDisabled} className="flex-1">
                {isSubmitting ? t.profile.updating : t.profile.updatePasswordButton}
              </Button>
              <Button type="button" variant="secondary" onClick={toggleOpen} disabled={isSubmitting} className="flex-1">
                {t.profile.cancelButton}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
