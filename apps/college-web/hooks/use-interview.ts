import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ApiError, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import {
  bookInterviewSlot,
  cancelMyInterviewBooking,
  getMyInterviewBooking,
  listAvailableInterviewSlots,
  requestInterviewReschedule,
} from "@/lib/services/interview.service";
import type {
  BookInterviewSlotInput,
  RequestInterviewRescheduleInput,
} from "@beaconu/types";

interface SlotFilters {
  mode?: "gmeet" | "on_campus";
  scheduledDate?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAvailableInterviewSlots(
  collegeId: string,
  filters: SlotFilters,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewSlots(collegeId, filters),
    queryFn: () => listAvailableInterviewSlots(collegeId, filters),
    enabled,
  });
}

// No booking yet is a normal, expected state (not an error) — the backend
// 404s when the application has no booking, so that specific status is
// treated as "null data" rather than surfaced as a query error.
export function useMyInterviewBooking(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.myInterviewBooking(applicationId),
    queryFn: async () => {
      try {
        return await getMyInterviewBooking(applicationId);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled,
  });
}

export function useBookInterviewSlot(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookInterviewSlotInput) => bookInterviewSlot(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myInterviewBooking(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCancelInterviewBooking(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => cancelMyInterviewBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myInterviewBooking(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRequestInterviewReschedule(
  bookingId: string,
  applicationId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RequestInterviewRescheduleInput) =>
      requestInterviewReschedule(bookingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myInterviewBooking(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
