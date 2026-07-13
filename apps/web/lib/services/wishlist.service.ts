import { api } from "@/lib/api";
import type { WishlistListResponse } from "@beaconu/types";

const WISHLIST_BASE = "/api/v1/student/wishlist";

export function getWishlist(
  page = 1,
  limit = 20,
): Promise<WishlistListResponse> {
  return api.get(`${WISHLIST_BASE}?page=${page}&limit=${limit}`);
}

export function addToWishlist(collegeId: string): Promise<{ added: true }> {
  return api.post(WISHLIST_BASE, { college_id: collegeId });
}

export function removeFromWishlist(
  collegeId: string,
): Promise<{ removed: true }> {
  return api.delete(`${WISHLIST_BASE}/${collegeId}`);
}
