"use client";

import * as React from "react";
import { LocateFixed } from "lucide-react";
import { pharmacyApi } from "@/lib/pharmacy-api";
import type { Hours, RegisterPharmacyRequest } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CertificateUploader } from "@/components/auth/certificate-uploader";

type Errors = Partial<
  Record<"name" | "address" | "phone" | "location" | "license" | "hours", string>
>;

/** Registration form for a pharmacist's own pharmacy. The pharmacy starts pending
 * until an admin verifies it, which the caller surfaces after a successful submit. */
export function PharmacyForm({ onRegistered }: { onRegistered: () => void }) {
  const { t } = useLanguage();
  const f = t.dashboard.pharmacy.form;

  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");
  const [licenseUrl, setLicenseUrl] = React.useState("");
  const [is24h, setIs24h] = React.useState(false);
  const [opens, setOpens] = React.useState("08:00");
  const [closes, setCloses] = React.useState("20:00");

  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [uploadBusy, setUploadBusy] = React.useState(false);

  function useMyLocation() {
    if (locating || !("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setErrors((e) => ({ ...e, location: undefined }));
      },
      () => {
        setLocating(false);
        setErrors((e) => ({ ...e, location: t.dashboard.search.location.failed }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function validate(): { ok: boolean; latNum: number; lngNum: number } {
    const next: Errors = {};
    if (!name.trim()) next.name = t.validation.required.replace("{label}", f.name);
    if (!address.trim()) next.address = t.validation.required.replace("{label}", f.address);
    if (!phone.trim()) next.phone = t.validation.phoneRequired;
    if (!licenseUrl.trim()) next.license = t.validation.required.replace("{label}", f.license);

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const validLat = lat.trim() !== "" && Number.isFinite(latNum) && latNum >= -90 && latNum <= 90;
    const validLng = lng.trim() !== "" && Number.isFinite(lngNum) && lngNum >= -180 && lngNum <= 180;
    if (!validLat || !validLng) next.location = t.errors.locationInvalid;

    if (!is24h) {
      if (!opens || !closes) next.hours = f.hoursRequired;
      else if (opens === closes) next.hours = f.hoursInvalid;
    }

    setErrors(next);
    return { ok: Object.keys(next).length === 0, latNum, lngNum };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const { ok, latNum, lngNum } = validate();
    if (!ok) return;

    // Backend stores per-day "HH:MM-HH:MM" strings; the form applies one schedule to
    // every day, or marks the pharmacy open around the clock.
    const span = `${opens}-${closes}`;
    const hours: Hours = is24h
      ? { is24h: true }
      : { mon: span, tue: span, wed: span, thu: span, fri: span, sat: span, sun: span, is24h: false };

    const body: RegisterPharmacyRequest = {
      name: name.trim(),
      address: address.trim(),
      lat: latNum,
      lng: lngNum,
      phone: phone.trim(),
      hours,
      businessLicenseUrl: licenseUrl.trim(),
    };

    setSubmitting(true);
    try {
      await pharmacyApi.register(body);
      onRegistered();
    } catch (err) {
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className={"p-5 sm:p-6"}>
      <form onSubmit={handleSubmit} noValidate className={"flex flex-col gap-5"}>
        <div>
          <h2 className={"font-semibold tracking-tight"}>{f.heading}</h2>
        </div>

        {formError && <Alert variant={"danger"}>{formError}</Alert>}

        <Field label={f.name} htmlFor={"pharmacy-name"} error={errors.name}>
          <Input
            id={"pharmacy-name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={f.namePlaceholder}
            invalid={Boolean(errors.name)}
            disabled={submitting}
          />
        </Field>

        <Field label={f.address} htmlFor={"pharmacy-address"} error={errors.address}>
          <Input
            id={"pharmacy-address"}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={f.addressPlaceholder}
            invalid={Boolean(errors.address)}
            disabled={submitting}
          />
        </Field>

        <Field label={f.phone} htmlFor={"pharmacy-phone"} error={errors.phone}>
          <Input
            id={"pharmacy-phone"}
            type={"tel"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={f.phonePlaceholder}
            invalid={Boolean(errors.phone)}
            disabled={submitting}
          />
        </Field>

        <div className={"flex flex-col gap-2"}>
          <span className={"text-sm font-medium text-foreground"}>{f.location}</span>
          <p className={"text-xs text-muted-foreground"}>{f.locationHint}</p>
          <div>
            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              loading={locating}
              onClick={useMyLocation}
              disabled={submitting}
            >
              <LocateFixed className={"size-4"} aria-hidden />
              {locating ? f.locating : f.useLocation}
            </Button>
          </div>
          <div className={"grid grid-cols-1 gap-3 sm:grid-cols-2"}>
            <Field label={f.lat} htmlFor={"pharmacy-lat"}>
              <Input
                id={"pharmacy-lat"}
                inputMode={"decimal"}
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder={"8.980600"}
                invalid={Boolean(errors.location)}
                disabled={submitting}
              />
            </Field>
            <Field label={f.lng} htmlFor={"pharmacy-lng"}>
              <Input
                id={"pharmacy-lng"}
                inputMode={"decimal"}
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder={"38.757800"}
                invalid={Boolean(errors.location)}
                disabled={submitting}
              />
            </Field>
          </div>
          {errors.location && (
            <p role={"alert"} className={"text-xs font-medium text-danger"}>
              {errors.location}
            </p>
          )}
        </div>

        <Field label={f.license} htmlFor={"pharmacy-license"} error={errors.license}>
          <CertificateUploader
            id={"pharmacy-license"}
            url={licenseUrl}
            onUrlChange={(url) => {
              setLicenseUrl(url);
              setErrors((e) => ({ ...e, license: undefined }));
            }}
            onBusyChange={setUploadBusy}
            disabled={submitting}
          />
        </Field>

        <div className={"flex flex-col gap-2"}>
          <span className={"text-sm font-medium text-foreground"}>{f.hours}</span>
          <label className={"inline-flex items-center gap-2 text-sm text-foreground"}>
            <input
              type={"checkbox"}
              checked={is24h}
              onChange={(e) => setIs24h(e.target.checked)}
              disabled={submitting}
              className={"size-4 rounded border-input accent-primary"}
            />
            {f.open24}
          </label>

          {!is24h && (
            <>
              <div className={"grid grid-cols-1 gap-3 sm:grid-cols-2"}>
                <Field label={f.opens} htmlFor={"pharmacy-opens"}>
                  <Input
                    id={"pharmacy-opens"}
                    type={"time"}
                    value={opens}
                    onChange={(e) => {
                      setOpens(e.target.value);
                      setErrors((er) => ({ ...er, hours: undefined }));
                    }}
                    invalid={Boolean(errors.hours)}
                    disabled={submitting}
                  />
                </Field>
                <Field label={f.closes} htmlFor={"pharmacy-closes"}>
                  <Input
                    id={"pharmacy-closes"}
                    type={"time"}
                    value={closes}
                    onChange={(e) => {
                      setCloses(e.target.value);
                      setErrors((er) => ({ ...er, hours: undefined }));
                    }}
                    invalid={Boolean(errors.hours)}
                    disabled={submitting}
                  />
                </Field>
              </div>
              <p className={"text-xs text-muted-foreground"}>{f.hoursEveryDay}</p>
              {errors.hours && (
                <p role={"alert"} className={"text-xs font-medium text-danger"}>
                  {errors.hours}
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <Button type={"submit"} loading={submitting} disabled={uploadBusy}>
            {submitting ? f.submitting : f.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}
