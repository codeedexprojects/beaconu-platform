import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  campusVisitsService,
  type VisitListFilters,
} from "@/lib/services/campus-visits.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ApiError } from "@/lib/api";
import type {
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
  CancelCampusVisitInput,
} from "@beaconu/types";

function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError))
    return "Something went wrong. Please try again.";
  switch (error.status) {
    case 403:
      return "You don't have permission to do this";
    case 404:
      return "Visit not found";
    case 409:
    case 422:
      return error.message;
    default:
      return "Something went wrong. Please try again.";
  }
}

export function useCampusVisits(filters: VisitListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisits(filters),
    queryFn: () => campusVisitsService.list(filters),
  });
}

export function useCampusVisit(visitId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisit(visitId),
    queryFn: () => campusVisitsService.getOne(visitId),
    enabled: !!visitId,
  });
}

export function useAmbassadors(collegeId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ambassadors(collegeId),
    queryFn: () => campusVisitsService.listAmbassadors(collegeId),
    enabled: !!collegeId,
  });
}

export function useBookCampusVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampusVisitInput) =>
      campusVisitsService.book(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campusVisits() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRescheduleCampusVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: string;
      data: RescheduleCampusVisitInput;
    }) => campusVisitsService.reschedule(visitId, data),
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campusVisits() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.campusVisit(visitId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCancelCampusVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: string;
      data: CancelCampusVisitInput;
    }) => campusVisitsService.cancel(visitId, data),
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campusVisits() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.campusVisit(visitId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
