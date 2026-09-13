/**
 * Relative-time suffixes ("h ago" / "d ago") stay in English for now — the
 * lightweight dictionary in lib/i18n has no string-interpolation support
 * yet, so a fully localized "N hours ago" would need that feature added
 * first rather than being faked here. Shared by Search Results (Page 7)
 * and Pharmacy Detail (Page 8) so both "Updated Nh ago" reads match.
 */
export function formatUpdatedAt(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
