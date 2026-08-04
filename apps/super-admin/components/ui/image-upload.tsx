"use client";

import { useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/use-upload";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { getCroppedImageFile } from "@/lib/crop-image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  context: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  aspect?: number;
}

export function ImageUpload({
  value,
  onChange,
  context,
  label,
  className,
  disabled,
  aspect,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingCrop, setPendingCrop] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const { uploadFile, isUploading } = useUpload();

  async function handleFile(file: File) {
    if (aspect) {
      if (file.type === "image/svg+xml") {
        toast.error("SVG is not allowed here. Upload a JPEG, PNG or WebP.");
        return;
      }
      setPendingCrop({ file, previewUrl: URL.createObjectURL(file) });
      return;
    }
    const url = await uploadFile(file, context);
    if (url) onChange(url);
  }

  async function handleCropConfirm(cropArea: Area) {
    if (!pendingCrop) return;
    try {
      const cropped = await getCroppedImageFile(
        pendingCrop.previewUrl,
        cropArea,
        pendingCrop.file.name,
        pendingCrop.file.type,
      );
      const url = await uploadFile(cropped, context);
      if (url) onChange(url);
    } catch {
      toast.error("Failed to crop image. Please try a different image.");
    } finally {
      URL.revokeObjectURL(pendingCrop.previewUrl);
      setPendingCrop(null);
    }
  }

  function handleCropCancel() {
    if (pendingCrop) URL.revokeObjectURL(pendingCrop.previewUrl);
    setPendingCrop(null);
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
              {aspect ? "JPEG, PNG, WebP" : "JPEG, PNG, WebP, SVG"} · max 10 MB
            </span>
          </div>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://... (or upload above)"
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
      />

      <input
        ref={inputRef}
        type="file"
        accept={
          aspect
            ? "image/jpeg,image/png,image/webp"
            : "image/jpeg,image/png,image/webp,image/svg+xml"
        }
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || isUploading}
      />

      {pendingCrop && aspect && (
        <ImageCropDialog
          imageSrc={pendingCrop.previewUrl}
          aspect={aspect}
          loading={isUploading}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
