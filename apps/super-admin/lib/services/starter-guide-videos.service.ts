import { api, type Paginated } from "../api";
import type {
  StarterGuideVideo,
  StarterGuideVideoListItem,
  CreateStarterGuideVideoInput,
  UpdateStarterGuideVideoInput,
  PresignStarterGuideVideoUploadInput,
  StarterGuideVideoPresignResult,
} from "@beaconu/types";

export const starterGuideVideosService = {
  presignUpload: (data: PresignStarterGuideVideoUploadInput) =>
    api.post<StarterGuideVideoPresignResult>(
      "/api/v1/admin/starter-guide/videos/presign",
      data,
    ),

  list: (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<Paginated<StarterGuideVideoListItem>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    query.set("limit", String(params?.limit ?? 20));
    return api.getPaginated<StarterGuideVideoListItem>(
      `/api/v1/admin/starter-guide/videos?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<StarterGuideVideo>(`/api/v1/admin/starter-guide/videos/${id}`),

  create: (data: CreateStarterGuideVideoInput) =>
    api.post<StarterGuideVideo>("/api/v1/admin/starter-guide/videos", data),

  update: (id: string, data: UpdateStarterGuideVideoInput) =>
    api.patch<StarterGuideVideo>(
      `/api/v1/admin/starter-guide/videos/${id}`,
      data,
    ),

  deactivate: (id: string) =>
    api.patch<StarterGuideVideo>(
      `/api/v1/admin/starter-guide/videos/${id}/deactivate`,
      {},
    ),

  activate: (id: string) =>
    api.patch<StarterGuideVideo>(
      `/api/v1/admin/starter-guide/videos/${id}/activate`,
      {},
    ),
};
