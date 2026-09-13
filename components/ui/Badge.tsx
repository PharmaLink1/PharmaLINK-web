"use client";

import type { StockStatus } from "@/lib/types/inventoryListing";
import { StockInIcon, StockOutIcon, StockWarningIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Stock-status badge — bordered tinted pill, matching Page 7's actual
 * Figma frame (node 6:519) exactly: in-stock = green, low = amber,
 * out = slate. Red is reserved for errors only, never used for stock.
 */
const statusStyle: Record<StockStatus, { bg: string; border: string; color: string }> = {
  in_stock: {
    bg: "var(--color-stock-in-bg)",
    border: "var(--color-stock-in-border)",
    color: "var(--color-stock-in)",
  },
  low_stock: {
    bg: "var(--color-stock-low-bg)",
    border: "var(--color-stock-low-border)",
    color: "var(--color-stock-low)",
  },
  out_of_stock: {
    bg: "var(--color-stock-out-bg)",
    border: "var(--color-stock-out-border)",
    color: "var(--color-stock-out)",
  },
};

export function Badge({ status }: { status: StockStatus }) {
  const { t } = useTranslation();
  const label = { in_stock: t.stock.inStock, low_stock: t.stock.lowStock, out_of_stock: t.stock.outOfStock }[status];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[4px] border px-[9px] py-[3px] text-xs font-medium"
      style={{
        backgroundColor: statusStyle[status].bg,
        borderColor: statusStyle[status].border,
        color: statusStyle[status].color,
      }}
    >
      {status === "in_stock" && <StockInIcon />}
      {status === "low_stock" && <StockWarningIcon />}
      {status === "out_of_stock" && <StockOutIcon />}
      {label}
    </span>
  );
}
