import { z } from "zod";

export const listMediumsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListMediumsQueryInput = z.infer<typeof listMediumsQuerySchema>;
