import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import {
  arriveCampusVisit,
  bookCampusVisit,
  cancelCampusVisit,
  getVisitAvailability,
  listMyCampusVisits,
  rescheduleCampusVisit,
} from "@/lib/services/campus-visit.service";
import { toast } from "sonner";
import type {
  CancelCampusVisitInput,
  CreateCampusVisitInput,
  RescheduleCampusVisitInput,
} from "@beaconu/types";

export function useVisitAvailability(collegeId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.campusVisitAvailability(collegeId),
    queryFn: () => getVisitAvailability(collegeId),
    enabled,
  });
}

export function useMyCampusVisits(collegeId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.myCampusVisits(collegeId),
    queryFn: () => listMyCampusVisits({ college_id: collegeId, limit: 50 }),
    enabled,
  });
}

export function useBookCampusVisit(collegeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCampusVisitInput) => bookCampusVisit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myCampusVisits(collegeId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRescheduleCampusVisit(collegeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      input,
    }: {
      visitId: string;
      input: RescheduleCampusVisitInput;
    }) => rescheduleCampusVisit(visitId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myCampusVisits(collegeId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useArriveCampusVisit(collegeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => arriveCampusVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myCampusVisits(collegeId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCancelCampusVisit(collegeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      input,
    }: {
      visitId: string;
      input: CancelCampusVisitInput;
    }) => cancelCampusVisit(visitId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myCampusVisits(collegeId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
