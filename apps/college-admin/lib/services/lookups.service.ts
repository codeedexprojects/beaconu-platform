import { api } from "../api";

export const lookupsService = {
  getStreams: () => api.get<any[]>("/api/v1/college-admin/lookups/streams"),
  getStudyLevels: () =>
    api.get<any[]>("/api/v1/college-admin/lookups/study-levels"),
  getProgramTypes: () =>
    api.get<any[]>("/api/v1/college-admin/lookups/program-types"),
  getUniversities: () =>
    api.get<any[]>("/api/v1/college-admin/lookups/universities"),
};
