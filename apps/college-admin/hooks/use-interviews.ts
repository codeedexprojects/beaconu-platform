import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getInterviewSlots,
  createInterviewSlot,
  updateInterviewSlot,
  cancelInterviewSlot,
  getInterviewBookings,
  completeInterview,
  getInterviewReschedules,
  reviewInterviewReschedule,
  shortlistCourse,
} from "@/lib/services/interviews.service";
import type {
  CreateInterviewSlotInput,
  UpdateInterviewSlotInput,
  CompleteInterviewInput,
  ReviewInterviewRescheduleInput,
} from "@beaconu/types";

export function useInterviewSlots(filters?: {
  mode?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewSlots(filters),
    queryFn: () => getInterviewSlots(filters),
  });
}

export function useCreateInterviewSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInterviewSlotInput) => createInterviewSlot(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewSlots(),
      });
    },
  });
}

export function useUpdateInterviewSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInterviewSlotInput;
    }) => updateInterviewSlot(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewSlots(),
      });
    },
  });
}

export function useCancelInterviewSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelInterviewSlot(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewSlots(),
      });
    },
  });
}

export function useInterviewBookings(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewBookings(status),
    queryFn: () => getInterviewBookings(status),
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

export function useInterviewReschedules(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.interviewReschedules(status),
    queryFn: () => getInterviewReschedules(status),
  });
}

export function useReviewInterviewReschedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ReviewInterviewRescheduleInput;
    }) => reviewInterviewReschedule(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewReschedules(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewSlots(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewBookings(),
      });
    },
  });
}

export function useShortlistCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationCourseId: string) =>
      shortlistCourse(applicationCourseId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.interviewBookings(),
      });
    },
  });
}
