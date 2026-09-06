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
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { ListingForm } from "@/components/dashboard/inventory/listing-form";
import { ListingRow } from "@/components/dashboard/inventory/listing-row";
import { cn } from "@/lib/cn";

/** Pharmacist inventory manager: lists the current stock for the pharmacist's
 * pharmacy and lets them add/update/remove listings. Requires a registered pharmacy;
 * stock only reaches patients once that pharmacy is verified. */
export function InventoryContent() {
  const { t } = useLanguage();
  const inv = t.dashboard.inventory;

  const [pharmacy, setPharmacy] = React.useState<MyPharmacy | null>(null);
  const [ready, setReady] = React.useState(false);
  const [listings, setListings] = React.useState<InventoryListing[]>([]);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [removing, setRemoving] = React.useState<string | null>(null);

  // Load the pharmacist's pharmacy, then its inventory. A pharmacist manages the first
  // pharmacy they own (the register flow creates one).
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const mine = await pharmacyApi.listMine();
        if (!active) return;
        const first = mine[0] ?? null;
        setPharmacy(first);
        if (first) setListings(await inventoryApi.list(first.pharmacy_id));
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

  function handleSaved(saved: InventoryListing) {
    setNotice(inv.add.saved);
    setError("");
    setListings((prev) => {
      const rest = prev.filter((l) => l.medicine_id !== saved.medicine_id);
      return [saved, ...rest];
    });
  }

  async function handleRemove(medicineID: string) {
    if (!pharmacy) return;
    setRemoving(medicineID);
    setError("");
    try {
      await inventoryApi.remove(pharmacy.pharmacy_id, medicineID);
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
        ) : !pharmacy ? (
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
            {pharmacy.verified_status !== "verified" && (
              <Alert variant={"warning"}>{inv.pendingNotice}</Alert>
            )}
            {notice && <Alert variant={"success"}>{notice}</Alert>}
            {error && <Alert variant={"danger"}>{error}</Alert>}

            <ListingForm pharmacyID={pharmacy.pharmacy_id} onSaved={handleSaved} />

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
