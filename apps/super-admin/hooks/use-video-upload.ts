import { useState } from "react";
import { toast } from "sonner";
import { uploadService } from "@/lib/services/upload.service";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<"uploading" | "verifying" | null>(
    null,
  );

  async function uploadVideo(
    file: File,
    context: string,
  ): Promise<string | null> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only MP4, WebM and MOV videos are allowed");
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Video must be under 500 MB");
      return null;
    }

    setIsUploading(true);
    setProgress("uploading");
    try {
      const { uploadUrl, key } = await uploadService.presign(
        file.type,
        file.size,
        context,
      );
      await uploadService.putToS3(uploadUrl, file);
      setProgress("verifying");
      const { permanentUrl } = await uploadService.verify(key);
      return permanentUrl;
    } catch {
      toast.error("Video upload failed. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }

  return { uploadVideo, isUploading, progress };
}
