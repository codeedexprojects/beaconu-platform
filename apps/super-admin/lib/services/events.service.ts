import { api, type Paginated } from "../api";
import type {
  EventListItem,
  EventDetail,
  EventRegistrationDetail,
  CreateEventInput,
  UpdateEventInput,
  UploadRecordingInput,
} from "@beaconu/types";

export const eventsService = {
  list: (params?: {
    status?: string;
    category?: string;
    event_mode?: string;
    search?: string;
    is_free?: string;
    has_recording?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<EventListItem>> => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.category) query.set("category", params.category);
    if (params?.event_mode) query.set("event_mode", params.event_mode);
    if (params?.search) query.set("search", params.search);
    if (params?.is_free) query.set("is_free", params.is_free);
    if (params?.has_recording) query.set("has_recording", params.has_recording);
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 10));
    return api.getPaginated<EventListItem>(
      `/api/v1/admin/events?${query.toString()}`,
    );
  },

  getById: (id: string) => api.get<EventDetail>(`/api/v1/admin/events/${id}`),

  create: (data: CreateEventInput) =>
    api.post<EventDetail>("/api/v1/admin/events", data),

  update: (id: string, data: UpdateEventInput) =>
    api.patch<EventDetail>(`/api/v1/admin/events/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<EventDetail>(`/api/v1/admin/events/${id}/status`, { status }),

  softDelete: (id: string) =>
    api.delete<EventDetail>(`/api/v1/admin/events/${id}`),

  uploadRecording: (id: string, data: UploadRecordingInput) =>
    api.patch<EventDetail>(`/api/v1/admin/events/${id}/recording`, data),

  listRegistrations: (
    eventId: string,
    params?: { page?: number; limit?: number },
  ): Promise<Paginated<EventRegistrationDetail>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    query.set("limit", String(params?.limit ?? 10));
    return api.getPaginated<EventRegistrationDetail>(
      `/api/v1/admin/events/${eventId}/registrations?${query.toString()}`,
    );
  },
};
