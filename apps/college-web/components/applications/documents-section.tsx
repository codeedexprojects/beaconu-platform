"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import {
  useRegisterDocuments,
  useRequiredDocuments,
} from "@/hooks/use-application";
import { DocumentRow } from "@/components/applications/file-preview";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import type { RequiredDocumentDto } from "@beaconu/types";

interface DocumentsSectionProps {
  applicationId: string;
  onSaved?: () => void;
}

function RequiredDocumentRow({
  document,
  applicationId,
}: {
  document: RequiredDocumentDto;
  applicationId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: register } = useRegisterDocuments(applicationId);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      register(
        [
          {
            document_type: document.documentType,
            file_url: uploaded.url,
            file_name: uploaded.fileName,
            file_size_bytes: uploaded.fileSize,
            mime_type: uploaded.fileType,
          },
        ],
        {
          onSuccess: () => {
            toast.success(`${document.documentLabel} uploaded`);
          },
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={document.acceptedMimeTypes.join(",")}
        onChange={handleFileChange}
      />
      <DocumentRow
        fileName={document.uploaded?.fileName ?? document.documentLabel}
        fileUrl={document.uploaded?.fileUrl ?? ""}
        label={document.documentLabel}
        subLabel={
          document.uploaded
            ? `${document.uploaded.fileName ?? "Uploaded"} · ${document.uploaded.verificationStatus}`
            : "Not uploaded"
        }
        isRequired={document.isRequired}
        onUpload={() => fileInputRef.current?.click()}
        isUploading={isUploading}
      />
    </>
  );
}

export function DocumentsSection({
  applicationId,
  onSaved,
}: DocumentsSectionProps) {
  const {
    data: documents,
    isLoading,
    error,
  } = useRequiredDocuments(applicationId, true);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl border bg-muted" />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{getErrorMessage(error)}</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5">
      <IconSectionHeader
        icon={FileText}
        title="Documents"
        subLabel="Identity & Category Proofs"
      />
      {(documents ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No documents are required for this application.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {(documents ?? []).map((document) => (
            <RequiredDocumentRow
              key={document.documentType}
              document={document}
              applicationId={applicationId}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        onClick={() => onSaved?.()}
        className="h-14 w-full rounded-full border-0 bg-headerTeal-dark text-base font-semibold text-white shadow-md hover:opacity-95"
      >
        Continue
      </Button>
    </div>
  );
}
