/**
 * Formatting helper for the "HH:MM - HH:MM" hours string stored on
 * Pharmacy (lib/types/pharmacy.ts). Per PRD §6.2, the real open/closed
 * state, closing/opening time and distance are meant to be computed
 * on-device from `hours` + `lat/lng` + the current time/location — for now
 * `isOpenNow`/`distanceKm` are still mocked fields on Pharmacy (like on
 * Search Results), so this only handles the display formatting half.
 */
function to12Hour(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = (mStr ?? "00").padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

export function parseHoursRange(hours: string): { opens: string; closes: string } | null {
  const parts = hours.split("-").map((p) => p.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { opens: to12Hour(parts[0]), closes: to12Hour(parts[1]) };
}
