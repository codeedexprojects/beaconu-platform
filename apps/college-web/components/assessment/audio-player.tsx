"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentAudioPlayerProps {
  src: string;
  size?: "default" | "large";
  className?: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function AssessmentAudioPlayer({
  src,
  size = "large",
  className,
}: AssessmentAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function handleTimeUpdate() {
      if (audio) setCurrentTime(audio.currentTime);
    }
    function handleEnded() {
      setIsPlaying(false);
      setCurrentTime(0);
    }
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  function cycleSpeed() {
    const nextIndex = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIndex);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[nextIndex];
  }

  const isLarge = size === "large";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        !isLarge && "flex-row gap-3",
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-2 border-headerTeal-dark bg-headerTeal/10 text-headerTeal transition-transform active:scale-95",
          isLarge ? "h-20 w-20" : "h-10 w-10",
        )}
      >
        {isPlaying ? (
          <Pause
            className={isLarge ? "h-7 w-7" : "h-4 w-4"}
            fill="currentColor"
          />
        ) : (
          <Play
            className={cn(isLarge ? "h-7 w-7" : "h-4 w-4", "ml-0.5")}
            fill="currentColor"
          />
        )}
      </button>
      <div
        className={cn("flex items-center gap-2", isLarge && "flex-col gap-1.5")}
      >
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          {formatTime(currentTime)}
        </span>
        <button
          type="button"
          onClick={cycleSpeed}
          className="rounded-full bg-field px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-field-focus"
        >
          {SPEEDS[speedIndex]}x
        </button>
      </div>
    </div>
  );
}
