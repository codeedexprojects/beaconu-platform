import { useQuery } from "@tanstack/react-query";
import {
  getCollegeCampusVisits,
  getCollegeCampusVisit,
  type AdminVisitFilters,
} from "@/lib/services/campus-visits.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCollegeCampusVisits(filters: AdminVisitFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisits(filters),
    queryFn: () => getCollegeCampusVisits(filters),
  });
}

export function useCollegeCampusVisit(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisit(id),
    queryFn: () => getCollegeCampusVisit(id),
    enabled: !!id,
  });
}
