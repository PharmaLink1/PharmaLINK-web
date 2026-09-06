"use client";

import * as React from "react";
import { medicineAdminApi } from "@/lib/pharmacy-api";
import type { CatalogMedicine } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { interpolate, useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";

/** Admin medicine catalogue: create medicines and browse the catalogue. Seeding this
 * is what lets pharmacists list stock and patients search — the start of the chain. */
export function MedicineCatalog() {
  const { t } = useLanguage();
  const m = t.admin.medicines;
  const f = m.form;

  const [medicines, setMedicines] = React.useState<CatalogMedicine[] | null>(null);
  const [error, setError] = React.useState("");

  const [generic, setGeneric] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [amharic, setAmharic] = React.useState("");
  const [dosageForm, setDosageForm] = React.useState("");
  const [strength, setStrength] = React.useState("");
  const [genericError, setGenericError] = React.useState<string | undefined>();
  const [formError, setFormError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    setError("");
    try {
      setMedicines(await medicineAdminApi.list("", 100));
    } catch (err) {
      setError(getErrorMessage(err, t));
      setMedicines([]);
    }
  }, [t]);

  React.useEffect(() => {
    // load() sets loading/error state synchronously — a legitimate data-fetch effect,
    // hence the scoped disable (matches applications-review).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    setNotice("");
    if (!generic.trim()) {
      setGenericError(f.genericRequired);
      return;
    }
    setGenericError(undefined);
    setSubmitting(true);
    try {
      const created = await medicineAdminApi.create({
        generic_name: generic.trim(),
        brand_name: brand.trim() || undefined,
        amharic_name: amharic.trim() || undefined,
        dosage_form: dosageForm.trim() || undefined,
        strength: strength.trim() || undefined,
      });
      setMedicines((prev) => [created, ...(prev ?? [])]);
      setNotice(f.added);
      setGeneric("");
      setBrand("");
      setAmharic("");
      setDosageForm("");
      setStrength("");
    } catch (err) {
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  function label(med: CatalogMedicine): string {
    let name = med.generic_name || med.brand_name || med.medicine_id;
    if (med.strength) name += " " + med.strength;
    if (med.dosage_form) name += " · " + med.dosage_form;
    if (med.generic_name && med.brand_name && med.brand_name !== med.generic_name) {
      name += " (" + med.brand_name + ")";
    }
    return name;
  }

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <h1 className={"text-2xl font-semibold tracking-tight"}>{m.title}</h1>
        <p className={"mt-1 text-muted-foreground"}>{m.subtitle}</p>

        <div className={"mt-6 space-y-4"}>
          <Card className={"p-5"}>
            <form onSubmit={handleSubmit} noValidate className={"flex flex-col gap-4"}>
              <h2 className={"font-semibold tracking-tight"}>{f.heading}</h2>
              {formError && <Alert variant={"danger"}>{formError}</Alert>}
              {notice && <Alert variant={"success"}>{notice}</Alert>}

              <Field label={f.generic} htmlFor={"med-generic"} error={genericError}>
                <Input
                  id={"med-generic"}
                  value={generic}
                  onChange={(e) => setGeneric(e.target.value)}
                  placeholder={f.genericPlaceholder}
                  invalid={Boolean(genericError)}
                  disabled={submitting}
                />
              </Field>

              <div className={"grid grid-cols-1 gap-4 sm:grid-cols-2"}>
                <Field label={f.brand} htmlFor={"med-brand"}>
                  <Input
                    id={"med-brand"}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder={f.brandPlaceholder}
                    disabled={submitting}
                  />
                </Field>
                <Field label={f.amharic} htmlFor={"med-amharic"}>
                  <Input
                    id={"med-amharic"}
                    value={amharic}
                    onChange={(e) => setAmharic(e.target.value)}
                    placeholder={f.amharicPlaceholder}
                    disabled={submitting}
                  />
                </Field>
                <Field label={f.dosageForm} htmlFor={"med-form"}>
                  <Input
                    id={"med-form"}
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                    placeholder={f.dosageFormPlaceholder}
                    disabled={submitting}
                  />
                </Field>
                <Field label={f.strength} htmlFor={"med-strength"}>
                  <Input
                    id={"med-strength"}
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder={f.strengthPlaceholder}
                    disabled={submitting}
                  />
                </Field>
              </div>

              <div>
                <Button type={"submit"} loading={submitting}>
                  {submitting ? f.adding : f.add}
                </Button>
              </div>
            </form>
          </Card>

          {error && <Alert variant={"danger"}>{error}</Alert>}

          {medicines === null ? (
            <div className={"flex justify-center py-10"}>
              <Spinner label={m.loading} />
            </div>
          ) : medicines.length > 0 ? (
            <div className={"space-y-2"}>
              <p className={"text-xs text-muted-foreground"}>
                {interpolate(m.count, { count: medicines.length })}
              </p>
              <Card className={"overflow-hidden"}>
                <ul className={"divide-y divide-border"}>
                  {medicines.map((med) => (
                    <li key={med.medicine_id} className={"px-4 py-3 text-sm text-foreground sm:px-5"}>
                      {label(med)}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ) : (
            <Card className={"p-5"}>
              <p className={"text-sm text-muted-foreground"}>{m.empty}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
