import { z } from "zod";
import { LEGAL_DOCUMENT_TYPES } from "@beaconu/types";

export const legalDocTypeParamSchema = z.object({
  docType: z.enum(LEGAL_DOCUMENT_TYPES),
});

export const upsertLegalDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  content: z.string().trim().min(1, "Content is required"),
  document_url: z.string().trim().url().optional().nullable(),
  effective_from: z.string().date().optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
});

export const setLegalDocumentStatusSchema = z.object({
  status: z.enum(["draft", "published"]),
});

export type UpsertLegalDocumentBody = z.infer<typeof upsertLegalDocumentSchema>;
export type SetLegalDocumentStatusBody = z.infer<
  typeof setLegalDocumentStatusSchema
>;
