"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { FormSectionHeader } from "@/components/auth/FormSectionHeader";
import { FileUploadDropzone } from "@/components/auth/FileUploadDropzone";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ApiError } from "@/lib/api/client";
import { EMAIL_REGEX, GENERAL_PHONE_REGEX, MOBILE_PHONE_REGEX, MIN_PASSWORD_LENGTH } from "@/lib/validation";

const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type NameErrorCode = "empty";
type EmailErrorCode = "invalid";
type PhoneErrorCode = "empty" | "invalid";
type PasswordErrorCode = "empty" | "tooShort";
type RequiredErrorCode = "empty";
type DocumentsErrorCode = "empty" | "type" | "size";
type TermsErrorCode = "required";
type FormErrorCode = "accountExists" | "generic";

interface FieldErrorCodes {
  name?: NameErrorCode;
  email?: EmailErrorCode;
  phone?: PhoneErrorCode;
  password?: PasswordErrorCode;
  pharmacyName?: RequiredErrorCode;
  address?: RequiredErrorCode;
  pharmacyPhone?: PhoneErrorCode;
  pharmacyId?: RequiredErrorCode;
  documents?: DocumentsErrorCode;
  terms?: TermsErrorCode;
}

const FORM_ERROR_AUTO_DISMISS_MS = 8000;

/**
 * Page 4's form, grouped into the 3 sections the PRD specifies (Your
 * details · Your pharmacy · Verification). Section 2's 4th field is
 * "Pharmacy ID", matching the Figma frame exactly (typo "Pharmancy ID"
 * corrected) per explicit confirmation this is wanted as shown, rather
 * than the PRD's "Working hours" field.
 *
 * Note: main prd.md §8's Pharmacy entity has an `hours` field used
 * elsewhere (Page 7 search results' "Open now"/"Closed" status), and this
 * form no longer collects it — that'll need to come from somewhere else
 * (e.g. the pharmacy dashboard, post-approval) if "open now" is still
 * meant to work.
 */
export function PharmacyRegistrationForm() {
  const { signupPharmacyStaff } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isOnline = useOnlineStatus();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [address, setAddress] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [pharmacyId, setPharmacyId] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrorCodes, setFieldErrorCodes] = useState<FieldErrorCodes>({});
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!formErrorCode) return;
    const timer = setTimeout(() => setFormErrorCode(null), FORM_ERROR_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [formErrorCode]);

  function validateRequired(value: string): RequiredErrorCode | undefined {
    return value.trim() ? undefined : "empty";
  }

  function validateEmail(value: string): EmailErrorCode | undefined {
    if (!value.trim()) return undefined; // optional, per Page 3/4 key decisions
    if (!EMAIL_REGEX.test(value)) return "invalid";
    return undefined;
  }

  function validateMobilePhone(value: string): PhoneErrorCode | undefined {
    if (!value.trim()) return "empty";
    if (!MOBILE_PHONE_REGEX.test(value.trim())) return "invalid";
    return undefined;
  }

  function validatePharmacyPhone(value: string): PhoneErrorCode | undefined {
    if (!value.trim()) return "empty";
    if (!GENERAL_PHONE_REGEX.test(value.trim())) return "invalid";
    return undefined;
  }

  function validatePassword(value: string): PasswordErrorCode | undefined {
    if (!value) return "empty";
    if (value.length < MIN_PASSWORD_LENGTH) return "tooShort";
    return undefined;
  }

  function validateDocuments(files: File[]): DocumentsErrorCode | undefined {
    if (files.length === 0) return "empty";
    if (files.some((f) => !ACCEPTED_FILE_TYPES.includes(f.type))) return "type";
    if (files.some((f) => f.size > MAX_FILE_SIZE_BYTES)) return "size";
    return undefined;
  }

  const requiredErrorText: Record<RequiredErrorCode, string> = { empty: t.signup.validationRequired };
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
  const documentsErrorText: Record<DocumentsErrorCode, string> = {
    empty: t.signup.validationDocumentRequired,
    type: t.signup.validationFileType,
    size: t.signup.validationFileSize,
  };
  const termsErrorText: Record<TermsErrorCode, string> = { required: t.signup.validationTerms };
  const formErrorText: Record<FormErrorCode, string> = {
    accountExists: t.signup.accountExists,
    generic: t.common.errorGeneric,
  };

  function handleDocumentsChange(files: File[]) {
    setDocuments(files);
    if (fieldErrorCodes.documents) {
      setFieldErrorCodes((prev) => ({ ...prev, documents: validateDocuments(files) }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FieldErrorCodes = {
      name: validateRequired(name) as NameErrorCode | undefined,
      email: validateEmail(email),
      phone: validateMobilePhone(phone),
      password: validatePassword(password),
      pharmacyName: validateRequired(pharmacyName),
      address: validateRequired(address),
      pharmacyPhone: validatePharmacyPhone(pharmacyPhone),
      pharmacyId: validateRequired(pharmacyId),
      documents: validateDocuments(documents),
      terms: agreedToTerms ? undefined : "required",
    };
    setFieldErrorCodes(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setFormErrorCode(null);
    setIsSubmitting(true);
    try {
      await signupPharmacyStaff({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        preferredLanguage: language,
        pharmacyName: pharmacyName.trim(),
        address: address.trim(),
        pharmacyPhone: pharmacyPhone.trim(),
        pharmacyId: pharmacyId.trim(),
        documents,
      });
      setIsSubmitted(true);
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

  if (isSubmitted) {
    return <Callout variant="warning">{t.signup.pendingReviewMessage}</Callout>;
  }

  const isDisabled = isSubmitting || !isOnline;

  return (
    <div className="flex flex-col gap-4">
      {!isOnline && <Callout variant="error">{t.signup.offlineBanner}</Callout>}
      {isOnline && formErrorCode && <Callout variant="error">{formErrorText[formErrorCode]}</Callout>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <FormSectionHeader title={t.signup.sectionYourDetails} />

          <Input
            id="name"
            label={t.signup.fullNameLabel}
            type="text"
            placeholder={t.signup.fullNamePlaceholderPharmacy}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, name: validateRequired(name) }))}
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
            placeholder={t.signup.emailPlaceholderPharmacy}
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
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, phone: validateMobilePhone(phone) }))}
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
        </div>

        <div className="flex flex-col gap-4">
          <FormSectionHeader title={t.signup.sectionYourPharmacy} />

          <Input
            id="pharmacyName"
            label={t.signup.pharmacyNameLabel}
            type="text"
            placeholder={t.signup.pharmacyNamePlaceholder}
            value={pharmacyName}
            onChange={(e) => setPharmacyName(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, pharmacyName: validateRequired(pharmacyName) }))}
            disabled={isDisabled}
            error={fieldErrorCodes.pharmacyName ? requiredErrorText[fieldErrorCodes.pharmacyName] : undefined}
            required
          />

          <Input
            id="address"
            label={t.signup.addressLabel}
            type="text"
            placeholder={t.signup.addressPlaceholder}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, address: validateRequired(address) }))}
            autoComplete="street-address"
            disabled={isDisabled}
            error={fieldErrorCodes.address ? requiredErrorText[fieldErrorCodes.address] : undefined}
            required
          />

          <Input
            id="pharmacyPhone"
            label={t.signup.pharmacyPhoneLabel}
            type="tel"
            inputMode="tel"
            placeholder={t.signup.pharmacyPhonePlaceholder}
            value={pharmacyPhone}
            onChange={(e) => setPharmacyPhone(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, pharmacyPhone: validatePharmacyPhone(pharmacyPhone) }))}
            disabled={isDisabled}
            error={fieldErrorCodes.pharmacyPhone ? phoneErrorText[fieldErrorCodes.pharmacyPhone] : undefined}
            required
          />

          <Input
            id="pharmacyId"
            label={t.signup.pharmacyIdLabel}
            type="text"
            placeholder={t.signup.pharmacyIdPlaceholder}
            value={pharmacyId}
            onChange={(e) => setPharmacyId(e.target.value)}
            onBlur={() => setFieldErrorCodes((prev) => ({ ...prev, pharmacyId: validateRequired(pharmacyId) }))}
            disabled={isDisabled}
            error={fieldErrorCodes.pharmacyId ? requiredErrorText[fieldErrorCodes.pharmacyId] : undefined}
            required
          />
        </div>

        <div className="flex flex-col gap-4">
          <FormSectionHeader title={t.signup.sectionVerification} />
          <p className="text-base leading-6 text-[var(--color-text-secondary)]">{t.signup.verificationExplainer}</p>
          <FileUploadDropzone
            files={documents}
            onFilesChange={handleDocumentsChange}
            chooseFileLabel={t.signup.chooseFile}
            hintText={t.signup.uploadHint}
            removeFileLabel={t.signup.removeFile}
            error={fieldErrorCodes.documents ? documentsErrorText[fieldErrorCodes.documents] : undefined}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
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
              <span className="text-base text-[var(--color-text-primary)]">
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

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isSubmitting ? t.signup.submittingButton : t.signup.submitForReviewButton}
          </Button>

          <p className="text-center text-base text-[var(--color-text-secondary)]">
            {t.signup.alreadyHaveAccount}{" "}
            <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">
              {t.signup.logIn}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
