import { z } from "zod";

export const listCountriesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(300).default(300),
});

export type ListCountriesQueryInput = z.infer<typeof listCountriesQuerySchema>;

export const listStatesParamsSchema = z.object({
  countryCode: z.string().min(2).max(3),
});

export type ListStatesParamsInput = z.infer<typeof listStatesParamsSchema>;

export const listCitiesParamsSchema = z.object({
  countryCode: z.string().min(2).max(3),
  stateCode: z.string().min(1).max(10),
});

export type ListCitiesParamsInput = z.infer<typeof listCitiesParamsSchema>;
