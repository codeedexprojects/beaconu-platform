import { api } from "@/lib/api";
import type {
  BookCampusVisitResponse,
  CampusVisit,
  CampusVisitAvailabilityEntry,
  CampusVisitListResponse,
  CampusVisitStatus,
  CancelCampusVisitInput,
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
} from "@beaconu/types";

export async function getVisitAvailability(
  collegeId: string,
): Promise<CampusVisitAvailabilityEntry[]> {
  return api.get(
    `/api/v1/student/campus-visits/availability?college_id=${collegeId}`,
  );
}

export async function bookCampusVisit(
  input: CreateCampusVisitInput,
): Promise<BookCampusVisitResponse> {
  return api.post("/api/v1/student/campus-visits", input);
}

export async function listMyCampusVisits(params?: {
  college_id?: string;
  status?: CampusVisitStatus;
  page?: number;
  limit?: number;
}): Promise<CampusVisitListResponse> {
  const query = new URLSearchParams();
  if (params?.college_id) query.set("college_id", params.college_id);
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : "";
  return api.get(`/api/v1/student/campus-visits${qs}`);
}

export async function getCampusVisitDetail(
  visitId: string,
): Promise<CampusVisit> {
  return api.get(`/api/v1/student/campus-visits/${visitId}`);
}

export async function rescheduleCampusVisit(
  visitId: string,
  input: RescheduleCampusVisitInput,
): Promise<void> {
  await api.patch(`/api/v1/student/campus-visits/${visitId}/reschedule`, input);
}

export async function cancelCampusVisit(
  visitId: string,
  input: CancelCampusVisitInput,
): Promise<void> {
  await api.patch(`/api/v1/student/campus-visits/${visitId}/cancel`, input);
}

export async function arriveCampusVisit(visitId: string): Promise<CampusVisit> {
  return api.patch(
    `/api/v1/student/campus-visits/${visitId}/arrive`,
    undefined,
  );
}
