import { z } from "zod";
import { DOCUMENT_MIME_TYPES } from "./document-upload-config.validator";

export const registerApplicationDocumentSchema = z.object({
  document_type: z.string().trim().min(1, "Document type is required"),
  file_url: z.string().trim().min(1, "File URL is required"),
  file_name: z.string().trim().max(255).optional().nullable(),
  file_size_bytes: z.number().int().min(1).optional().nullable(),
  mime_type: z.enum(DOCUMENT_MIME_TYPES as unknown as [string, ...string[]]),
});

export type RegisterApplicationDocumentInput = z.infer<
  typeof registerApplicationDocumentSchema
>;
