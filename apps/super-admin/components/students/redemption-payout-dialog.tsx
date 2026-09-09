"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Check, X, AlertTriangle, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api";
import { useRedemptionPayoutDetails } from "@/hooks/use-student-redemptions";

/** Fetches the decrypted account number only when opened. Fields are copyable
 * because these get typed into a banking portal by hand. */
export function RedemptionPayoutDialog({
  requestId,
  onClose,
}: {
  requestId: string | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const { data, isLoading, error } = useRedemptionPayoutDetails(requestId);

  async function copy(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Clipboard may be blocked; the value is on screen anyway.
    }
  }

  if (!requestId || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b p-5">
          <div>
            <h2 className="text-base font-semibold">Payout details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Transfer manually, then approve the request
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-1 py-6 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">{getErrorMessage(error)}</span>
            </div>
          ) : data ? (
            <>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Amount to transfer
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  ₹{data.amount.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.student.fullName}
                  {data.student.phoneNumber
                    ? ` · ${data.student.phoneNumber}`
                    : ""}
                </p>
              </div>

              {data.account ? (
                <div className="space-y-2">
                  <Field
                    label="Account holder"
                    value={data.account.accountHolderName}
                    copiedField={copiedField}
                    onCopy={copy}
                  />
                  <Field
                    label="Account number"
                    value={
                      data.account.accountNumber ??
                      `•••• ${data.account.accountNumberLast4}`
                    }
                    mono
                    unavailable={data.account.accountNumber === null}
                    copiedField={copiedField}
                    onCopy={copy}
                  />
                  <Field
                    label="IFSC"
                    value={data.account.ifscCode}
                    mono
                    copiedField={copiedField}
                    onCopy={copy}
                  />
                  <Field
                    label="Bank"
                    value={`${data.account.bankName} · ${data.account.accountType}`}
                    copiedField={copiedField}
                    onCopy={copy}
                  />

                  {data.account.accountNumber === null && (
                    <p className="flex items-start gap-1.5 rounded-md bg-amber-50 p-2.5 text-xs text-amber-800">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      The full account number could not be read. Ask the student
                      to re-add their bank account before paying out.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="flex items-start gap-1.5 rounded-md bg-amber-50 p-2.5 text-xs text-amber-800">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    The linked bank account no longer exists. Below is what was
                    recorded when the request was made.
                  </p>
                  {data.snapshot && (
                    <>
                      <Field
                        label="Account holder"
                        value={data.snapshot.accountHolderName}
                        copiedField={copiedField}
                        onCopy={copy}
                      />
                      <Field
                        label="Account number"
                        value={`•••• ${data.snapshot.accountNumberLast4}`}
                        mono
                        unavailable
                        copiedField={copiedField}
                        onCopy={copy}
                      />
                      <Field
                        label="IFSC"
                        value={data.snapshot.ifscCode}
                        mono
                        copiedField={copiedField}
                        onCopy={copy}
                      />
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>
                  Requested {new Date(data.requestedAt).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="capitalize">
                  {data.status}
                </Badge>
              </div>
            </>
          ) : null}
        </div>
      </Card>
    </div>,
    document.body,
  );
}

function Field({
  label,
  value,
  mono = false,
  unavailable = false,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  unavailable?: boolean;
  copiedField: string | null;
  onCopy: (field: string, value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={`truncate text-sm ${mono ? "font-mono" : ""} ${
            unavailable ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </div>
      {!unavailable && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => onCopy(label, value)}
        >
          {copiedField === label ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}
