"use client";

import * as React from "react";
import { PlusCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { inventoryApi, pharmacyApi } from "@/lib/pharmacy-api";
import type { BulkSummary, InventoryListing, MyPharmacy } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { interpolate, useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { ListingForm } from "@/components/dashboard/inventory/listing-form";
import { BulkUploadForm } from "@/components/dashboard/inventory/bulk-upload-form";
import { ListingRow } from "@/components/dashboard/inventory/listing-row";
import { cn } from "@/lib/cn";

/** Pharmacist inventory manager: lists the current stock for the selected pharmacy
 * and lets them add/update/remove listings. A pharmacist may own several pharmacies,
 * so when there's more than one they pick which to manage (deep-linkable from a
 * pharmacy card via ?pharmacy=<id>). Stock only reaches patients once that pharmacy
 * is verified. */
export function InventoryContent() {
  const { t } = useLanguage();
  const inv = t.dashboard.inventory;

  const [pharmacies, setPharmacies] = React.useState<MyPharmacy[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [listings, setListings] = React.useState<InventoryListing[]>([]);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [marking, setMarking] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"single" | "bulk">("single");

  const selected = React.useMemo(
    () => pharmacies.find((p) => p.pharmacy_id === selectedId) ?? null,
    [pharmacies, selectedId],
  );

  // Load the pharmacist's pharmacies, then the inventory for the chosen one. The
  // initial pharmacy comes from ?pharmacy=<id> (deep link from a pharmacy card) when
  // it matches one they own, otherwise the first pharmacy.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const mine = await pharmacyApi.listMine();
        if (!active) return;
        setPharmacies(mine);
        const wanted = new URLSearchParams(window.location.search).get("pharmacy");
        const wantedMode = new URLSearchParams(window.location.search).get("mode");
        if (wantedMode === "bulk") setMode("bulk");
        const initial = mine.find((p) => p.pharmacy_id === wanted) ?? mine[0] ?? null;
        setSelectedId(initial?.pharmacy_id ?? null);
        if (initial) setListings(await inventoryApi.list(initial.pharmacy_id));
      } catch (err) {
        if (active) setError(getErrorMessage(err, t));
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [t]);

  async function handleSelectPharmacy(id: string) {
    setSelectedId(id);
    setNotice("");
    setError("");
    setListings([]);
    try {
      setListings(await inventoryApi.list(id));
    } catch (err) {
      setError(getErrorMessage(err, t));
    }
  }

  function handleSaved(saved: InventoryListing) {
    setNotice(inv.add.saved);
    setError("");
    setListings((prev) => {
      const rest = prev.filter((l) => l.medicineId !== saved.medicineId);
      return [saved, ...rest];
    });
  }

  async function handleBulkUploaded(summary: BulkSummary) {
    if (!selected) return;
    if (summary.succeeded > 0) {
      try {
        const refreshed = await inventoryApi.list(selected.pharmacy_id);
        setListings(refreshed);
      } catch (err) {
        setError(getErrorMessage(err, t));
      }
    }
  }

  async function handleMarkOutOfStock(medicineID: string) {
    if (!selected) return;
    setMarking(medicineID);
    setError("");
    try {
      const saved = await inventoryApi.set(selected.pharmacy_id, medicineID, {
        stockStatus: "out_of_stock",
      });
      // Keep the row — just reflect the status/price/time the backend saved.
      setListings((prev) =>
        prev.map((l) =>
          l.medicineId === medicineID
            ? {
                ...l,
                stockStatus: saved.stockStatus,
                price: saved.price,
                currency: saved.currency,
                updatedAt: saved.updatedAt,
              }
            : l,
        ),
      );
      setNotice(inv.row.markedOutOfStock);
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setMarking(null);
    }
  }

  return (
    <DashboardPageShell title={inv.title} subtitle={inv.subtitle}>
      {!ready ? (
        <div className="flex justify-center py-10">
          <Spinner label={inv.loading} />
        </div>
      ) : !selected ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{inv.noPharmacy}</p>
          <div className="mt-4">
            <Link
              href="/dashboard/pharmacy"
              className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
            >
              {t.dashboard.pharmacy.register}
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pharmacies.length > 1 && (
            <Field
              label={inv.pharmacyLabel}
              htmlFor="inventory-pharmacy"
              hint={inv.selectPharmacyHint}
            >
              <select
                id="inventory-pharmacy"
                value={selected.pharmacy_id}
                onChange={(e) => void handleSelectPharmacy(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm text-foreground",
                  "transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
              >
                {pharmacies.map((ph) => (
                  <option key={ph.pharmacy_id} value={ph.pharmacy_id}>
                    {ph.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {selected.verified_status !== "verified" && (
            <Alert variant="warning">{inv.pendingNotice}</Alert>
          )}
          {notice && <Alert variant="success">{notice}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <SegmentedControl
            options={[
              { value: "single", label: inv.modeSingle, icon: PlusCircle },
              { value: "bulk", label: inv.modeBulk, icon: UploadCloud },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel={inv.title}
          />

          {mode === "single" ? (
            <ListingForm
              key={selected.pharmacy_id}
              pharmacyID={selected.pharmacy_id}
              onSaved={handleSaved}
            />
          ) : (
            <BulkUploadForm
              key={selected.pharmacy_id}
              pharmacyID={selected.pharmacy_id}
              onUploaded={handleBulkUploaded}
            />
          )}

          {listings.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {interpolate(inv.count, { count: listings.length })}
              </p>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-border">
                  {listings.map((listing) => (
                    <ListingRow
                      key={listing.medicineId}
                      listing={listing}
                      name={listing.medicineName || listing.medicineId}
                      marking={marking === listing.medicineId}
                      onMarkOutOfStock={handleMarkOutOfStock}
                      t={t}
                    />
                  ))}
                </ul>
              </Card>
            </div>
          ) : (
            <Card className="p-5">
              <p className="font-medium text-foreground">{inv.empty}</p>
              <p className="mt-1 text-sm text-muted-foreground">{inv.emptyHint}</p>
            </Card>
          )}
        </div>
      )}
    </DashboardPageShell>
  );
}
