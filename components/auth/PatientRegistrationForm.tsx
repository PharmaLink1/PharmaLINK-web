"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ApiError } from "@/lib/api/client";
import { EMAIL_REGEX, MOBILE_PHONE_REGEX, MIN_PASSWORD_LENGTH } from "@/lib/validation";

// Same "store codes, not resolved strings" pattern as LoginForm, so errors
// re-translate immediately on a language switch instead of sticking.
type NameErrorCode = "empty";
type EmailErrorCode = "invalid";
type PhoneErrorCode = "empty" | "invalid";
type PasswordErrorCode = "empty" | "tooShort";
type TermsErrorCode = "required";
type FormErrorCode = "accountExists" | "generic";

interface FieldErrorCodes {
  name?: NameErrorCode;
  email?: EmailErrorCode;
  phone?: PhoneErrorCode;
  password?: PasswordErrorCode;
  terms?: TermsErrorCode;
}

const FORM_ERROR_AUTO_DISMISS_MS = 8000;

export function PatientRegistrationForm() {
  const { signupPatient } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrorCodes, setFieldErrorCodes] = useState<FieldErrorCodes>({});
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!formErrorCode) return;
    const timer = setTimeout(() => setFormErrorCode(null), FORM_ERROR_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [formErrorCode]);

  function validateName(value: string): NameErrorCode | undefined {
    if (!value.trim()) return "empty";
    return undefined;
  }

  function validateEmail(value: string): EmailErrorCode | undefined {
    // Optional field (Page 3 PRD §10/key decisions) — only validated if filled in.
    if (!value.trim()) return undefined;
    if (!EMAIL_REGEX.test(value)) return "invalid";
    return undefined;
  }

  function validatePhone(value: string): PhoneErrorCode | undefined {
    if (!value.trim()) return "empty";
    if (!MOBILE_PHONE_REGEX.test(value.trim())) return "invalid";
    return undefined;
  }

  function validatePassword(value: string): PasswordErrorCode | undefined {
    if (!value) return "empty";
    if (value.length < MIN_PASSWORD_LENGTH) return "tooShort";
    return undefined;
  }

  const nameErrorText: Record<NameErrorCode, string> = { empty: t.signup.validationName };
  const emailErrorText: Record<EmailErrorCode, string> = { invalid: t.signup.validationEmail };
  const phoneErrorText: Record<PhoneErrorCode, string> = {
    empty: t.signup.validationPhone,
    invalid: t.signup.validationPhone,
  };
  const passwordErrorText: Record<PasswordErrorCode, string> = {
    empty: t.signup.validationPassword,
    tooShort: t.signup.validationPassword,
  };
  const termsErrorText: Record<TermsErrorCode, string> = { required: t.signup.validationTerms };
  const formErrorText: Record<FormErrorCode, string> = {
    accountExists: t.signup.accountExists,
    generic: t.common.errorGeneric,
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);
    const termsError: TermsErrorCode | undefined = agreedToTerms ? undefined : "required";
    setFieldErrorCodes({ name: nameError, email: emailError, phone: phoneError, password: passwordError, terms: termsError });
    if (nameError || emailError || phoneError || passwordError || termsError) return;

    setFormErrorCode(null);
    setIsSubmitting(true);
    try {
      await signupPatient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        preferredLanguage: language,
      });
      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormErrorCode("accountExists");
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
      {!isOnline && <Callout variant="error">{t.signup.offlineBanner}</Callout>}
      {isOnline && formErrorCode && <Callout variant="error">{formErrorText[formErrorCode]}</Callout>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="name"
          label={t.signup.fullNameLabel}
          type="text"
          placeholder={t.signup.fullNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, name: validateName(name) }))}
          autoComplete="name"
          disabled={isDisabled}
          error={fieldErrorCodes.name ? nameErrorText[fieldErrorCodes.name] : undefined}
          required
        />

        <Input
          id="email"
          label={t.signup.emailLabel}
          type="email"
          inputMode="email"
          placeholder={t.signup.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, email: validateEmail(email) }))}
          autoComplete="email"
          disabled={isDisabled}
          error={fieldErrorCodes.email ? emailErrorText[fieldErrorCodes.email] : undefined}
        />

        <Input
          id="phone"
          label={t.signup.phoneLabel}
          type="tel"
          inputMode="tel"
          placeholder={t.signup.phonePlaceholder}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, phone: validatePhone(phone) }))}
          autoComplete="tel"
          disabled={isDisabled}
          error={fieldErrorCodes.phone ? phoneErrorText[fieldErrorCodes.phone] : undefined}
          required
        />

        <div className="flex flex-col gap-2">
          <PasswordInput
            id="password"
            label={t.signup.passwordLabel}
            placeholder={t.signup.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, password: validatePassword(password) }))}
            autoComplete="new-password"
            disabled={isDisabled}
            error={fieldErrorCodes.password ? passwordErrorText[fieldErrorCodes.password] : undefined}
            required
          />
          {!fieldErrorCodes.password && (
            <p className="text-[13px] text-[var(--color-text-secondary)]">{t.signup.passwordHint}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setFieldErrorCodes((prev) => ({ ...prev, terms: undefined }));
              }}
              disabled={isDisabled}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-focus)]/40"
            />
            <span className="text-sm text-[var(--color-text-primary)]">
              {t.signup.termsPrefix}
              <Link href="/terms" className="font-medium text-[var(--color-brand)] hover:underline">
                {t.signup.termsOfService}
              </Link>
              {t.signup.termsAnd}
              <Link href="/privacy" className="font-medium text-[var(--color-brand)] hover:underline">
                {t.signup.privacyPolicy}
              </Link>
              {t.signup.termsSuffix}
            </span>
          </label>
          {fieldErrorCodes.terms && (
            <p className="pl-8 text-sm text-[var(--color-error)]" aria-live="polite">
              {termsErrorText[fieldErrorCodes.terms]}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isDisabled} className="mt-2 w-full">
          {isSubmitting ? t.signup.creatingAccountButton : t.signup.createAccountButton}
        </Button>
      </form>

      <p className="text-center text-sm font-medium text-[var(--color-text-primary)]">
        {t.signup.alreadyHaveAccount}{" "}
        <Link href="/login" className="text-[var(--color-brand)] hover:underline">
          {t.signup.logIn}
        </Link>
      </p>
    </div>
  );
}
