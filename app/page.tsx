import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingTrustStrip } from "@/components/landing/LandingTrustStrip";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingForPharmacies } from "@/components/landing/LandingForPharmacies";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "PharmaLink — Find which pharmacy has your medicine in Ethiopia",
  description:
    "Search a medicine and see nearby pharmacies that have it in stock, compare prices in ETB, and read plain-language drug information in Amharic or English.",
};

/**
 * Public landing page (Page 10). Content for the hero, trust strip, and
 * footer is extracted from Figma nodes 17:975 and 17:1083 (see
 * `Page 10 — Landing Page/PRD.md` in the parent folder). The "How it works"
 * and "For pharmacies" sections have no matching Figma frame yet — they
 * exist so the header's nav links have real, non-dead targets, and are
 * built from that same PRD's copy using the established design tokens.
 *
 * Anonymous search from the hero requires `/search` to be public — see the
 * PATIENT_ROUTES split in `proxy.ts`.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <PublicHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingTrustStrip />
        <LandingHowItWorks />
        <LandingForPharmacies />
      </main>
      <PublicFooter />
    </div>
  );
}
