"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HelpCircle,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import { inventoryApi } from "@/lib/pharmacy-api";
import type { BulkSummary, BulkUploadResponse } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { interpolate, useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MiB (matches backend maxUploadBytes)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Pre-filled CSV template matching the exact header required by POST /dashboard/{pharmacyId}/listings/bulk-upload */
const CSV_TEMPLATE_CONTENT =
  "\uFEFF" +
  "medicine_name,generic_name,dosage_form,strength,stock_status,price\n" +
  "Panadol,Paracetamol,tablet,500mg,in_stock,45.00\n" +
  "Amoxil,Amoxicillin,capsule,500mg,in_stock,120.50\n" +
  "Brufen,Ibuprofen,tablet,400mg,low_stock,85.00\n" +
  ",Omeprazole,capsule,20mg,out_of_stock,\n";

export function BulkUploadForm({
  pharmacyID,
  onUploaded,
}: {
  pharmacyID: string;
  onUploaded: (summary: BulkSummary) => void;
}) {
  const { t } = useLanguage();
  const bulk = t.dashboard.inventory.bulk;

  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<BulkUploadResponse | null>(null);
  const [showGuide, setShowGuide] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  function handleFileSelect(selectedFile: File | null) {
    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv") && selectedFile.type !== "text/csv") {
      setError(bulk.invalidFileType);
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_BYTES) {
      setError(bulk.fileTooLarge);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(droppedFile);
  }

  function handleDownloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pharmalink_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError(bulk.noFileSelected);
      return;
    }

    setUploading(true);
    try {
      const response = await inventoryApi.bulkUpload(pharmacyID, file);
      setResult(response);
      onUploaded(response.summary);
      if (response.summary.failed === 0) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className={"p-5"}>
      <div className={"flex flex-col gap-4"}>
        <div className={"flex flex-wrap items-start justify-between gap-2"}>
          <div>
            <h2 className={"font-semibold tracking-tight"}>{bulk.heading}</h2>
            <p className={"mt-1 text-sm text-muted-foreground"}>{bulk.description}</p>
          </div>
          <button
            type={"button"}
            onClick={handleDownloadTemplate}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            <Download className={"size-3.5 text-primary-strong"} aria-hidden />
            {bulk.templateLabel}
          </button>
        </div>

        {error && <Alert variant={"danger"}>{error}</Alert>}

        {result && (
          <div className={"space-y-3"}>
            {result.summary.failed === 0 ? (
              <Alert variant={"success"}>
                {interpolate(bulk.successAll, { count: result.summary.succeeded })}
              </Alert>
            ) : result.summary.succeeded > 0 ? (
              <Alert variant={"warning"}>
                {interpolate(bulk.partialSuccess, {
                  succeeded: result.summary.succeeded,
                  total: result.summary.totalRows,
                  failed: result.summary.failed,
                })}
              </Alert>
            ) : (
              <Alert variant={"danger"}>
                {interpolate(bulk.failedAll, { failed: result.summary.failed })}
              </Alert>
            )}

            {/* Metrics cards */}
            <div className={"grid grid-cols-3 gap-2 text-center"}>
              <div className={"rounded-md border border-border bg-muted/40 p-2.5"}>
                <p className={"text-xs text-muted-foreground"}>{bulk.totalRows}</p>
                <p className={"mt-0.5 text-base font-semibold text-foreground"}>
                  {result.summary.totalRows}
                </p>
              </div>
              <div className={"rounded-md border border-border bg-muted/40 p-2.5"}>
                <p className={"text-xs text-muted-foreground"}>{bulk.succeededRows}</p>
                <p className={"mt-0.5 text-base font-semibold text-primary-strong"}>
                  {result.summary.succeeded}
                </p>
              </div>
              <div className={"rounded-md border border-border bg-muted/40 p-2.5"}>
                <p className={"text-xs text-muted-foreground"}>{bulk.failedRows}</p>
                <p
                  className={cn(
                    "mt-0.5 text-base font-semibold",
                    result.summary.failed > 0 ? "text-destructive" : "text-foreground",
                  )}
                >
                  {result.summary.failed}
                </p>
              </div>
            </div>

            {/* Per-row errors list */}
            {result.errors.length > 0 && (
              <div className={"space-y-2"}>
                <p className={"text-xs font-semibold text-destructive"}>
                  {interpolate(bulk.errorsTitle, { count: result.errors.length })}
                </p>
                <div className={"max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border bg-card text-xs"}>
                  {result.errors.map((err, idx) => (
                    <div key={`${err.row}-${err.field}-${idx}`} className={"p-3 transition-colors hover:bg-muted/30"}>
                      <div className={"flex items-center gap-2 font-medium"}>
                        <span className={"inline-flex items-center rounded bg-destructive/10 px-1.5 py-0.5 text-destructive"}>
                          {interpolate(bulk.rowNumber, { row: err.row })}
                        </span>
                        <span className={"text-muted-foreground"}>
                          {interpolate(bulk.fieldLabel, { field: err.field })}
                        </span>
                      </div>
                      <p className={"mt-1 text-foreground"}>{err.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={"flex justify-end pt-1"}>
              <Button type={"button"} variant={"outline"} size={"sm"} onClick={handleReset}>
                <RotateCcw className={"size-3.5 mr-1.5"} aria-hidden />
                {t.common.cancel}
              </Button>
            </div>
          </div>
        )}

        {(!result || result.summary.failed > 0) && (
          <form onSubmit={handleUpload} noValidate className={"space-y-4"}>
            <input
              ref={fileInputRef}
              type={"file"}
              accept={".csv,text/csv,application/vnd.ms-excel"}
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className={"sr-only"}
              id={"bulk-file-input"}
              disabled={uploading}
            />

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role={"button"}
                tabIndex={0}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  isDragging
                    ? "border-primary bg-primary-subtle"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div className={"flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                  <UploadCloud className={"size-6"} aria-hidden />
                </div>
                <p className={"mt-3 text-sm font-medium text-foreground"}>
                  {bulk.dropzonePrompt}
                </p>
                <p className={"mt-1 text-xs text-muted-foreground"}>{bulk.dropzoneHint}</p>
              </div>
            ) : (
              <div className={"flex items-center justify-between rounded-lg border border-border bg-card p-4"}>
                <div className={"flex items-center gap-3 overflow-hidden"}>
                  <div className={"flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-strong"}>
                    <FileSpreadsheet className={"size-5"} aria-hidden />
                  </div>
                  <div className={"min-w-0"}>
                    <p className={"truncate text-sm font-medium text-foreground"}>{file.name}</p>
                    <p className={"text-xs text-muted-foreground"}>
                      {interpolate(bulk.fileSize, { size: formatFileSize(file.size) })}
                    </p>
                  </div>
                </div>
                <button
                  type={"button"}
                  onClick={handleReset}
                  disabled={uploading}
                  className={cn(
                    "ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
                    "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  )}
                  aria-label={bulk.removeFile}
                >
                  <X className={"size-4"} aria-hidden />
                </button>
              </div>
            )}

            {/* Toggleable Format Requirements */}
            <div>
              <button
                type={"button"}
                onClick={() => setShowGuide((prev) => !prev)}
                className={"inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"}
              >
                <HelpCircle className={"size-3.5"} aria-hidden />
                {bulk.formatGuideTitle}
              </button>

              {showGuide && (
                <div className={"mt-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5"}>
                  <p className={"font-medium text-foreground"}>{bulk.formatGuideColumns}</p>
                  <p className={"font-mono text-[11px] text-foreground bg-muted p-1.5 rounded"}>
                    medicine_name,generic_name,dosage_form,strength,stock_status,price
                  </p>
                  <p>
                    <span className={"font-medium text-foreground"}>
                      {bulk.formatGuideStatuses}
                    </span>{" "}
                    <code className={"rounded bg-muted px-1 py-0.5 font-mono text-[11px]"}>
                      in_stock
                    </code>
                    ,{" "}
                    <code className={"rounded bg-muted px-1 py-0.5 font-mono text-[11px]"}>
                      low_stock
                    </code>
                    ,{" "}
                    <code className={"rounded bg-muted px-1 py-0.5 font-mono text-[11px]"}>
                      out_of_stock
                    </code>
                  </p>
                  <p>{bulk.formatGuidePrice}</p>
                </div>
              )}
            </div>

            <div className={"flex items-center justify-end gap-3 pt-2"}>
              {file && (
                <Button
                  type={"button"}
                  variant={"outline"}
                  size={"sm"}
                  onClick={handleReset}
                  disabled={uploading}
                >
                  {t.common.cancel}
                </Button>
              )}
              <Button
                type={"submit"}
                variant={"primary"}
                size={"sm"}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Spinner className={"mr-2 size-4"} />
                    {bulk.uploading}
                  </>
                ) : (
                  <>
                    <UploadCloud className={"size-4 mr-1.5"} aria-hidden />
                    {bulk.upload}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
