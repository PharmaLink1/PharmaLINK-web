"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-types";
import { validatePassword } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const { changePassword, logout } = useSession();
  const router = useRouter();

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);
  const [errors, setErrors] = React.useState<{ current?: string; next?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors = {
      current: current ? undefined : "Current password is required.",
      next: validatePassword(next),
    };
    setErrors(nextErrors);
    if (nextErrors.current || nextErrors.next) return;

    setSubmitting(true);
    try {
      await changePassword({ current_password: current, new_password: next });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INCORRECT_PASSWORD") {
        setErrors((prev) => ({ ...prev, current: "That's not your current password." }));
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  async function finishAndSignIn() {
    await logout();
    router.replace("/signin");
  }

  // Change succeeded — the backend revoked all sessions, so the user must sign in again.
  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="success">
          Your password has been changed. For your security, you&apos;ve been signed out
          everywhere — please sign in again with your new password.
        </Alert>
        <Button size="lg" block onClick={finishAndSignIn}>
          Continue to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Field label="Current password" htmlFor="current-password" error={errors.current}>
        <div className="relative">
          <Input
            id="current-password"
            name="current-password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your current password"
            className="pr-11"
            value={current}
            invalid={!!errors.current}
            disabled={submitting}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Field label="New password" htmlFor="new-password" error={errors.next}>
        <div className="relative">
          <Input
            id="new-password"
            name="new-password"
            type={showNext ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="pr-11"
            value={next}
            invalid={!!errors.next}
            disabled={submitting}
            onChange={(e) => setNext(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNext((s) => !s)}
            aria-label={showNext ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" block loading={submitting}>
        {submitting ? "Updating" : "Update password"}
      </Button>
    </form>
  );
}
