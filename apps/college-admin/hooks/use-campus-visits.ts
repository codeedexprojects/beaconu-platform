import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCollegeCampusVisits,
  getCollegeCampusVisit,
  getCollegeCampusVisitStats,
  getCampusVisitAvailability,
  upsertCampusVisitAvailability,
  getCampusVisitSettings,
  upsertCampusVisitSettings,
  getCampusVisitCalendar,
  addCampusVisitDateOverride,
  removeCampusVisitDateOverride,
  cancelCampusVisitByAdmin,
  cancelCampusVisitsForDate,
  type AdminVisitFilters,
} from "@/lib/services/campus-visits.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import type {
  CancelCampusVisitByAdminInput,
  BulkCancelVisitsForDateInput,
  CreateCampusVisitDateOverrideInput,
} from "@beaconu/types";

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

export function useCampusVisitSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisitSettings,
    queryFn: () => getCampusVisitSettings(),
  });
}

export function useUpsertCampusVisitSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertCampusVisitSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.campusVisitSettings,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCampusVisitCalendar(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisitCalendar(year, month),
    queryFn: () => getCampusVisitCalendar(year, month),
  });
}

function invalidateCalendarAndVisits(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({
    queryKey: ["college-campus-visit-calendar"],
  });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campusVisits() });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campusVisitStats });
}

export function useAddCampusVisitDateOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampusVisitDateOverrideInput) =>
      addCampusVisitDateOverride(data),
    onSuccess: () => invalidateCalendarAndVisits(queryClient),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRemoveCampusVisitDateOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (overrideId: string) =>
      removeCampusVisitDateOverride(overrideId),
    onSuccess: () => invalidateCalendarAndVisits(queryClient),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelCampusVisitByAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: string;
      data: CancelCampusVisitByAdminInput;
    }) => cancelCampusVisitByAdmin(visitId, data),
    onSuccess: () => invalidateCalendarAndVisits(queryClient),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelCampusVisitsForDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCancelVisitsForDateInput) =>
      cancelCampusVisitsForDate(data),
    onSuccess: () => invalidateCalendarAndVisits(queryClient),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
