import { api } from "@/lib/api";
import type {
  CampusAmbassadorDto,
  CampusAmbassadorDetailDto,
  CreateCampusAmbassadorInput,
  UpdateCampusAmbassadorInput,
} from "@beaconu/types";

export async function getAmbassadors(): Promise<CampusAmbassadorDto[]> {
  return api.get("/api/v1/college-admin/ambassadors");
}

export async function getAmbassador(
  id: string,
): Promise<CampusAmbassadorDetailDto> {
  return api.get(`/api/v1/college-admin/ambassadors/${id}`);
}

export async function createAmbassador(
  data: CreateCampusAmbassadorInput,
): Promise<CampusAmbassadorDto> {
  return api.post("/api/v1/college-admin/ambassadors", data);
}

export async function updateAmbassador(
  id: string,
  data: UpdateCampusAmbassadorInput,
): Promise<CampusAmbassadorDto> {
  return api.patch(`/api/v1/college-admin/ambassadors/${id}`, data);
}
