import { SearchResultsView } from "@/components/search/SearchResultsView";

/**
 * Page 7 — Search Results. Public per proxy.ts (anonymous search is a hard
 * requirement, prd.md §7.1) — the (patient) route group's layout doesn't
 * itself require a session, only proxy.ts's PATIENT_ROUTES list does, and
 * "/search" isn't in it. Living under (patient) gives this page the same
 * header/nav/footer shell as Patient Home, per explicit request.
 *
 * Reads the `q` param set by the landing page hero (and Patient Home's
 * search bar), then hands it to a client component that resolves it
 * against the mock-backed medicine/listing lookups in lib/api/medicines.ts.
 *
 * Map view is intentionally not implemented yet — deferred until the
 * design for it is provided.
 */
export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <SearchResultsView query={q ?? ""} />;
}
