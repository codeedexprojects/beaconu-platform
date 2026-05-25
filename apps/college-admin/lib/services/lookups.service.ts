import { api } from "../api";

export interface LookupOption {
  id: string;
  name: string;
}

export interface Stream extends LookupOption {
  disciplines: LookupOption[];
}

export async function getStreams(): Promise<Stream[]> {
  return api.get<Stream[]>("/api/v1/college-admin/lookups/streams");
}

export async function getStudyLevels(): Promise<LookupOption[]> {
  return api.get<LookupOption[]>("/api/v1/college-admin/lookups/study-levels");
}

export async function getProgramTypes(): Promise<LookupOption[]> {
  return api.get<LookupOption[]>("/api/v1/college-admin/lookups/program-types");
}

export async function getUniversities(): Promise<LookupOption[]> {
  return api.get<LookupOption[]>("/api/v1/college-admin/lookups/universities");
}
