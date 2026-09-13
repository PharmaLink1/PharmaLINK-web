"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { MedicineChip } from "@/components/search/MedicineChip";
import { LocationPinIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Callout } from "@/components/ui/Callout";

/** Static seed list for MVP (Page 6 PRD §11: "common-medicine chips can be
 * static seed for MVP"), matching the exact examples in the Figma frame. */
const COMMON_MEDICINES = ["Paracetamol", "Amoxicillin", "Metformin", "Amlodipine", "Omeprazole"];

type LocationStatus = "unset" | "granted" | "denied";

/**
 * Page 6 — Patient Home. Extracted from Figma node 6:355. The patient's
 * landing screen after login and the core entry point of the whole
 * product — its one job is getting the patient into a medicine search as
 * fast as possible.
 */
export default function PatientHomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { recentSearches } = useRecentSearches();
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("unset");

  function runSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      return;
    }
    // No reverse-geocoding service is wired up, so we show "Near you"
    // rather than fabricating a specific place name we don't actually have.
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus("granted"),
      () => setLocationStatus("denied")
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-5 py-8 sm:px-6 sm:py-10">
      {!isOnline && <Callout variant="error">{t.home.offlineBanner}</Callout>}

      <div className="flex flex-col gap-2">
        <h1 className="text-lg leading-[1.375] font-semibold text-[var(--color-text-primary)]">
          {t.home.greeting}
          {user?.name ? `, ${user.name}` : ""}
        </h1>

        <button
          type="button"
          onClick={requestLocation}
          className="flex w-fit items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <LocationPinIcon className="shrink-0" />
          <span>{locationStatus === "granted" ? t.home.nearYou : t.home.setLocation}</span>
          {locationStatus === "granted" && (
            <span className="font-medium text-[var(--color-brand)]">{t.home.locationChange}</span>
          )}
        </button>

        <p className="text-[15px] text-[var(--color-text-secondary)]">{t.home.prompt}</p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={runSearch}
        placeholder={t.home.searchPlaceholder}
        label={t.home.searchPlaceholder}
      />

      {recentSearches.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">{t.home.recentSearches}</h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((recent) => (
              <MedicineChip key={recent} label={recent} showClockIcon onClick={() => runSearch(recent)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">{t.home.commonMedicines}</h2>
        <div className="flex flex-wrap gap-2">
          {COMMON_MEDICINES.map((name) => (
            <MedicineChip key={name} label={name} onClick={() => runSearch(name)} />
          ))}
        </div>
      </div>
    </div>
  );
}
