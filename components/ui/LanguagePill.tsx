"use client";

import { useLanguage } from "@/hooks/useLanguage";

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.5 3.8 5.6 3.8 9s-1.4 6.5-3.8 9c-2.4-2.5-3.8-5.6-3.8-9s1.4-6.5 3.8-9Z" />
    </svg>
  );
}

export function LanguagePill() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label="Toggle language between English and Amharic"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-canvas)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
    >
      <GlobeIcon />
      {language === "en" ? "EN" : "አማ"}
    </button>
  );
}
