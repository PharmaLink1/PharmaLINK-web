import type { Metadata } from "next";
import { getLocaleFromRequest } from "./server";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Standard page-title suffix, e.g. "Login — PharmaLink". */
const TITLE_SUFFIX = " — PharmaLink";

/**
 * Builds localized page metadata from the request cookie. Falls back to English
 * when no language has been chosen yet.
 */
export async function localizedMetadata(titleKey: keyof Dictionary["meta"]): Promise<Metadata> {
  const locale = await getLocaleFromRequest();
  const t = dictionaries[locale];
  return { title: `${t.meta[titleKey]}${TITLE_SUFFIX}` };
}
