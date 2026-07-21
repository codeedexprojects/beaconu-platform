import type { PaginationMeta } from "./api";

export type MediaKitAssetType = "poster" | "video" | "brochure";
export type MediaKitScope = "campus_wide" | "course_specific";

export interface MediaKitCourseRef {
  id: string;
  name: string;
  code: string;
}

export interface MediaKitCollegeRef {
  id: string;
  name: string;
}

export interface MediaKit {
  id: string;
  collegeId: string;
  courseId: string | null;
  course: MediaKitCourseRef | null;
  title: string;
  assetType: MediaKitAssetType;
  scope: MediaKitScope;
  fileUrl: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaKitListItem extends MediaKit {
  college?: MediaKitCollegeRef;
}

export interface CreateMediaKitInput {
  title: string;
  asset_type: MediaKitAssetType;
  scope: MediaKitScope;
  course_id?: string;
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
  thumbnail_url?: string;
  sort_order?: number;
}

export interface UpdateMediaKitInput {
  title?: string;
  sort_order?: number;
  is_active?: boolean;
  thumbnail_url?: string;
}

export interface MediaKitListFilters {
  asset_type?: MediaKitAssetType;
  scope?: MediaKitScope;
  course_id?: string;
  college_id?: string;
  page?: number;
  limit?: number;
}

export interface MediaKitListResponse {
  items: MediaKitListItem[];
  meta: PaginationMeta;
}
