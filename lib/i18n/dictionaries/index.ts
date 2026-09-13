import { am } from "./am";
import { en, type Dictionary } from "./en";
import { DEFAULT_LOCALE, getCurrentLocale, type Locale } from "../config";

export type { Dictionary };
export { en, am };

export const dictionaries: Record<Locale, Dictionary> = { en, am };

/** Dictionary for the current client locale (used outside React, e.g. validation). */
export function getCurrentDictionary(): Dictionary {
  return dictionaries[getCurrentLocale()];
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** Replaces {key} placeholders in a translated template with the given values. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
