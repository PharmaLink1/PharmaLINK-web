// Display and clock helpers for the reminders screen. No React, no side effects.

import type { Locale } from "@/lib/i18n/config";

/**
 * Converts a "HH:MM" the patient picked on their own clock into the UTC "HH:MM" the
 * backend stores and schedules on. Today's offset is used, which is exact for
 * Ethiopia (no daylight saving) and at most an hour out elsewhere on the two days a
 * year the clocks move.
 */
export function localTimeToUTC(value: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const local = new Date();
  local.setHours(hours, minutes, 0, 0);
  return pad(local.getUTCHours()) + ":" + pad(local.getUTCMinutes());
}

/** When the reminder next fires, on the patient's own clock and in their language. */
export function formatDueAt(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "am" ? "am" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** True once the stored due time has passed but the scheduler has not caught up. */
export function isDueNow(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now();
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
