"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideoUpload } from "@/hooks/use-video-upload";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  context: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function VideoUpload({
  value,
  onChange,
  context,
  label,
  className,
  disabled,
}: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadVideo, isUploading, progress } = useVideoUpload();

  async function handleFile(file: File) {
    const url = await uploadVideo(file, context);
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

  const statusLabel =
    progress === "uploading"
      ? "Uploading…"
      : progress === "verifying"
        ? "Processing…"
        : null;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}

      {/* Upload zone — always visible; compact when a video is already set */}
      <div
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors h-20",
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
            <span className="text-xs">{statusLabel}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span className="text-xs font-medium">
              {value ? "Replace video" : "Click or drag to upload"}
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              MP4, WebM, MOV · 500 MB max
            </span>
          </div>
        )}
      </div>

      {/* Video preview */}
      {value && !isUploading && (
        <div className="relative rounded-lg overflow-hidden border bg-black">
          <video
            src={value}
            controls
            className="w-full max-h-64 rounded-lg"
            preload="metadata"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
              title="Remove video"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* URL fallback */}
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
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
