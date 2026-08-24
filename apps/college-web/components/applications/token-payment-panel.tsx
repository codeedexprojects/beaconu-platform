"use client";

import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import { DocumentRow } from "@/components/applications/file-preview";
import {
  usePayTokenOnline,
  useOfflineTokenPaymentStatus,
  useSubmitOfflineTokenPayment,
  useResubmitOfflineTokenPayment,
} from "@/hooks/use-payment";
import type { ApplicationAmountDetails } from "@beaconu/types";

const offlinePaymentSchema = z
  .object({
    payment_method: z.enum(["demand_draft", "bank_transfer"]),
    proof_url: z.string().trim().url("Please upload proof of payment"),
    proof_file_name: z.string().optional(),
    dd_number: z.string().trim().optional(),
    dd_bank_name: z.string().trim().optional(),
    dd_date: z.string().optional(),
    bank_ref_number: z.string().trim().optional(),
    note: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.payment_method !== "demand_draft" ||
      (!!data.dd_number && !!data.dd_bank_name && !!data.dd_date),
    {
      message: "DD number, bank name, and date are required",
      path: ["dd_number"],
    },
  )
  .refine(
    (data) => data.payment_method !== "bank_transfer" || !!data.bank_ref_number,
    {
      message: "Bank reference number is required",
      path: ["bank_ref_number"],
    },
  );

type OfflinePaymentFormInput = z.infer<typeof offlinePaymentSchema>;

interface TokenPaymentPanelProps {
  applicationId: string;
  amountDetails: ApplicationAmountDetails;
}

export function TokenPaymentPanel({
  applicationId,
  amountDetails,
}: TokenPaymentPanelProps) {
  const applicationCourseId = amountDetails.applicationCourseId ?? "";
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  const { mutate: payOnline, isPending: isPayingOnline } = usePayTokenOnline(
    applicationId,
    applicationCourseId,
  );
  const { data: offlineStatus, isLoading: isLoadingOfflineStatus } =
    useOfflineTokenPaymentStatus(
      applicationCourseId,
      !!applicationCourseId && amountDetails.paymentMethods.offline,
    );
  const { mutate: submitOffline, isPending: isSubmitting } =
    useSubmitOfflineTokenPayment(applicationId, applicationCourseId);
  const { mutate: resubmitOffline, isPending: isResubmitting } =
    useResubmitOfflineTokenPayment(applicationId, applicationCourseId);

  const form = useForm<OfflinePaymentFormInput>({
    resolver: zodResolver(offlinePaymentSchema),
    defaultValues: {
      payment_method: "demand_draft",
      proof_url: "",
      dd_number: "",
      dd_bank_name: "",
      dd_date: "",
      bank_ref_number: "",
      note: "",
    },
  });

  const paymentMethod = useWatch({
    control: form.control,
    name: "payment_method",
  });
  const proofUrl = useWatch({ control: form.control, name: "proof_url" });

  async function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      form.setValue("proof_url", uploaded.url, { shouldValidate: true });
      setProofFileName(uploaded.fileName);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  function onSubmitOffline(data: OfflinePaymentFormInput) {
    const input = {
      payment_method: data.payment_method,
      amount: Number(amountDetails.tokenAmount ?? 0),
      proof_url: data.proof_url,
      proof_file_name: data.proof_file_name ?? proofFileName ?? undefined,
      dd_number:
        data.payment_method === "demand_draft"
          ? (data.dd_number ?? null)
          : null,
      dd_bank_name:
        data.payment_method === "demand_draft"
          ? (data.dd_bank_name ?? null)
          : null,
      dd_date:
        data.payment_method === "demand_draft" ? (data.dd_date ?? null) : null,
      bank_ref_number:
        data.payment_method === "bank_transfer"
          ? (data.bank_ref_number ?? null)
          : null,
      note: data.note || null,
    };

    const isResubmit = offlineStatus?.verificationStatus === "rejected";
    const mutate = isResubmit ? resubmitOffline : submitOffline;
    mutate(input, {
      onSuccess: () => {
        toast.success(
          isResubmit
            ? "Payment resubmitted for review"
            : "Payment submitted for review",
        );
        setShowOfflineForm(false);
      },
    });
  }

  if (!applicationCourseId) return null;

  // Offline submission already exists and isn't rejected — show its status
  // instead of the form.
  if (
    offlineStatus &&
    offlineStatus.verificationStatus !== "rejected" &&
    !showOfflineForm
  ) {
    return (
      <div className="mt-3 rounded-xl border border-border/60 p-3">
        <p className="text-sm font-medium text-foreground">
          Offline payment{" "}
          {offlineStatus.verificationStatus === "verified"
            ? "verified"
            : "under review"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Submitted via{" "}
          {offlineStatus.paymentMethod === "demand_draft"
            ? "Demand Draft"
            : "Bank Transfer"}
          {offlineStatus.transactionNumber
            ? ` · ${offlineStatus.transactionNumber}`
            : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {amountDetails.tokenAmount ? (
        <div className="rounded-xl border border-border/60 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Token Fee</span>
            <span className="font-semibold text-foreground">
              ₹{amountDetails.tokenAmount}
            </span>
          </div>
        </div>
      ) : null}

      {offlineStatus?.verificationStatus === "rejected" && !showOfflineForm ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-sm font-medium text-destructive">
            Payment rejected
          </p>
          {offlineStatus.rejectionReason ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {offlineStatus.rejectionReason}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowOfflineForm(true)}
            className="mt-3 h-9 rounded-full text-xs"
          >
            Resubmit Payment
          </Button>
        </div>
      ) : null}

      {amountDetails.paymentMethods.online ? (
        <Button
          type="button"
          onClick={() => payOnline()}
          disabled={isPayingOnline}
          className="h-11 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-sm font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
        >
          {isPayingOnline ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Pay Online
        </Button>
      ) : null}

      {amountDetails.paymentMethods.offline && !isLoadingOfflineStatus ? (
        !showOfflineForm ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowOfflineForm(true)}
            className="h-11 w-full rounded-full"
          >
            Pay Offline
          </Button>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmitOffline)}
            noValidate
            className="space-y-3 rounded-xl border border-border/60 p-3"
          >
            <Field label="Payment Method">
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  form.setValue(
                    "payment_method",
                    v as OfflinePaymentFormInput["payment_method"],
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand_draft">Demand Draft</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {paymentMethod === "demand_draft" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="DD Number"
                  error={form.formState.errors.dd_number?.message}
                >
                  <Input {...form.register("dd_number")} />
                </Field>
                <Field
                  label="Bank Name"
                  error={form.formState.errors.dd_bank_name?.message}
                >
                  <Input {...form.register("dd_bank_name")} />
                </Field>
                <Field
                  label="Date"
                  error={form.formState.errors.dd_date?.message}
                >
                  <Input type="date" {...form.register("dd_date")} />
                </Field>
              </div>
            ) : (
              <Field
                label="Bank Reference Number"
                error={form.formState.errors.bank_ref_number?.message}
              >
                <Input {...form.register("bank_ref_number")} />
              </Field>
            )}

            <Field label="Note" optional>
              <Input {...form.register("note")} />
            </Field>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Proof of Payment
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleProofChange}
              />
              {proofUrl ? (
                <DocumentRow
                  fileName={proofFileName ?? "Proof of payment"}
                  fileUrl={proofUrl}
                  label="Proof of Payment"
                  subLabel={proofFileName ?? "Uploaded"}
                  onUpload={() => fileInputRef.current?.click()}
                  isUploading={isUploading}
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-fit rounded-full"
                >
                  {isUploading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Upload proof
                </Button>
              )}
              {form.formState.errors.proof_url ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.proof_url.message}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowOfflineForm(false)}
                className="h-11 rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isResubmitting}
                className="h-11 flex-1 rounded-full"
              >
                {isSubmitting || isResubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Payment
              </Button>
            </div>
          </form>
        )
      ) : null}
    </div>
  );
}
