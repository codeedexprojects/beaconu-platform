import { api } from "@/lib/api";
import type {
  ScholarshipConfigItem,
  CreateScholarshipConfigInput,
  UpdateScholarshipConfigInput,
  ScholarshipApplicationItem,
  ReviewScholarshipApplicationInput,
} from "@beaconu/types";

const BASE = "/api/v1/college-admin/scholarships";

export function getScholarshipConfigs(): Promise<ScholarshipConfigItem[]> {
  return api.get(`${BASE}/configs`);
}

export function createScholarshipConfig(
  data: CreateScholarshipConfigInput,
): Promise<ScholarshipConfigItem> {
  return api.post(`${BASE}/configs`, data);
}

export function updateScholarshipConfig(
  id: string,
  data: UpdateScholarshipConfigInput,
): Promise<ScholarshipConfigItem> {
  return api.patch(`${BASE}/configs/${id}`, data);
}

export function getScholarshipApplications(
  status?: string,
): Promise<ScholarshipApplicationItem[]> {
  const qs = status ? `?status=${status}` : "";
  return api.get(`${BASE}/applications${qs}`);
}

export function reviewScholarshipApplication(
  id: string,
  data: ReviewScholarshipApplicationInput,
): Promise<ScholarshipApplicationItem> {
  return api.patch(`${BASE}/applications/${id}/review`, data);
}
