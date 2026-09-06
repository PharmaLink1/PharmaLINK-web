"use client";

import * as React from "react";
import { inventoryApi } from "@/lib/pharmacy-api";
import type { InventoryListing } from "@/lib/pharmacy-types";
import type { MedicineSuggestion } from "@/lib/search-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MedicinePicker } from "@/components/dashboard/inventory/medicine-picker";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** Add-or-update form for one stock listing. Saving is an upsert on
 * (pharmacy, medicine), so re-adding a medicine edits the existing listing. */
export function ListingForm({
  pharmacyID,
  onSaved,
}: {
  pharmacyID: string;
  onSaved: (listing: InventoryListing) => void;
}) {
  const { t } = useLanguage();
  const add = t.dashboard.inventory.add;

  const [medicine, setMedicine] = React.useState<MedicineSuggestion | null>(null);
  const [stockStatus, setStockStatus] = React.useState<StockStatus>("in_stock");
  const [price, setPrice] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const stockOptions: { value: StockStatus; label: string }[] = [
    { value: "in_stock", label: t.common.inStock },
    { value: "low_stock", label: t.common.lowStock },
    { value: "out_of_stock", label: t.common.outOfStock },
  ];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!medicine) {
      setError(add.pickMedicine);
      return;
    }
    // An empty price is legitimate ("not listed"); a negative one is not.
    const trimmed = price.trim();
    let priceValue: number | null = null;
    if (trimmed !== "") {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError(add.invalidPrice);
        return;
      }
      priceValue = parsed;
    }

    setSaving(true);
    try {
      const saved = await inventoryApi.set(pharmacyID, {
        medicine_id: medicine.medicine_id,
        stock_status: stockStatus,
        price: priceValue,
      });
      onSaved(saved);
      setMedicine(null);
      setPrice("");
      setStockStatus("in_stock");
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={"p-5"}>
      <form onSubmit={handleSubmit} noValidate className={"flex flex-col gap-4"}>
        <h2 className={"font-semibold tracking-tight"}>{add.heading}</h2>

        {error && <Alert variant={"danger"}>{error}</Alert>}

        <Field label={add.medicine} htmlFor={"inventory-medicine"} hint={add.medicineHint}>
          <MedicinePicker selected={medicine} onSelect={setMedicine} disabled={saving} t={t} />
        </Field>

        <div className={"flex flex-col gap-1.5"}>
          <span className={"text-sm font-medium text-foreground"}>{add.stock}</span>
          <SegmentedControl
            options={stockOptions}
            value={stockStatus}
            onChange={setStockStatus}
            ariaLabel={add.stock}
            disabled={saving}
          />
        </div>

        <Field label={add.price} htmlFor={"inventory-price"} hint={add.priceHint}>
          <Input
            id={"inventory-price"}
            inputMode={"decimal"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={add.pricePlaceholder}
            disabled={saving}
          />
        </Field>

        <div>
          <Button type={"submit"} loading={saving}>
            {saving ? add.saving : add.save}
          </Button>
        </div>
      </form>
    </Card>
  );
}
