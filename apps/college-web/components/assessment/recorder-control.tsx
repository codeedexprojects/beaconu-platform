"use client";

import { Loader2, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecorderControlProps {
  isRecording: boolean;
  isUploading: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function RecorderControl({
  isRecording,
  isUploading,
  onStart,
  onStop,
  className,
}: RecorderControlProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        disabled={isUploading}
        onClick={isRecording ? onStop : onStart}
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full border-2 text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
          isRecording
            ? "border-destructive bg-destructive text-destructive-foreground animate-pulse"
            : "border-headerTeal-dark bg-headerTeal/10 text-headerTeal",
        )}
      >
        {isUploading ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : isRecording ? (
          <Square className="h-6 w-6" fill="currentColor" />
        ) : (
          <Mic className="h-7 w-7" />
        )}
      </button>
      <p className="text-xs font-medium text-muted-foreground">
        {isUploading
          ? "Uploading..."
          : isRecording
            ? "Recording — tap to stop"
            : "Tap to record"}
      </p>
    </div>
  );
}
