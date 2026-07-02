import { z } from "zod";

export const updateListingStatusSchema = z.object({
  isListed: z.boolean(),
});

export type UpdateListingStatusInput = z.infer<
  typeof updateListingStatusSchema
>;
