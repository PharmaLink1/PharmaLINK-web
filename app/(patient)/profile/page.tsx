"use client";

import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { AccountDetailsCard } from "@/components/profile/AccountDetailsCard";
import { PreferencesCard } from "@/components/profile/PreferencesCard";
import { AccountActionsCard } from "@/components/profile/AccountActionsCard";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Page 11 — Profile. A pure gap-fill (no Figma design existed until this
 * revision, no prd.md section) — implemented per
 * "Page 11 — Profile/PRD.md" against Figma node 45:1259 for the four
 * cards' exact spacing/copy. Lives under (patient), so PatientTopNav /
 * PatientBottomNav / PublicFooter already wrap it — this page renders only
 * the four stacked cards, matching every other page's shell reuse instead
 * of rebuilding the header/footer the Stitch mockup showed.
 */
export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-5 py-8 sm:px-6 sm:py-10">
        <div className="h-[238px] animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
        <div className="h-[280px] animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
        <div className="h-[180px] animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
        <div className="h-[140px] animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="sr-only">{t.nav.profile}</h1>
      <ProfileHeaderCard />
      <AccountDetailsCard />
      <PreferencesCard />
      <AccountActionsCard />
    </div>
  );
}
