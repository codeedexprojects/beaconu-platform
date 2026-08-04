import { useState } from "react";
import { toast } from "sonner";
import { uploadService } from "@/lib/services/upload.service";

const ALLOWED_TYPES = ["application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFile(
    file: File,
    context: string,
  ): Promise<string | null> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PDF files are allowed");
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be under 10 MB");
      return null;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, key } = await uploadService.presign(
        file.type,
        file.size,
        context,
      );
      await uploadService.putToS3(uploadUrl, file);
      const { permanentUrl } = await uploadService.verify(key);
      return permanentUrl;
    } catch {
      toast.error("Upload failed. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { uploadFile, isUploading };
}
