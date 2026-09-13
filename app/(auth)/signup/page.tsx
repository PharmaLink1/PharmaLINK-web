"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RoleSelectCard } from "@/components/auth/RoleSelectCard";
import { BackArrowIcon, PatientRoleIcon, PharmacyRoleIcon, PlusIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Role = "patient" | "pharmacy_staff";

/**
 * Page 2 — Sign Up: Role Selection. Extracted from Figma node 6:59, same
 * file as Login. The theme toggle + language pill in the top-right come
 * from the shared (auth) layout (app/(auth)/layout.tsx), not rendered here
 * — same reasoning as Login. The back arrow has no equivalent slot in that
 * shared layout (not every auth page needs one the same way), so it's this
 * page's own top-left element instead of sharing Figma's single top row.
 */
export default function SignUpRoleSelectionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  function handleContinue() {
    if (!selectedRole) return;
    router.push(selectedRole === "patient" ? "/signup/patient" : "/signup/pharmacy");
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-[var(--color-canvas)] px-5 pb-10 sm:px-6">
      <div className="w-full max-w-[680px] pb-4">
        <Link
          href="/login"
          aria-label={t.common.back}
          className="inline-flex items-center justify-center rounded-full p-2 text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface)]"
        >
          <BackArrowIcon />
        </Link>
      </div>

      <div className="w-full max-w-[680px] sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-[41px]">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-brand)]">
              <PlusIcon />
            </span>
            <span className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">{t.common.appName}</span>
          </div>

          <h1 className="text-center text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">
            {t.roleSelection.title}
          </h1>
          <p className="mt-2 text-center text-base leading-6 text-[var(--color-text-secondary)]">
            {t.roleSelection.subtitle}
          </p>
        </div>

        <div role="radiogroup" aria-label={t.roleSelection.title} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <RoleSelectCard
            icon={<PatientRoleIcon />}
            title={t.roleSelection.patientTitle}
            description={t.roleSelection.patientDescription}
            selected={selectedRole === "patient"}
            onSelect={() => setSelectedRole("patient")}
          />
          <RoleSelectCard
            icon={<PharmacyRoleIcon />}
            title={t.roleSelection.pharmacyTitle}
            description={t.roleSelection.pharmacyDescription}
            selected={selectedRole === "pharmacy_staff"}
            onSelect={() => setSelectedRole("pharmacy_staff")}
          />
        </div>

        <Button className="mt-6 w-full" disabled={!selectedRole} onClick={handleContinue}>
          {t.roleSelection.continueButton}
        </Button>

        <p className="mt-6 text-center text-base text-[var(--color-text-secondary)]">
          {t.roleSelection.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-[15px] font-medium text-[var(--color-brand)] hover:underline">
            {t.roleSelection.logIn}
          </Link>
        </p>
        <p className="mt-4 text-center text-[13px] leading-[18px] text-[var(--color-text-placeholder)]">
          {t.roleSelection.helperText}
        </p>
      </div>
    </main>
  );
}
