import { api } from "@/lib/api";
import type {
  BookInterviewSlotInput,
  InterviewBookingItem,
  InterviewRescheduleItem,
  InterviewSlotItem,
  RequestInterviewRescheduleInput,
} from "@beaconu/types";

interface ListAvailableSlotsFilters {
  mode?: "gmeet" | "on_campus";
  scheduledDate?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// The backend controller (student.controller.ts listAvailableSlots) passes
// result.data and result.meta as SEPARATE arguments to ApiResponse.success,
// which puts them as sibling top-level fields in the envelope
// ({success, message, data, meta, timestamp}) rather than nesting meta
// inside data. api.get() only ever unwraps the envelope's `data` field, so
// what this function actually receives is the flat slot array itself, not
// a {data, meta} wrapper — meta (pagination info) is present in the raw
// HTTP response but currently unreachable through this client. If
// pagination becomes necessary later, this needs a dedicated fetch that
// reads both fields instead of going through api.get's single-field unwrap.
export async function listAvailableInterviewSlots(
  collegeId: string,
  filters: ListAvailableSlotsFilters = {},
): Promise<InterviewSlotItem[]> {
  const params = new URLSearchParams({ college_id: collegeId });
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.scheduledDate)
    params.set("scheduled_date", filters.scheduledDate);
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return api.get(`/api/v1/student/interviews/slots?${params.toString()}`);
}

export async function bookInterviewSlot(
  input: BookInterviewSlotInput,
): Promise<InterviewBookingItem> {
  return api.post("/api/v1/student/interviews/bookings", input);
}

export async function getMyInterviewBooking(
  applicationId: string,
): Promise<InterviewBookingItem> {
  return api.get(
    `/api/v1/student/interviews/bookings/application/${applicationId}`,
  );
}

export async function cancelMyInterviewBooking(
  bookingId: string,
): Promise<InterviewBookingItem> {
  return api.patch(
    `/api/v1/student/interviews/bookings/${bookingId}/cancel`,
    {},
  );
}

export async function requestInterviewReschedule(
  bookingId: string,
  input: RequestInterviewRescheduleInput,
): Promise<InterviewRescheduleItem> {
  return api.post(
    `/api/v1/student/interviews/bookings/${bookingId}/reschedule-requests`,
    input,
  );
}
