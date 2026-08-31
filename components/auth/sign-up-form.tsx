"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Eye, EyeOff, Store, User } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateUrl,
  PASSWORD_MIN,
} from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Role = "patient" | "pharmacist";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  pharmacistDegreeCertificateUrl?: string;
};

// Heading + button copy per role, so the single form reads correctly whether the
// visitor is signing up as a patient or applying as a pharmacy.
const copy: Record<Role, { title: string; description: string; cta: string; loading: string }> = {
  patient: {
    title: "Create your account",
    description: "Join PharmaLink to find medicines near you.",
    cta: "Sign Up",
    loading: "Signing up",
  },
  pharmacist: {
    title: "List your pharmacy",
    description: "Apply so nearby patients can find your stock.",
    cta: "Apply as a pharmacy",
    loading: "Submitting application",
  },
};

export function SignUpForm({ defaultRole = "patient" }: { defaultRole?: Role }) {
  const { signup, applyPharmacist, status } = useSession();
  const router = useRouter();

  const [role, setRole] = React.useState<Role>(defaultRole);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [certificateUrl, setCertificateUrl] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const isPharmacist = role === "pharmacist";

  // Switching account type shouldn't leave stale validation from the other mode.
  function changeRole(next: Role) {
    setRole(next);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: FieldErrors = {
      firstName: validateRequired(firstName, "First name"),
      lastName: validateRequired(lastName, "Last name"),
      email: validateEmail(email),
      password: validatePassword(password),
      phone: validatePhone(phone),
      pharmacistDegreeCertificateUrl: isPharmacist
        ? validateUrl(certificateUrl, "Pharmacy degree certificate URL")
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
      // Account isn't created yet — go verify the OTP, carrying the email along.
      router.push(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_TAKEN") {
        setErrors((prev) => ({ ...prev, email: "This email is already registered." }));
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const c = copy[role];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
        <p className="mt-1.5 text-muted-foreground">{c.description}</p>
      </div>

      <SegmentedControl
        ariaLabel="Account type"
        value={role}
        onChange={changeRole}
        disabled={submitting}
        options={[
          { value: "patient", label: "Patient", icon: User },
          { value: "pharmacist", label: "Pharmacist", icon: Store },
        ]}
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field label="First name" htmlFor="first_name" error={errors.firstName}>
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

        <Field label="Last name" htmlFor="last_name" error={errors.lastName}>
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

        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            invalid={!!errors.email}
            disabled={submitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Phone number" htmlFor="phone" error={errors.phone}>
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
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint={`At least ${PASSWORD_MIN} characters.`}
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              className="pr-11"
              value={password}
              invalid={!!errors.password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {/* Pharmacy details — only for pharmacist applications; reviewed by an admin. */}
        {isPharmacist && (
          <>
            <div className="border-t border-border pt-5">
              <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Pharmacy details
              </p>
              <p className="text-xs text-muted-foreground">
                An admin reviews your degree certificate before your pharmacy goes live.
              </p>
            </div>

            <Field
              label="Pharmacy degree certificate URL"
              htmlFor="pharmacist_degree_certificate_url"
              error={errors.pharmacistDegreeCertificateUrl}
            >
              <Input
                id="pharmacist_degree_certificate_url"
                name="pharmacistDegreeCertificateUrl"
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://example.com/certificate.pdf"
                value={certificateUrl}
                invalid={!!errors.pharmacistDegreeCertificateUrl}
                disabled={submitting}
                onChange={(e) => setCertificateUrl(e.target.value)}
              />
            </Field>
          </>
        )}

        <Button type="submit" size="lg" block loading={submitting}>
          {submitting ? c.loading : c.cta}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary hover:text-primary-hover">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
