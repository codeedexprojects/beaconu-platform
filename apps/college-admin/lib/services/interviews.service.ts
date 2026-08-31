import { api } from "@/lib/api";
import type {
  InterviewBookingItem,
  InterviewApplicationDetail,
  PendingInterviewItem,
  PanelMemberAvailabilityItem,
  PanelAvailabilityQuery,
  ScheduleInterviewInput,
  CompleteInterviewInput,
  ShortlistCourseInput,
  OfferLetterItem,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/interviews";

export interface InterviewBookingFilters {
  status?: "pending" | "scheduled" | "completed" | "cancelled";
  search?: string;
}

export function getInterviewBookings(
  filters: InterviewBookingFilters,
): Promise<InterviewBookingItem[] | PendingInterviewItem[]> {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.search) query.set("search", filters.search);
  const qs = query.toString();
  return api.get(`${BASE}/bookings${qs ? `?${qs}` : ""}`);
}

export function getInterviewBooking(id: string): Promise<InterviewBookingItem> {
  return api.get(`${BASE}/bookings/${id}`);
}

export function getInterviewCandidate(
  applicationId: string,
): Promise<InterviewApplicationDetail> {
  return api.get(`${BASE}/applications/${applicationId}`);
}

export function getPanelAvailability(
  query: PanelAvailabilityQuery,
): Promise<PanelMemberAvailabilityItem[]> {
  const params = new URLSearchParams({
    scheduled_date: query.scheduled_date,
    start_time: query.start_time,
    end_time: query.end_time,
  });
  if (query.search) params.set("search", query.search);
  if (query.exclude_booking_id)
    params.set("exclude_booking_id", query.exclude_booking_id);
  return api.get(`${BASE}/panel-availability?${params.toString()}`);
}

export function scheduleInterview(
  applicationId: string,
  data: ScheduleInterviewInput,
): Promise<InterviewBookingItem> {
  return api.patch(`${BASE}/applications/${applicationId}/schedule`, data);
}

export function completeInterview(
  id: string,
  data: CompleteInterviewInput,
): Promise<InterviewBookingItem> {
  return api.patch(`${BASE}/bookings/${id}/complete`, data);
}

export function cancelInterview(id: string): Promise<InterviewBookingItem> {
  return api.patch(`${BASE}/bookings/${id}/cancel`, {});
}

export function shortlistCourse(
  applicationCourseId: string,
  data: ShortlistCourseInput,
): Promise<OfferLetterItem> {
  return api.patch(`${BASE}/courses/${applicationCourseId}/shortlist`, data);
}
