"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVideoUpload } from "@/hooks/use-video-upload";

const MAX_DURATION_SECS = 30;

interface ShortVideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  context: string;
  disabled?: boolean;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read video metadata"));
    };
    video.src = URL.createObjectURL(file);
  });
}

/** Video file picker enforcing a max duration (client-side check via
 * video element metadata) before uploading through the generic
 * presign → S3 → verify flow. */
export function ShortVideoUpload({
  value,
  onChange,
  context,
  disabled,
}: ShortVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadVideo, isUploading, progress } = useVideoUpload();
  const [checkingDuration, setCheckingDuration] = useState(false);

  async function handleFile(file: File) {
    setCheckingDuration(true);
    try {
      const duration = await readVideoDuration(file);
      if (duration > MAX_DURATION_SECS) {
        toast.error(
          `Video must be ${MAX_DURATION_SECS} seconds or shorter (this one is ${Math.round(duration)}s)`,
        );
        return;
      }
    } catch {
      toast.error("Could not read this video file. Try a different file.");
      return;
    } finally {
      setCheckingDuration(false);
    }

    const url = await uploadVideo(file, context);
    if (url) onChange(url);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const busy = isUploading || checkingDuration;

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors h-28",
          "border-input hover:border-primary/50 hover:bg-muted/30",
          disabled || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        {busy ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">
              {checkingDuration
                ? "Checking video…"
                : progress === "verifying"
                  ? "Verifying…"
                  : "Uploading…"}
            </span>
          </div>
        ) : value ? (
          <>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Video className="h-4 w-4 text-primary" />
              <span className="font-medium">Video uploaded</span>
            </div>
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
            <span className="text-xs font-medium">Click to upload a video</span>
            <span className="text-[10px]">
              MP4, WebM or MOV · max {MAX_DURATION_SECS}s
            </span>
          </div>
        )}
      </div>

      {value && (
        <video
          src={value}
          controls
          className="w-full rounded-md max-h-56 bg-black"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled || busy}
      />
    </div>
  );
}
