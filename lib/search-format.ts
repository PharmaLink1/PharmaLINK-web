// Pure display helpers for the medicine-search UI, shared by the container and its
// sub-components. No React, no side effects — just formatting.

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { StockStatus } from "@/lib/search-types";

type SearchTime = Dictionary["dashboard"]["search"]["time"];

export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(price);
  return "ETB " + formatted;
}

export function formatDistanceMeters(meters: number): string {
  const km = Math.round((meters / 1000) * 10) / 10;
  return km + " km";
}

export function timeAgoLabel(iso: string, time: SearchTime): { label: string; justNow: boolean } {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return { label: time.justNow, justNow: true };
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { label: minutes + " " + time.minute, justNow: false };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: hours + " " + time.hour, justNow: false };
  const days = Math.floor(hours / 24);
  return { label: days + " " + time.day, justNow: false };
}

export function directionsUrl(lat: number, lng: number): string {
  return (
    "https://www.google.com/maps/dir/?api=1&destination=" + lat.toFixed(6) + "," + lng.toFixed(6)
  );
}

export const stockPillClasses: Record<StockStatus, string> = {
  in_stock: "bg-success-subtle text-success",
  low_stock: "bg-warning-subtle text-warning",
  out_of_stock: "bg-danger-subtle text-danger",
};

export function stockLabel(status: StockStatus, t: Dictionary): string {
  if (status === "in_stock") return t.common.inStock;
  if (status === "low_stock") return t.common.lowStock;
  return t.common.outOfStock;
}
