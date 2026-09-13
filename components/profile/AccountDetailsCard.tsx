"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { EMAIL_REGEX, MOBILE_PHONE_REGEX } from "@/lib/validation";

// Same "store codes, not resolved strings" idiom as LoginForm/PatientRegistrationForm.
type NameErrorCode = "empty";
type PhoneErrorCode = "empty" | "invalid";
type EmailErrorCode = "empty" | "invalid";
type FormErrorCode = "generic";

interface FieldErrorCodes {
  name?: NameErrorCode;
  phone?: PhoneErrorCode;
  email?: EmailErrorCode;
}

const SAVED_CONFIRMATION_MS = 4000;

/**
 * Card 2 — Account details, extracted from the Figma frame (node 45:1259,
 * "Section - 2. Account Details"): read-only rows by default, with an
 * Edit button that swaps the card into an editable form in place (Page 11
 * PRD §5.1–§5.2, §6). No navigation — editing happens on this same card.
 */
export function AccountDetailsCard() {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fieldErrorCodes, setFieldErrorCodes] = useState<FieldErrorCodes>({});
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedConfirmationVisible, setSavedConfirmationVisible] = useState(false);

  useEffect(() => {
    if (!savedConfirmationVisible) return;
    const timer = setTimeout(() => setSavedConfirmationVisible(false), SAVED_CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [savedConfirmationVisible]);

  function validateName(value: string): NameErrorCode | undefined {
    return value.trim() ? undefined : "empty";
  }
  function validatePhone(value: string): PhoneErrorCode | undefined {
    if (!value.trim()) return "empty";
    return MOBILE_PHONE_REGEX.test(value.trim()) ? undefined : "invalid";
  }
  function validateEmail(value: string): EmailErrorCode | undefined {
    if (!value.trim()) return "empty";
    return EMAIL_REGEX.test(value.trim()) ? undefined : "invalid";
  }

  const nameErrorText: Record<NameErrorCode, string> = { empty: t.signup.validationName };
  const phoneErrorText: Record<PhoneErrorCode, string> = {
    empty: t.signup.validationPhone,
    invalid: t.signup.validationPhone,
  };
  const emailErrorText: Record<EmailErrorCode, string> = {
    empty: t.signup.validationEmail,
    invalid: t.signup.validationEmail,
  };
  const formErrorText: Record<FormErrorCode, string> = { generic: t.common.errorGeneric };

  function startEditing() {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setEmail(user?.email ?? "");
    setFieldErrorCodes({});
    setFormErrorCode(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setFieldErrorCodes({});
    setFormErrorCode(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    const emailError = validateEmail(email);
    setFieldErrorCodes({ name: nameError, phone: phoneError, email: emailError });
    if (nameError || phoneError || emailError) return;

    setFormErrorCode(null);
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      setIsEditing(false);
      setSavedConfirmationVisible(true);
    } catch {
      setFormErrorCode("generic");
    } finally {
      setIsSaving(false);
    }
  }

  const isDisabled = isSaving || !isOnline;

  return (
    <div className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-[41px]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{t.profile.accountDetailsHeading}</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-brand)] px-[17px] py-[9px] text-sm font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
          >
            {t.profile.editButton}
          </button>
        )}
      </div>

      {!isOnline && <Callout variant="error">{t.profile.offlineBanner}</Callout>}
      {isOnline && formErrorCode && <Callout variant="error">{formErrorText[formErrorCode]}</Callout>}
      {savedConfirmationVisible && !isEditing && (
        <p className="text-sm font-medium text-[var(--color-brand)]" role="status">
          {t.profile.savedConfirmation}
        </p>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            id="profile-name"
            label={t.profile.fullNameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, name: validateName(name) }))}
            autoComplete="name"
            disabled={isDisabled}
            error={fieldErrorCodes.name ? nameErrorText[fieldErrorCodes.name] : undefined}
            required
          />
          <Input
            id="profile-phone"
            label={t.profile.phoneNumberLabel}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, phone: validatePhone(phone) }))}
            autoComplete="tel"
            disabled={isDisabled}
            error={fieldErrorCodes.phone ? phoneErrorText[fieldErrorCodes.phone] : undefined}
            required
          />
          <Input
            id="profile-email"
            label={t.profile.emailAddressLabel}
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, email: validateEmail(email) }))}
            autoComplete="email"
            disabled={isDisabled}
            error={fieldErrorCodes.email ? emailErrorText[fieldErrorCodes.email] : undefined}
            required
          />

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isDisabled} className="flex-1">
              {isSaving ? t.profile.saving : t.profile.saveChangesButton}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelEditing} disabled={isSaving} className="flex-1">
              {t.profile.cancelButton}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col">
          <ReadOnlyRow label={t.profile.fullNameLabel} value={user?.name} />
          <ReadOnlyRow label={t.profile.phoneNumberLabel} value={user?.phone} />
          <ReadOnlyRow label={t.profile.emailAddressLabel} value={user?.email} last />
        </div>
      )}
    </div>
  );
}

function ReadOnlyRow({ label, value, last = false }: { label: string; value?: string; last?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 py-4 ${last ? "" : "border-b border-[var(--color-border)]"}`}>
      <p className="text-[13px] text-[var(--color-text-secondary)]">{label}</p>
      <p className="text-base text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}
