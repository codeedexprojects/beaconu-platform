import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./upload.constants";

export const presignBodySchema = z.object({
  mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]], {
    error: "Allowed types: image/jpeg, image/png, image/webp, application/pdf",
  }),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, "File size must not exceed 10 MB"),
});

export const verifyBodySchema = z.object({
  key: z.string().min(1, "Key is required"),
});

export const removeBodySchema = z.object({
  key: z.string().min(1, "Key is required"),
});
