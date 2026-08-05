import { api } from "@/lib/api";
import type {
  InterviewSlotItem,
  CreateInterviewSlotInput,
  UpdateInterviewSlotInput,
  InterviewBookingItem,
  CompleteInterviewInput,
  InterviewRescheduleItem,
  ReviewInterviewRescheduleInput,
  InterviewSettingsItem,
  UpdateInterviewSettingsInput,
  ShortlistCourseInput,
  OfferLetterItem,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/interviews";

export function getInterviewSlots(filters?: {
  mode?: string;
  status?: string;
}): Promise<InterviewSlotItem[]> {
  const query = new URLSearchParams();
  if (filters?.mode) query.set("mode", filters.mode);
  if (filters?.status) query.set("status", filters.status);
  const qs = query.toString();
  return api.get(`${BASE}/slots${qs ? `?${qs}` : ""}`);
}

export function createInterviewSlot(
  data: CreateInterviewSlotInput,
): Promise<InterviewSlotItem> {
  return api.post(`${BASE}/slots`, data);
}

export function updateInterviewSlot(
  id: string,
  data: UpdateInterviewSlotInput,
): Promise<InterviewSlotItem> {
  return api.patch(`${BASE}/slots/${id}`, data);
}

export function cancelInterviewSlot(id: string): Promise<InterviewSlotItem> {
  return api.patch(`${BASE}/slots/${id}/cancel`, {});
}

export function getInterviewBookings(
  status?: string,
): Promise<InterviewBookingItem[]> {
  const qs = status ? `?status=${status}` : "";
  return api.get(`${BASE}/bookings${qs}`);
}

export function completeInterview(
  id: string,
  data: CompleteInterviewInput,
): Promise<InterviewBookingItem> {
  return api.patch(`${BASE}/bookings/${id}/complete`, data);
}

export function getInterviewReschedules(
  status?: string,
): Promise<InterviewRescheduleItem[]> {
  const qs = status ? `?status=${status}` : "";
  return api.get(`${BASE}/reschedules${qs}`);
}

export function reviewInterviewReschedule(
  id: string,
  data: ReviewInterviewRescheduleInput,
): Promise<InterviewRescheduleItem> {
  return api.patch(`${BASE}/reschedules/${id}/review`, data);
}

export function shortlistCourse(
  applicationCourseId: string,
  data: ShortlistCourseInput,
): Promise<OfferLetterItem> {
  return api.patch(`${BASE}/courses/${applicationCourseId}/shortlist`, data);
}

export function getInterviewSettings(): Promise<InterviewSettingsItem> {
  return api.get(`${BASE}/settings`);
}

export function updateInterviewSettings(
  data: UpdateInterviewSettingsInput,
): Promise<InterviewSettingsItem> {
  return api.patch(`${BASE}/settings`, data);
}
