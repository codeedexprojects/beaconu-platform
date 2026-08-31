import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getInterviewBookings,
  getInterviewBooking,
  getInterviewCandidate,
  getPanelAvailability,
  scheduleInterview,
  completeInterview,
  cancelInterview,
  shortlistCourse,
  type InterviewBookingFilters,
} from "@/lib/services/interviews.service";
import type {
  CompleteInterviewInput,
  PanelAvailabilityQuery,
  ScheduleInterviewInput,
  ShortlistCourseInput,
} from "@beaconu/types";

export function useInterviewBookings(filters: InterviewBookingFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewBookings(filters),
    queryFn: () => getInterviewBookings(filters),
  });
}

export function useInterviewBooking(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewBooking(id),
    queryFn: () => getInterviewBooking(id),
    enabled: !!id,
  });
}

export function useInterviewCandidate(applicationId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewCandidate(applicationId),
    queryFn: () => getInterviewCandidate(applicationId),
    enabled: !!applicationId,
  });
}

export function usePanelAvailability(query: PanelAvailabilityQuery | null) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewPanelAvailability(query ?? {}),
    queryFn: () => getPanelAvailability(query!),
    enabled: !!query,
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: ScheduleInterviewInput;
    }) => scheduleInterview(applicationId, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewBookings(),
      });
    },
  });
}

export function useCompleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteInterviewInput }) =>
      completeInterview(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewBookings(),
      });
    },
  });
}

export function useCancelInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelInterview(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewBookings(),
      });
    },
  });
}

export function useShortlistCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationCourseId,
      data,
    }: {
      applicationCourseId: string;
      data: ShortlistCourseInput;
    }) => shortlistCourse(applicationCourseId, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewBookings(),
      });
    },
  });
}
