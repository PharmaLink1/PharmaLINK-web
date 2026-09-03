import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY, isLocale, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Server-side locale from the SSR cookie (client switches keep it in sync). */
export async function getLocaleFromRequest(): Promise<Locale> {
  try {
    const store = await cookies();
    const value = store.get(LOCALE_COOKIE_KEY)?.value;
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** Dictionary for the requesting client's stored language. */
export async function getDictionaryFromRequest(): Promise<Dictionary> {
  return dictionaries[await getLocaleFromRequest()];
}
