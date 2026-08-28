"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import { DocumentRow } from "@/components/applications/file-preview";
import { useFormDetails, useUpdateDeclaration } from "@/hooks/use-application";

const declarationSchema = z.object({
  accepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the declaration to proceed",
  }),
  signature_url: z.string().trim().url("Please upload your signature"),
  place: z.string().trim().min(1, "Place is required").max(100),
  date: z.string().min(1, "Date is required"),
});

type DeclarationFormInput = z.infer<typeof declarationSchema>;

interface DeclarationFormProps {
  applicationId: string;
}

export function DeclarationForm({ applicationId }: DeclarationFormProps) {
  const { data: existing, isLoading } = useFormDetails(
    applicationId,
    "declaration",
    true,
  );
  const { mutate: save, isPending } = useUpdateDeclaration(applicationId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [signatureFileName, setSignatureFileName] = useState<string | null>(
    null,
  );

  const form = useForm<DeclarationFormInput>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      accepted: false,
      signature_url: "",
      place: "",
      date: "",
    },
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      accepted: existing.accepted ?? false,
      signature_url: existing.signature_url ?? "",
      place: existing.place ?? "",
      date: existing.date ? existing.date.slice(0, 10) : "",
    });
    if (existing.signature_url) {
      setSignatureFileName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  async function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      form.setValue("signature_url", uploaded.url, { shouldValidate: true });
      setSignatureFileName(uploaded.fileName);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  function onSubmit(data: DeclarationFormInput) {
    save(data, {
      onSuccess: () => {
        toast.success("Declaration saved");
      },
    });
  }

  const signatureUrl = useWatch({
    control: form.control,
    name: "signature_url",
  });

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-muted" />;
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-2xl border border-border/60 bg-background p-5"
    >
      <IconSectionHeader
        icon={ShieldCheck}
        title="Declaration"
        subLabel="Terms and Conditions"
      />
      <p className="text-sm text-muted-foreground">
        I hereby declare that the information provided in this application is
        true and accurate to the best of my knowledge.
      </p>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Signature</label>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleSignatureChange}
        />
        {signatureUrl ? (
          <DocumentRow
            fileName={signatureFileName ?? "Signature"}
            fileUrl={signatureUrl}
            label="Signature"
            subLabel={signatureFileName ?? "Uploaded"}
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
            Upload signature
          </Button>
        )}
        {form.formState.errors.signature_url ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.signature_url.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Place" error={form.formState.errors.place?.message}>
          <Input {...form.register("place")} />
        </Field>

        <Field label="Date" error={form.formState.errors.date?.message}>
          <Input type="date" {...form.register("date")} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox {...form.register("accepted")} />I agree to the terms and
        conditions stated above and certify that all the information provided in
        this application is correct and authentic.
      </label>
      {form.formState.errors.accepted ? (
        <p className="text-xs text-destructive">
          {form.formState.errors.accepted.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-headerTeal-dark text-base font-semibold text-white shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Declaration
      </Button>
    </form>
  );
}
