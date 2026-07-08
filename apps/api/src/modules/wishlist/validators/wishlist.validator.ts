import { z } from "zod";

export const addWishlistSchema = z.object({
  college_id: z.string().trim().min(1, "College is required"),
});

export const wishlistListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AddWishlistInput = z.infer<typeof addWishlistSchema>;
export type WishlistListQuery = z.infer<typeof wishlistListQuerySchema>;
