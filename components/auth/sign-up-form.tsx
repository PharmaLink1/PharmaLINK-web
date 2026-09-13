"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Eye, EyeOff, Store, User } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import { useLanguage, interpolate } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  PASSWORD_MIN,
} from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CertificateUploader } from "@/components/auth/certificate-uploader";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

type Role = "patient" | "pharmacist";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  pharmacistDegreeCertificateUrl?: string;
};

export function SignUpForm({ defaultRole = "patient" }: { defaultRole?: Role }) {
  const { signup, applyPharmacist, status } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  const [role, setRole] = React.useState<Role>(defaultRole);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [certificateUrl, setCertificateUrl] = React.useState("");
  const [uploadBusy, setUploadBusy] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const isPharmacist = role === "pharmacist";
  const c = t.forms.roles[role];
  const cloudinaryConfigured = isCloudinaryConfigured();

  // Switching account type shouldn't leave stale validation from the other mode.
  function changeRole(next: Role) {
    setRole(next);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploadBusy) return;
    setFormError(null);

    const nextErrors: FieldErrors = {
      firstName: validateRequired(firstName, t.forms.firstName),
      lastName: validateRequired(lastName, t.forms.lastName),
      email: validateEmail(email),
      password: validatePassword(password),
      phone: validatePhone(phone),
      pharmacistDegreeCertificateUrl: isPharmacist
        ? validateRequired(certificateUrl, t.forms.certificateLabel)
        : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const cleanEmail = email.trim();
    setSubmitting(true);
    try {
      const base = {
        email: cleanEmail,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      };
      if (isPharmacist) {
        await applyPharmacist({ ...base, pharmacistDegreeCertificateUrl: certificateUrl.trim() });
      } else {
        await signup(base);
      }
      // Account isn't created yet - go verify the OTP, carrying the email along.
      router.push("/verify-otp?email=" + encodeURIComponent(cleanEmail));
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_TAKEN") {
        setErrors((prev) => ({ ...prev, email: getErrorMessage(err, t) }));
      } else {
        setFormError(getErrorMessage(err, t));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
        <p className="mt-1.5 text-muted-foreground">{c.description}</p>
      </div>

      <SegmentedControl
        ariaLabel={t.forms.accountType}
        value={role}
        onChange={changeRole}
        disabled={submitting || uploadBusy}
        options={[
          { value: "patient", label: t.forms.roles.patient.label, icon: User },
          { value: "pharmacist", label: t.forms.roles.pharmacist.label, icon: Store },
        ]}
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field label={t.forms.firstName} htmlFor="first_name" error={errors.firstName}>
          <Input
            id="first_name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Selamawit"
            value={firstName}
            invalid={!!errors.firstName}
            disabled={submitting}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Field>

        <Field label={t.forms.lastName} htmlFor="last_name" error={errors.lastName}>
          <Input
            id="last_name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Bekele"
            value={lastName}
            invalid={!!errors.lastName}
            disabled={submitting}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Field>

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

        <Field label={t.forms.phone} htmlFor="phone" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+251911234567"
            value={phone}
            invalid={!!errors.phone}
            disabled={submitting}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field
          label={t.forms.password}
          htmlFor="password"
          error={errors.password}
          hint={interpolate(t.forms.passwordHint, { min: PASSWORD_MIN })}
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t.forms.passwordPlaceholderCreate}
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

        {/* Pharmacy details - only for pharmacist applications; reviewed by an admin. */}
        {isPharmacist && (
          <>
            <div className="border-t border-border pt-5">
              <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {t.forms.pharmacyDetails}
              </p>
              <p className="text-xs text-muted-foreground">{t.forms.pharmacyDetailsHint}</p>
            </div>

            <Field
              label={t.forms.certificateLabel}
              htmlFor="degree_certificate"
              error={errors.pharmacistDegreeCertificateUrl}
              hint={cloudinaryConfigured ? t.forms.certificateHint : undefined}
            >
              <CertificateUploader
                id="degree_certificate"
                url={certificateUrl}
                disabled={submitting}
                onUrlChange={setCertificateUrl}
                onBusyChange={setUploadBusy}
              />
            </Field>
          </>
        )}

        <Button type="submit" size="lg" block loading={submitting} disabled={uploadBusy}>
          {submitting ? c.loading : c.cta}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t.forms.hasAccount}{" "}
          <Link href="/signin" className="font-medium text-primary-strong hover:underline">
            {t.forms.login}
          </Link>
        </p>
      </form>
    </div>
  );
}
