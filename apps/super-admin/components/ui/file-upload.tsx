"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/use-file-upload";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  context: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  context,
  label,
  className,
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadFile, isUploading } = useFileUpload();

  async function handleFile(file: File) {
    const url = await uploadFile(file, context);
    if (url) onChange(url);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const fileName = value
    ? decodeURIComponent(value.split("/").pop() ?? value)
    : "";

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex h-14 items-center gap-3 rounded-lg border-2 border-dashed px-3 transition-colors",
          dragOver && "border-primary bg-primary/5",
          !dragOver && "border-input hover:border-primary/50 hover:bg-muted/30",
          disabled || isUploading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        )}
      >
        {isUploading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Uploading…</span>
          </div>
        ) : value ? (
          <>
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs text-foreground">{fileName}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="ml-auto shrink-0 rounded-full bg-destructive/90 p-0.5 text-white hover:bg-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span className="text-xs font-medium">
              Click or drag to upload PDF · max 10 MB
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
