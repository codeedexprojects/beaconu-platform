import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getApplications,
  getApplicationById,
  type ApplicationListFilters,
} from "@/lib/services/applications.service";

export function useApplications(filters: ApplicationListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.applications(filters),
    queryFn: () => getApplications(filters),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.application(id),
    queryFn: () => getApplicationById(id),
    enabled: !!id,
  });
}
