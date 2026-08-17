import { z } from "zod";
import { DOCUMENT_MIME_TYPES } from "./document-upload-config.validator";

const documentEntrySchema = z.object({
  document_type: z.string().trim().min(1, "Document type is required"),
  file_url: z.string().trim().min(1, "File URL is required"),
  file_name: z.string().trim().max(255).optional().nullable(),
  file_size_bytes: z.number().int().min(1).optional().nullable(),
  mime_type: z.enum(DOCUMENT_MIME_TYPES as unknown as [string, ...string[]]),
});

export const registerApplicationDocumentsSchema = z.object({
  documents: z
    .array(documentEntrySchema)
    .min(1, "At least one document is required"),
});

export type RegisterApplicationDocumentInput = z.infer<
  typeof documentEntrySchema
>;
export type RegisterApplicationDocumentsInput = z.infer<
  typeof registerApplicationDocumentsSchema
>;
