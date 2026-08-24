import { api, type Paginated } from "../api";
import type {
  VideoTestimonial,
  CreateVideoTestimonialInput,
  UpdateVideoTestimonialInput,
} from "@beaconu/types";

export const videoTestimonialsService = {
  list: (params?: {
    page?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<Paginated<VideoTestimonial>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    query.set("limit", String(params?.limit ?? 20));
    return api.getPaginated<VideoTestimonial>(
      `/api/v1/admin/video-testimonials?${query.toString()}`,
    );
  },

  getById: (id: string) =>
    api.get<VideoTestimonial>(`/api/v1/admin/video-testimonials/${id}`),

  create: (data: CreateVideoTestimonialInput) =>
    api.post<VideoTestimonial>("/api/v1/admin/video-testimonials", data),

  update: (id: string, data: UpdateVideoTestimonialInput) =>
    api.patch<VideoTestimonial>(`/api/v1/admin/video-testimonials/${id}`, data),

  deactivate: (id: string) =>
    api.patch<VideoTestimonial>(
      `/api/v1/admin/video-testimonials/${id}/deactivate`,
      {},
    ),

  activate: (id: string) =>
    api.patch<VideoTestimonial>(
      `/api/v1/admin/video-testimonials/${id}/activate`,
      {},
    ),
};
