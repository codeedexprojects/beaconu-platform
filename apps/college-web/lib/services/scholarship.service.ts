import { api } from "@/lib/api";
import type {
  CreateScholarshipApplicationInput,
  ScholarshipApplicationItem,
  ScholarshipConfigItem,
} from "@beaconu/types";

export async function listScholarshipConfigs(
  collegeId: string,
  activeOnly = true,
): Promise<ScholarshipConfigItem[]> {
  return api.get(
    `/api/v1/student/scholarships/configs?college_id=${collegeId}&active_only=${activeOnly}`,
  );
}

export async function applyForScholarship(
  input: CreateScholarshipApplicationInput,
): Promise<ScholarshipApplicationItem> {
  return api.post("/api/v1/student/scholarships/applications", input);
}

export async function listMyScholarshipApplications(): Promise<
  ScholarshipApplicationItem[]
> {
  return api.get("/api/v1/student/scholarships/applications");
}
