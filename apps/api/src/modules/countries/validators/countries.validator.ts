import { z } from "zod";

export const listCountriesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(300).default(300),
});

export type ListCountriesQueryInput = z.infer<typeof listCountriesQuerySchema>;
