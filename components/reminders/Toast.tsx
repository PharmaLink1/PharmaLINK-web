"use client";

import { useEffect } from "react";

const TOAST_AUTO_DISMISS_MS = 3000;

/**
 * Non-blocking toast for Snooze/Cancel feedback (Page 12 PRD §5.5/§5.6 —
 * explicitly chosen over a confirmation dialog for these low-stakes,
 * easily-reversible actions). Auto-dismisses; doesn't trap focus or block
 * the page, unlike the Add/Edit dialog.
 */
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-text-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-canvas)] shadow-lg sm:bottom-8"
    >
      {message}
    </div>
  );
}
