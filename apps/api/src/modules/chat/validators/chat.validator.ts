import { z } from "zod";

export const listAmbassadorsQuerySchema = z.object({
  college_id: z.string().min(1, "College is required"),
});

export const startConversationSchema = z.object({
  ambassador_id: z.string().min(1, "Ambassador is required"),
});

// Chat is user-to-user (unlike this codebase's other upload flows, which
// are all admin/self-uploads the same account then trusts back) — a
// malicious sender's attachment URL is rendered/opened on a *different*
// person's device, so this must reject javascript:/data: and anything
// that isn't a real https URL, not just check for a non-empty string.
const attachmentSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Attachment URL must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Attachment URL must be https",
    }),
  file_name: z.string().trim().max(255).optional(),
  mime_type: z.string().trim().max(100).optional(),
});

export const sendMessageSchema = z
  .object({
    message: z.string().trim().max(4000).optional(),
    attachments: z.array(attachmentSchema).max(10).optional(),
  })
  .refine(
    (val) => !!val.message || (val.attachments && val.attachments.length > 0),
    {
      message: "A message or at least one attachment is required",
    },
  );

export const chatPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListAmbassadorsQuery = z.infer<typeof listAmbassadorsQuerySchema>;
export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ChatPaginationQuery = z.infer<typeof chatPaginationQuerySchema>;
