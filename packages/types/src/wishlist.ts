import type { PaginationMeta } from "./api";

export interface WishlistCollegeItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  city: string | null;
  state: string | null;
  avgRating: number;
  reviewCount: number;
  courseId: string | null;
  courseName: string | null;
  wishlistedAt: string;
}

export interface AddWishlistInput {
  college_id: string;
  course_id?: string;
}

export interface WishlistListResponse {
  colleges: WishlistCollegeItem[];
  meta: PaginationMeta;
}
