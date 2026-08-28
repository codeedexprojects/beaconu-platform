"use client";

import { useAudioRecorder } from "@/components/assessment/use-audio-recorder";
import { RecorderControl } from "@/components/assessment/recorder-control";
import { AssessmentAudioPlayer } from "@/components/assessment/audio-player";
import type { QuestionRendererProps } from "./types";

export function AudioQuestion({ response, onChange }: QuestionRendererProps) {
  const { isRecording, isUploading, start, stop } = useAudioRecorder({
    onUploaded: (url) => onChange({ audioUrl: url }),
  });

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <RecorderControl
        isRecording={isRecording}
        isUploading={isUploading}
        onStart={start}
        onStop={stop}
      />
      {response.audioUrl ? (
        <AssessmentAudioPlayer
          src={response.audioUrl}
          size="default"
          className="w-full max-w-xs"
        />
      ) : null}
    </div>
  );
}
