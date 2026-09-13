"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { inventoryApi, pharmacyApi } from "@/lib/pharmacy-api";
import type { InventoryListing, MyPharmacy } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { interpolate, useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { ListingForm } from "@/components/dashboard/inventory/listing-form";
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
  const [removing, setRemoving] = React.useState<string | null>(null);

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
      const rest = prev.filter((l) => l.medicine_id !== saved.medicine_id);
      return [saved, ...rest];
    });
  }

  async function handleRemove(medicineID: string) {
    if (!selected) return;
    setRemoving(medicineID);
    setError("");
    try {
      await inventoryApi.remove(selected.pharmacy_id, medicineID);
      setListings((prev) => prev.filter((l) => l.medicine_id !== medicineID));
      setNotice(inv.row.removed);
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <Link
          href={"/dashboard"}
          className={"inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}
        >
          <ArrowLeft className={"size-4"} aria-hidden />
          {t.nav.dashboard}
        </Link>

        <h1 className={"mt-4 text-2xl font-semibold tracking-tight"}>{inv.title}</h1>
        <p className={"mt-1 text-muted-foreground"}>{inv.subtitle}</p>

        {!ready ? (
          <div className={"mt-8 flex justify-center py-10"}>
            <Spinner label={inv.loading} />
          </div>
        ) : !selected ? (
          <Card className={"mt-8 p-5"}>
            <p className={"text-sm text-muted-foreground"}>{inv.noPharmacy}</p>
            <div className={"mt-4"}>
              <Link
                href={"/dashboard/pharmacy"}
                className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
              >
                {t.dashboard.pharmacy.register}
              </Link>
            </div>
          </Card>
        ) : (
          <div className={"mt-6 space-y-4"}>
            {pharmacies.length > 1 && (
              <Field
                label={inv.pharmacyLabel}
                htmlFor={"inventory-pharmacy"}
                hint={inv.selectPharmacyHint}
              >
                <select
                  id={"inventory-pharmacy"}
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
              <Alert variant={"warning"}>{inv.pendingNotice}</Alert>
            )}
            {notice && <Alert variant={"success"}>{notice}</Alert>}
            {error && <Alert variant={"danger"}>{error}</Alert>}

            <ListingForm
              key={selected.pharmacy_id}
              pharmacyID={selected.pharmacy_id}
              onSaved={handleSaved}
            />

            {listings.length > 0 ? (
              <div className={"space-y-2"}>
                <p className={"text-xs text-muted-foreground"}>
                  {interpolate(inv.count, { count: listings.length })}
                </p>
                <Card className={"overflow-hidden"}>
                  <ul className={"divide-y divide-border"}>
                    {listings.map((listing) => (
                      <ListingRow
                        key={listing.medicine_id}
                        listing={listing}
                        name={listing.display_name || listing.medicine_id}
                        removing={removing === listing.medicine_id}
                        onRemove={handleRemove}
                        t={t}
                      />
                    ))}
                  </ul>
                </Card>
              </div>
            ) : (
              <Card className={"p-5"}>
                <p className={"font-medium text-foreground"}>{inv.empty}</p>
                <p className={"mt-1 text-sm text-muted-foreground"}>{inv.emptyHint}</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
