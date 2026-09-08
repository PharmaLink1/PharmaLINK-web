"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { adminApi } from "@/lib/api-client";
import type { User } from "@/lib/auth-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { interpolate, useLanguage } from "@/lib/i18n";
import { validateEmail, validatePassword, validateRequired } from "@/lib/validation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/layout/app-header";

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

/** Admin-only screen for creating additional administrator accounts. The created
 * admins can sign in immediately with the temporary password set here. */
export function AdminCreate() {
  const { t } = useLanguage();
  const a = t.admin.admins;
  const f = a.form;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [created, setCreated] = React.useState<User[]>([]);

  function validate(): Errors {
    return {
      firstName: validateRequired(firstName, f.firstName),
      lastName: validateRequired(lastName, f.lastName),
      email: validateEmail(email),
      password: validatePassword(password),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      const admin = await adminApi.createAdmin({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setCreated((prev) => [admin, ...prev]);
      setNotice(interpolate(a.created, { email: admin.email }));
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setErrors({});
    } catch (err) {
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <h1 className={"text-2xl font-semibold tracking-tight"}>{a.title}</h1>
        <p className={"mt-1 text-muted-foreground"}>{a.subtitle}</p>

        <div className={"mt-6 space-y-4"}>
          <Card className={"p-5"}>
            <form onSubmit={handleSubmit} noValidate className={"flex flex-col gap-4"}>
              <h2 className={"font-semibold tracking-tight"}>{f.heading}</h2>
              {formError && <Alert variant={"danger"}>{formError}</Alert>}
              {notice && <Alert variant={"success"}>{notice}</Alert>}

              <div className={"grid grid-cols-1 gap-4 sm:grid-cols-2"}>
                <Field label={f.firstName} htmlFor={"admin-first"} error={errors.firstName}>
                  <Input
                    id={"admin-first"}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={f.firstNamePlaceholder}
                    invalid={Boolean(errors.firstName)}
                    disabled={submitting}
                  />
                </Field>
                <Field label={f.lastName} htmlFor={"admin-last"} error={errors.lastName}>
                  <Input
                    id={"admin-last"}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={f.lastNamePlaceholder}
                    invalid={Boolean(errors.lastName)}
                    disabled={submitting}
                  />
                </Field>
              </div>

              <Field label={f.email} htmlFor={"admin-email"} error={errors.email}>
                <Input
                  id={"admin-email"}
                  type={"email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={f.emailPlaceholder}
                  invalid={Boolean(errors.email)}
                  disabled={submitting}
                  autoComplete={"off"}
                />
              </Field>

              <Field label={f.password} htmlFor={"admin-password"} error={errors.password}>
                <Input
                  id={"admin-password"}
                  type={"password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={f.passwordPlaceholder}
                  invalid={Boolean(errors.password)}
                  disabled={submitting}
                  autoComplete={"new-password"}
                />
              </Field>

              <div>
                <Button type={"submit"} loading={submitting}>
                  {submitting ? f.submitting : f.submit}
                </Button>
              </div>
            </form>
          </Card>

          {created.length > 0 && (
            <div className={"space-y-2"}>
              <p className={"text-xs text-muted-foreground"}>{a.createdTitle}</p>
              <Card className={"overflow-hidden"}>
                <ul className={"divide-y divide-border"}>
                  {created.map((admin) => (
                    <li
                      key={admin.id}
                      className={"flex items-center gap-2 px-4 py-3 text-sm text-foreground sm:px-5"}
                    >
                      <ShieldCheck className={"size-4 shrink-0 text-primary-strong"} aria-hidden />
                      <span>
                        {[admin.firstName, admin.lastName].filter(Boolean).join(" ")} · {admin.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
