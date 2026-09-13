import { redirect } from "next/navigation";
import { ResetPasswordScreen } from "@/components/auth/ResetPasswordScreen";

/**
 * Page 5, Screen B — "Set New Password" (`/forgot-password/reset`). Only
 * reachable with a verified reset token in the query string (PRD §1 Screen
 * B item 4, §6 "Direct/expired visit to Screen B") — a direct/stale visit
 * without one redirects back to Screen A rather than rendering a broken
 * form. Reads `searchParams` server-side (same pattern as the Search and
 * Pharmacy Detail pages) instead of a client `useSearchParams()` hook, so
 * this route stays statically analyzable and needs no Suspense boundary.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    redirect("/forgot-password");
  }
  return <ResetPasswordScreen resetToken={token} />;
}
