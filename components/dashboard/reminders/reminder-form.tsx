"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { reminderApi } from "@/lib/api-client";
import { useLanguage, interpolate } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { localTimeToUTC } from "@/lib/reminder-format";
import { WEEKDAYS, type CadenceType, type ReminderListItem, type Weekday } from "@/lib/reminder-types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/cn";

const MAX_MEDICINE_LENGTH = 200;

type FormErrors = {
  medicine?: string;
  interval?: string;
  days?: string;
  times?: string;
};

/**
 * Create form for a reminder. Each cadence reads different parts of the rule, so the
 * cadence control swaps the inputs rather than showing all of them at once.
 *
 * Times are collected on the patient's clock and converted to the UTC the backend
 * schedules on. No channel is sent - push is the only one the scheduler delivers.
 */
export function ReminderForm({
  onCreated,
  onClose,
}: {
  onCreated: (reminder: ReminderListItem) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const f = t.dashboard.reminders.form;

  const [medicine, setMedicine] = React.useState("");
  const [cadence, setCadence] = React.useState<CadenceType>("daily");
  const [intervalHours, setIntervalHours] = React.useState("8");
  const [days, setDays] = React.useState<Weekday[]>([]);
  const [timeOfDay, setTimeOfDay] = React.useState("08:00");
  const [timesOfDay, setTimesOfDay] = React.useState<string[]>(["08:00"]);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formError, setFormError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  function toggleDay(day: Weekday) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function setTime(index: number, value: string) {
    setTimesOfDay((prev) => prev.map((time, i) => (i === index ? value : time)));
  }

  // Mirrors the backend's own rules, so a cadence it would reject is caught here.
  function validate(): FormErrors {
    const next: FormErrors = {};
    const trimmed = medicine.trim();
    if (!trimmed) next.medicine = f.errors.medicine;
    else if (trimmed.length > MAX_MEDICINE_LENGTH) next.medicine = f.errors.medicineLength;

    if (cadence === "daily") {
      const hours = Number(intervalHours);
      if (!Number.isInteger(hours) || hours < 1 || hours > 24) next.interval = f.errors.interval;
    }
    if (cadence === "weekly" && days.length === 0) next.days = f.errors.days;
    if (cadence === "custom" && (timesOfDay.length === 0 || timesOfDay.some((time) => !time))) {
      next.times = f.errors.times;
    }
    return next;
  }

  function buildRule() {
    if (cadence === "daily") return { intervalHours: Number(intervalHours) };
    if (cadence === "weekly") return { days, timeOfDay: localTimeToUTC(timeOfDay) };
    return { timesOfDay: timesOfDay.map(localTimeToUTC) };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await reminderApi.create({
        medicine: medicine.trim(),
        cadenceType: cadence,
        cadenceRule: buildRule(),
      });
      onCreated({
        id: created.id,
        medicine: created.medicine,
        nextDueAt: created.nextDueAt,
        status: created.status,
      });
    } catch (err) {
      setFormError(getErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant={"elevated"} className={"mt-6"}>
      <form onSubmit={handleSubmit} noValidate className={"flex flex-col gap-5 p-6"}>
        <h2 className={"text-lg font-semibold tracking-tight"}>{f.heading}</h2>

        {formError && <Alert variant={"danger"}>{formError}</Alert>}

        <Field
          label={f.medicine}
          htmlFor={"reminder-medicine"}
          error={errors.medicine}
          hint={f.medicineHint}
        >
          <Input
            id={"reminder-medicine"}
            name={"reminder-medicine"}
            value={medicine}
            invalid={!!errors.medicine}
            disabled={submitting}
            maxLength={MAX_MEDICINE_LENGTH}
            placeholder={f.medicinePlaceholder}
            onChange={(e) => setMedicine(e.target.value)}
          />
        </Field>

        <div className={"flex flex-col gap-1.5"}>
          <span className={"text-sm font-medium text-foreground"}>{f.cadence}</span>
          <SegmentedControl<CadenceType>
            ariaLabel={f.cadence}
            value={cadence}
            disabled={submitting}
            onChange={setCadence}
            options={[
              { value: "daily", label: f.daily },
              { value: "weekly", label: f.weekly },
              { value: "custom", label: f.custom },
            ]}
          />
        </div>

        {cadence === "daily" && (
          <Field
            label={f.interval}
            htmlFor={"reminder-interval"}
            error={errors.interval}
            hint={f.intervalHint}
          >
            <Input
              id={"reminder-interval"}
              name={"reminder-interval"}
              type={"number"}
              inputMode={"numeric"}
              min={1}
              max={24}
              className={"sm:max-w-32"}
              value={intervalHours}
              invalid={!!errors.interval}
              disabled={submitting}
              onChange={(e) => setIntervalHours(e.target.value)}
            />
          </Field>
        )}

        {cadence === "weekly" && (
          <>
            <div className={"flex flex-col gap-1.5"}>
              <span className={"text-sm font-medium text-foreground"}>{f.days}</span>
              <div role={"group"} aria-label={f.days} className={"grid grid-cols-4 gap-1.5 sm:grid-cols-7"}>
                {WEEKDAYS.map((day) => {
                  const selected = days.includes(day);
                  return (
                    <button
                      key={day}
                      type={"button"}
                      aria-pressed={selected}
                      disabled={submitting}
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "min-h-11 rounded-md border px-2 text-sm font-medium transition-colors disabled:opacity-60",
                        selected
                          ? "border-primary bg-primary-subtle text-primary-strong"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {f.weekdays[day]}
                    </button>
                  );
                })}
              </div>
              {errors.days && (
                <p role={"alert"} className={"text-xs font-medium text-danger"}>
                  {errors.days}
                </p>
              )}
            </div>

            <Field label={f.time} htmlFor={"reminder-time"} hint={f.localTimeHint}>
              <Input
                id={"reminder-time"}
                name={"reminder-time"}
                type={"time"}
                className={"sm:max-w-40"}
                value={timeOfDay}
                disabled={submitting}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </Field>
          </>
        )}

        {cadence === "custom" && (
          <div className={"flex flex-col gap-1.5"}>
            <span className={"text-sm font-medium text-foreground"}>{f.times}</span>

            {timesOfDay.map((time, index) => (
              <div key={index} className={"flex items-center gap-2"}>
                <Input
                  type={"time"}
                  aria-label={interpolate(f.timeNumber, { index: index + 1 })}
                  className={"sm:max-w-40"}
                  value={time}
                  invalid={!!errors.times}
                  disabled={submitting}
                  onChange={(e) => setTime(index, e.target.value)}
                />
                {timesOfDay.length > 1 && (
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    size={"icon"}
                    aria-label={interpolate(f.removeTime, { index: index + 1 })}
                    disabled={submitting}
                    onClick={() => setTimesOfDay((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <X className={"size-4"} aria-hidden />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              block
              className={"mt-1 sm:w-auto"}
              disabled={submitting}
              onClick={() => setTimesOfDay((prev) => [...prev, ""])}
            >
              <Plus className={"size-4"} aria-hidden />
              {f.addTime}
            </Button>

            {errors.times ? (
              <p role={"alert"} className={"text-xs font-medium text-danger"}>
                {errors.times}
              </p>
            ) : (
              <p className={"text-xs text-muted-foreground"}>{f.timesHint}</p>
            )}
          </div>
        )}

        <div className={"flex flex-col gap-2 sm:flex-row-reverse"}>
          <Button type={"submit"} size={"lg"} block className={"sm:w-auto"} loading={submitting}>
            {submitting ? f.submitting : f.submit}
          </Button>
          <Button
            type={"button"}
            variant={"outline"}
            size={"lg"}
            block
            className={"sm:w-auto"}
            disabled={submitting}
            onClick={onClose}
          >
            {f.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
