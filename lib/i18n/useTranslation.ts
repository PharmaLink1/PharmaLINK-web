"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { en } from "@/lib/i18n/en";
import { am } from "@/lib/i18n/am";

const dictionaries = { en, am } as const;

/**
 * Minimal dictionary-based translation hook (no external i18n library),
 * per the confirmed lightweight-localization decision in the architecture plan.
 */
export function useTranslation() {
  const { language } = useLanguage();
  return { t: dictionaries[language], language };
}
