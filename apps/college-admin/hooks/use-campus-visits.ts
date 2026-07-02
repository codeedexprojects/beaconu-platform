import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCollegeCampusVisits,
  getCollegeCampusVisit,
  getCollegeCampusVisitStats,
  getCampusVisitAvailability,
  upsertCampusVisitAvailability,
  type AdminVisitFilters,
} from "@/lib/services/campus-visits.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";

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

export function useCollegeCampusVisitStats() {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisitStats,
    queryFn: () => getCollegeCampusVisitStats(),
  });
}

export function useCampusVisitAvailability() {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisitAvailability,
    queryFn: () => getCampusVisitAvailability(),
  });
}

export function useUpsertCampusVisitAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertCampusVisitAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.campusVisitAvailability,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
