import { useQuery } from "@tanstack/react-query";
import {
  getCollegeCampusVisits,
  type AdminVisitFilters,
} from "@/lib/services/campus-visits.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCollegeCampusVisits(filters: AdminVisitFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisits(filters),
    queryFn: () => getCollegeCampusVisits(filters),
  });
}
