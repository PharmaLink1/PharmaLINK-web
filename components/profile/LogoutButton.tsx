"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Log out button + confirmation dialog, extracted from the Figma frame
 * (node 45:1259, "Section - 4. Account Actions"). Deliberately styled as a
 * quiet secondary/outline button, NOT red — Page 11 PRD §3/§8: red is
 * reserved for errors across the app, and logging out isn't one.
 * `AuthContext.logout()` clears the session but doesn't navigate, so this
 * component owns the redirect to /login (PRD §5.7).
 */
export function LogoutButton() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isConfirmOpen) return;
    cancelButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDialog();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmOpen]);

  function closeDialog() {
    setIsConfirmOpen(false);
    triggerButtonRef.current?.focus();
  }

  async function confirmLogout() {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  }

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-[var(--color-brand)] px-[25px] py-[9px] text-base font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
      >
        {t.profile.logoutButton}
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-body"
            className="w-full max-w-[360px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg"
          >
            <h2 id="logout-dialog-title" className="text-lg font-semibold text-[var(--color-text-primary)]">
              {t.profile.logoutDialogTitle}
            </h2>
            <p id="logout-dialog-body" className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {t.profile.logoutDialogBody}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-brand)] text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.profile.logoutButton}
              </button>
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeDialog}
                disabled={isLoggingOut}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.profile.cancelButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
