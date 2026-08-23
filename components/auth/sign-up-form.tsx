"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Eye, EyeOff, Store, User } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validateRequired,
  PASSWORD_MIN,
} from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Role = "user" | "pharmacist";

type FieldErrors = {
  full_name?: string;
  email?: string;
  password?: string;
  pharmacy_name?: string;
  license_number?: string;
  address?: string;
};

// Heading + button copy per role, so the single form reads correctly whether the
// visitor is signing up as a patient or applying as a pharmacy.
const copy: Record<Role, { title: string; description: string; cta: string; loading: string }> = {
  user: {
    title: "Create your account",
    description: "Join PharmaLink to find medicines near you.",
    cta: "Create account",
    loading: "Creating account",
  },
  pharmacist: {
    title: "List your pharmacy",
    description: "Apply so nearby patients can find your stock.",
    cta: "Apply as a pharmacy",
    loading: "Submitting application",
  },
};

export function SignUpForm({ defaultRole = "user" }: { defaultRole?: Role }) {
  const { signup, applyPharmacist, status } = useSession();
  const router = useRouter();

  const [role, setRole] = React.useState<Role>(defaultRole);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pharmacyName, setPharmacyName] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [address, setAddress] = React.useState("");
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
      full_name: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      pharmacy_name: isPharmacist ? validateRequired(pharmacyName, "Pharmacy name") : undefined,
      license_number: isPharmacist ? validateRequired(licenseNumber, "License number") : undefined,
      address: isPharmacist ? validateRequired(address, "Address") : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const cleanEmail = email.trim();
    setSubmitting(true);
    try {
      if (isPharmacist) {
        await applyPharmacist({
          email: cleanEmail,
          password,
          full_name: fullName.trim(),
          pharmacy_name: pharmacyName.trim(),
          license_number: licenseNumber.trim(),
          address: address.trim(),
        });
      } else {
        await signup({ email: cleanEmail, password, full_name: fullName.trim() });
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
          { value: "user", label: "Patient", icon: User },
          { value: "pharmacist", label: "Pharmacist", icon: Store },
        ]}
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field label="Full name" htmlFor="full_name" error={errors.full_name}>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            placeholder="Selamawit Bekele"
            value={fullName}
            invalid={!!errors.full_name}
            disabled={submitting}
            onChange={(e) => setFullName(e.target.value)}
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
                An admin reviews these before your pharmacy goes live.
              </p>
            </div>

            <Field label="Pharmacy name" htmlFor="pharmacy_name" error={errors.pharmacy_name}>
              <Input
                id="pharmacy_name"
                name="pharmacy_name"
                autoComplete="organization"
                placeholder="Bole Pharmacy"
                value={pharmacyName}
                invalid={!!errors.pharmacy_name}
                disabled={submitting}
                onChange={(e) => setPharmacyName(e.target.value)}
              />
            </Field>

            <Field label="License number" htmlFor="license_number" error={errors.license_number}>
              <Input
                id="license_number"
                name="license_number"
                placeholder="ETH-PH-000000"
                value={licenseNumber}
                invalid={!!errors.license_number}
                disabled={submitting}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </Field>

            <Field label="Address" htmlFor="address" error={errors.address}>
              <Input
                id="address"
                name="address"
                autoComplete="street-address"
                placeholder="Bole Road, Addis Ababa"
                value={address}
                invalid={!!errors.address}
                disabled={submitting}
                onChange={(e) => setAddress(e.target.value)}
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
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
