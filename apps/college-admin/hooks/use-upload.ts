import { useState } from "react";
import { toast } from "sonner";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const DOCUMENT_TYPES = ["application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB (backend cap for all types)

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(
    file: File,
    context: string,
    allowedTypes: string[],
    typeErrorMessage: string,
  ): Promise<string | null> {
    if (!allowedTypes.includes(file.type)) {
      toast.error(typeErrorMessage);
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be under 10 MB");
      return null;
    }

    setIsUploading(true);
    try {
      return await uploadCollegeAdminFile(file, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return {
    isUploading,
    uploadImage: (file: File, context: string) =>
      upload(
        file,
        context,
        IMAGE_TYPES,
        "Only JPEG, PNG, WebP and SVG images are allowed",
      ),
    uploadDocument: (file: File, context: string) =>
      upload(file, context, DOCUMENT_TYPES, "Only PDF files are allowed"),
    uploadFile: upload,
  };
}
