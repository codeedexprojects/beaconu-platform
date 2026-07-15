"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  context: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  context,
  label,
  className,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadImage, isUploading } = useUpload();

  async function handleFile(file: File) {
    const url = await uploadImage(file, context);
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
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          value ? "h-36" : "h-28",
          dragOver && "border-primary bg-primary/5",
          !dragOver && "border-input hover:border-primary/50 hover:bg-muted/30",
          disabled || isUploading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Uploading…</span>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="h-full w-full rounded-lg object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="absolute right-1.5 top-1.5 rounded-full bg-destructive/90 p-0.5 text-white hover:bg-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground px-4 text-center">
            <div className="rounded-full bg-muted p-2">
              <Upload className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">Click or drag to upload</span>
            <span className="text-[10px]">
              JPEG, PNG, WebP, SVG · max 10 MB
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
