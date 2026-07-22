import { api } from "@/lib/api";
import type {
  CreateMediaKitInput,
  MediaKit,
  MediaKitListFilters,
  MediaKitListResponse,
  UpdateMediaKitInput,
} from "@beaconu/types";

export async function getMediaKits(
  filters?: MediaKitListFilters,
): Promise<MediaKitListResponse> {
  const query = new URLSearchParams();
  if (filters?.asset_type) query.set("asset_type", filters.asset_type);
  if (filters?.scope) query.set("scope", filters.scope);
  if (filters?.course_id) query.set("course_id", filters.course_id);
  if (filters?.page) query.set("page", String(filters.page));
  if (filters?.limit) query.set("limit", String(filters.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return api.get(`/api/v1/college-admin/media-kit${qs}`);
}

export async function createMediaKit(
  data: CreateMediaKitInput,
): Promise<MediaKit> {
  return api.post("/api/v1/college-admin/media-kit", data);
}

export async function updateMediaKit(
  id: string,
  data: UpdateMediaKitInput,
): Promise<MediaKit> {
  return api.patch(`/api/v1/college-admin/media-kit/${id}`, data);
}

export async function deleteMediaKit(id: string): Promise<void> {
  await api.delete(`/api/v1/college-admin/media-kit/${id}`);
}
