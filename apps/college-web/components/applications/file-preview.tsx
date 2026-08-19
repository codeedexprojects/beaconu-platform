"use client";

import {
  Eye,
  File,
  FileImage,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(url);
}

export function FilePreview({ url }: { url: string }) {
  if (!url) return null;

  if (isImageUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-fit overflow-hidden rounded-2xl bg-field p-1"
      >
        <img
          src={url}
          alt="Uploaded document preview"
          className="h-24 w-24 rounded-xl object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-fit items-center gap-2 rounded-full bg-field px-4 py-2.5 text-sm text-foreground hover:bg-field-focus"
    >
      <FileText className="h-4 w-4" />
      View uploaded file
    </a>
  );
}

function FileTypeIcon({ mimeType }: { mimeType?: string }) {
  if (mimeType?.startsWith("image/")) {
    return <FileImage className="h-4 w-4" />;
  }
  if (!mimeType || mimeType === "application/pdf") {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
}

interface DocumentRowProps {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  label?: string;
  subLabel?: string;
  isRequired?: boolean;
  onUpload?: () => void;
  onRemove?: () => void;
  isUploading?: boolean;
}

export function DocumentRow({
  fileName,
  fileUrl,
  mimeType,
  label,
  subLabel,
  isRequired,
  onUpload,
  onRemove,
  isUploading,
}: DocumentRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-field px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
          <FileTypeIcon mimeType={mimeType} />
        </div>
        <div className="min-w-0">
          {label ? (
            <p className="truncate text-sm font-medium text-foreground">
              {label}
              {isRequired ? (
                <span className="ml-1 text-destructive">*</span>
              ) : null}
            </p>
          ) : null}
          <p className="truncate text-xs text-muted-foreground">
            {subLabel ?? fileName}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </a>
        ) : null}
        {fileUrl && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onUpload}
            disabled={isUploading}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground",
              isUploading && "cursor-not-allowed opacity-50",
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
