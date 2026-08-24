"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import { DocumentRow } from "@/components/applications/file-preview";
import {
  useAvailableScholarships,
  useApplyForScholarship,
} from "@/hooks/use-scholarships";
import type {
  ScholarshipConfigItem,
  ScholarshipSupportingDocument,
} from "@beaconu/types";

const applySchema = z.object({
  reason: z.string().trim().min(1, "Please tell us why you're applying"),
  annual_family_income_range: z
    .string()
    .trim()
    .min(1, "This field is required"),
});

type ApplyFormInput = z.infer<typeof applySchema>;

interface ScholarshipApplyDialogProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  collegeId: string;
}

function DocumentUploadSlot({
  documentName,
  uploaded,
  onUploaded,
}: {
  documentName: string;
  uploaded: ScholarshipSupportingDocument | undefined;
  onUploaded: (doc: ScholarshipSupportingDocument) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadApplicationDocumentFile(file);
      onUploaded({ documentName, fileUrl: result.url });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleChange}
      />
      {uploaded ? (
        <DocumentRow
          fileName={documentName}
          fileUrl={uploaded.fileUrl}
          label={documentName}
          subLabel="Uploaded"
          onUpload={() => fileInputRef.current?.click()}
          isUploading={isUploading}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full justify-start rounded-xl"
        >
          {isUploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Upload {documentName}
        </Button>
      )}
    </div>
  );
}

export function ScholarshipApplyDialog({
  open,
  onClose,
  applicationId,
  collegeId,
}: ScholarshipApplyDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: configs, isLoading } = useAvailableScholarships(
    collegeId,
    open,
  );
  const { mutate: apply, isPending } = useApplyForScholarship(applicationId);
  const [selected, setSelected] = useState<ScholarshipConfigItem | null>(null);
  const [documents, setDocuments] = useState<ScholarshipSupportingDocument[]>(
    [],
  );

  const form = useForm<ApplyFormInput>({
    resolver: zodResolver(applySchema),
    defaultValues: { reason: "", annual_family_income_range: "" },
  });

  function reset() {
    setSelected(null);
    setDocuments([]);
    form.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleUploaded(doc: ScholarshipSupportingDocument) {
    setDocuments((prev) => [
      ...prev.filter((d) => d.documentName !== doc.documentName),
      doc,
    ]);
  }

  function onSubmit(data: ApplyFormInput) {
    if (!selected) return;
    const missing = selected.requiredDocuments.filter(
      (name) => !documents.some((d) => d.documentName === name),
    );
    if (missing.length > 0) {
      toast.error(`Please upload: ${missing.join(", ")}`);
      return;
    }
    apply(
      {
        scholarship_config_id: selected.id,
        application_id: applicationId,
        reason: data.reason,
        annual_family_income_range: data.annual_family_income_range,
        supporting_documents: documents,
      },
      {
        onSuccess: () => {
          toast.success("Scholarship application submitted");
          handleClose();
        },
      },
    );
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border/60 bg-background p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {selected ? selected.name : "Apply for a Scholarship"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : !selected ? (
          <div className="space-y-2">
            {(configs ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scholarships are currently available for this college.
              </p>
            ) : (
              configs?.map((config) => (
                <button
                  key={config.id}
                  type="button"
                  onClick={() => setSelected(config)}
                  className="flex w-full flex-col gap-1 rounded-2xl border border-border/60 p-3 text-left hover:bg-field"
                >
                  <span className="text-sm font-medium text-foreground">
                    {config.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {config.discountType === "percentage"
                      ? `${config.discountValue}% off`
                      : `₹${config.discountValue} off`}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <Field label="Reason" error={form.formState.errors.reason?.message}>
              <textarea
                rows={4}
                {...form.register("reason")}
                placeholder="Why are you applying for this scholarship?"
                className="w-full rounded-2xl border-0 bg-field px-4 py-3 text-sm text-foreground outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-accentOrange/40"
              />
            </Field>

            <Field
              label="Annual Family Income Range"
              error={form.formState.errors.annual_family_income_range?.message}
            >
              <Input
                {...form.register("annual_family_income_range")}
                placeholder="e.g. 2,00,000 - 5,00,000"
              />
            </Field>

            {selected.requiredDocuments.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Required Documents
                </p>
                {selected.requiredDocuments.map((docName) => (
                  <DocumentUploadSlot
                    key={docName}
                    documentName={docName}
                    uploaded={documents.find((d) => d.documentName === docName)}
                    onUploaded={handleUploaded}
                  />
                ))}
              </div>
            ) : null}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelected(null)}
                className="h-11 rounded-full"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 flex-1 rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-sm font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
