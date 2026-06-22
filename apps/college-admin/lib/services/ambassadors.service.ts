import { api } from "@/lib/api";
import type {
  CampusAmbassadorDto,
  CreateCampusAmbassadorInput,
} from "@beaconu/types";

export async function getAmbassadors(): Promise<CampusAmbassadorDto[]> {
  return api.get("/api/v1/college-admin/ambassadors");
}

export async function createAmbassador(
  data: CreateCampusAmbassadorInput,
): Promise<CampusAmbassadorDto> {
  return api.post("/api/v1/college-admin/ambassadors", data);
}
