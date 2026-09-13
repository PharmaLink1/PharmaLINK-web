"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pharmalink_recent_searches";
const MAX_RECENT = 3;

function readStored(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Local, on-device stand-in for the "Search Log" backend entity (Page 6
 * PRD §11 documents Recent Searches as backed by Search Log, which doesn't
 * exist yet) — tracks the patient's last few distinct searches in
 * localStorage, so "Recent searches" on Patient Home is real data from
 * this device rather than a hardcoded example.
 *
 * Starts empty on both server and client's first render (avoiding the
 * same hydration-mismatch class as LanguageContext/ThemeContext), then
 * syncs the real stored list in an effect after mount.
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = readStored();
    if (stored.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration sync from localStorage
      setRecentSearches(stored);
    }
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentSearches, addRecentSearch };
}
