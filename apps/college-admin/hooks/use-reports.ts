import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getEnrollmentOverview,
  getAdmissionsFunnel,
  getAgeGenderInsights,
  getGeographicOrigin,
} from "@/lib/services/reports.service";

export function useEnrollmentOverview(admissionCycleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reportEnrollmentOverview(admissionCycleId),
    queryFn: () => getEnrollmentOverview(admissionCycleId),
  });
}

export function useAdmissionsFunnel(admissionCycleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reportFunnel(admissionCycleId),
    queryFn: () => getAdmissionsFunnel(admissionCycleId),
  });
}

export function useAgeGenderInsights(admissionCycleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reportDemographics(admissionCycleId),
    queryFn: () => getAgeGenderInsights(admissionCycleId),
  });
}

export function useGeographicOrigin(admissionCycleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reportGeography(admissionCycleId),
    queryFn: () => getGeographicOrigin(admissionCycleId),
  });
}
