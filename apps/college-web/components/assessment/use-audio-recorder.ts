"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { uploadAssessmentAudioFile } from "@/lib/services/assessment.service";
import { reencodeToWav } from "@/lib/audio-wav-encoder";

interface UseAudioRecorderOptions {
  onUploaded: (url: string) => void;
}

export function useAudioRecorder({ onUploaded }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setIsUploading(true);
        try {
          const wavBlob = await reencodeToWav(recordedBlob);
          const uploaded = await uploadAssessmentAudioFile(wavBlob);
          onUploaded(uploaded.url);
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setIsUploading(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast.error("Microphone access is required to record your answer");
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  return { isRecording, isUploading, start, stop };
}
